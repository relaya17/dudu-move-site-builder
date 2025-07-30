import { db } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export class ReportService {
    static async generateDailyReport(date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const movesRef = collection(db, 'moves');
        const q = query(
            movesRef,
            where('date', '>=', Timestamp.fromDate(startOfDay)),
            where('date', '<=', Timestamp.fromDate(endOfDay))
        );

        const querySnapshot = await getDocs(q);
        const moves = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            date: date.toLocaleDateString('he-IL'),
            totalMoves: moves.length,
            totalRevenue: moves.reduce((sum, move: any) => sum + (move.price_estimate?.totalPrice || 0), 0),
            completedMoves: moves.filter((move: any) => move.status === 'completed').length,
            pendingMoves: moves.filter((move: any) => move.status === 'pending').length,
            moves: moves
        };
    }

    static async generateMonthlyReport(year: number, month: number) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const movesRef = collection(db, 'moves');
        const q = query(
            movesRef,
            where('date', '>=', Timestamp.fromDate(startOfMonth)),
            where('date', '<=', Timestamp.fromDate(endOfMonth))
        );

        const querySnapshot = await getDocs(q);
        const moves = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            month: startOfMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' }),
            totalMoves: moves.length,
            totalRevenue: moves.reduce((sum, move: any) => sum + (move.price_estimate?.totalPrice || 0), 0),
            averageMovePrice: moves.length > 0 ?
                moves.reduce((sum, move: any) => sum + (move.price_estimate?.totalPrice || 0), 0) / moves.length : 0,
            popularItems: this.getPopularItems(moves),
            busyDays: this.getBusyDays(moves),
            moves: moves
        };
    }

    static async exportToExcel(data: any, filename: string) {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }

    private static getPopularItems(moves: any[]) {
        const itemCount: { [key: string]: number } = {};
        moves.forEach(move => {
            move.furniture_items?.forEach((item: any) => {
                itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity;
            });
        });
        return Object.entries(itemCount)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));
    }

    private static getBusyDays(moves: any[]) {
        const dayCount: { [key: string]: number } = {};
        moves.forEach(move => {
            const day = new Date(move.date).toLocaleDateString('he-IL', { weekday: 'long' });
            dayCount[day] = (dayCount[day] || 0) + 1;
        });
        return Object.entries(dayCount)
            .map(([day, count]) => ({ day, count }))
            .sort((a, b) => b.count - a.count);
    }
}