import { db } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp, DocumentData } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface MoveDoc extends DocumentData {
  id: string;
  status?: string;
  price_estimate?: { totalPrice?: number };
  created_at?: { toDate?: () => Date } | string;
  preferred_move_date?: string;
  furniture_items?: Array<{ name: string; quantity: number }>;
}

export class ReportService {
    private static extractRevenue(move: MoveDoc): number {
        return move.price_estimate?.totalPrice ?? 0;
    }

    static async generateDailyReport(date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const movesRef = collection(db, 'moves');
        const q = query(
            movesRef,
            where('created_at', '>=', Timestamp.fromDate(startOfDay)),
            where('created_at', '<=', Timestamp.fromDate(endOfDay))
        );

        const querySnapshot = await getDocs(q);
        const moves: MoveDoc[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            date: date.toLocaleDateString('he-IL'),
            totalMoves: moves.length,
            totalRevenue: moves.reduce((sum, move) => sum + this.extractRevenue(move), 0),
            completedMoves: moves.filter(move => move.status === 'completed').length,
            pendingMoves: moves.filter(move => move.status === 'pending').length,
            moves,
        };
    }

    static async generateMonthlyReport(year: number, month: number) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const movesRef = collection(db, 'moves');
        const q = query(
            movesRef,
            where('created_at', '>=', Timestamp.fromDate(startOfMonth)),
            where('created_at', '<=', Timestamp.fromDate(endOfMonth))
        );

        const querySnapshot = await getDocs(q);
        const moves: MoveDoc[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        const totalRevenue = moves.reduce((sum, move) => sum + this.extractRevenue(move), 0);

        return {
            month: startOfMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }),
            totalMoves: moves.length,
            totalRevenue,
            averageMovePrice: moves.length > 0 ? totalRevenue / moves.length : 0,
            popularItems: this.getPopularItems(moves),
            busyDays: this.getBusyDays(moves),
            moves,
        };
    }

    static async exportToExcel(data: MoveDoc[], filename: string) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    private static getPopularItems(moves: MoveDoc[]) {
        const itemCount: Record<string, number> = {};
        moves.forEach(move => {
            move.furniture_items?.forEach(item => {
                itemCount[item.name] = (itemCount[item.name] ?? 0) + item.quantity;
            });
        });
        return Object.entries(itemCount)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));
    }

    private static getBusyDays(moves: MoveDoc[]) {
        const dayCount: Record<string, number> = {};
        moves.forEach(move => {
            const rawDate = move.preferred_move_date ?? move.created_at;
            const date = typeof rawDate === 'object' && rawDate && typeof (rawDate as { toDate?: () => Date }).toDate === 'function'
            ? (rawDate as { toDate: () => Date }).toDate()
            : new Date(typeof rawDate === 'string' ? rawDate : Date.now());
            const day = date.toLocaleDateString('he-IL', { weekday: 'long' });
            dayCount[day] = (dayCount[day] ?? 0) + 1;
        });
        return Object.entries(dayCount)
            .map(([day, count]) => ({ day, count }))
            .sort((a, b) => b.count - a.count);
    }
}