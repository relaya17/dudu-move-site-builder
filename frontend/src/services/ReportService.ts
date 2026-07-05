import * as XLSX from 'xlsx';

const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

interface MoveDoc {
    id: string;
    status?: string;
    totalPrice?: number;
    createdAt?: string;
    preferredMoveDate?: string;
    inventory?: Array<{ type: string; quantity: number }>;
}

export class ReportService {
    private static extractRevenue(move: MoveDoc): number {
        return move.totalPrice ?? 0;
    }

    private static async fetchAllMoves(): Promise<MoveDoc[]> {
        const response = await fetch(`${API_ROOT}/api/mongo/estimates?limit=1000`);
        const result = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (result.data || []).map((e: any) => ({
            id: e._id,
            status: e.status,
            totalPrice: e.totalPrice,
            createdAt: e.createdAt,
            preferredMoveDate: e.preferredMoveDate,
            inventory: e.inventory
        }));
    }

    static async generateDailyReport(date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const allMoves = await this.fetchAllMoves();
        const moves = allMoves.filter(move => {
            if (!move.createdAt) return false;
            const createdAt = new Date(move.createdAt);
            return createdAt >= startOfDay && createdAt <= endOfDay;
        });

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
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const allMoves = await this.fetchAllMoves();
        const moves = allMoves.filter(move => {
            if (!move.createdAt) return false;
            const createdAt = new Date(move.createdAt);
            return createdAt >= startOfMonth && createdAt <= endOfMonth;
        });
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
            move.inventory?.forEach(item => {
                itemCount[item.type] = (itemCount[item.type] ?? 0) + item.quantity;
            });
        });
        return Object.entries(itemCount)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));
    }

    private static getBusyDays(moves: MoveDoc[]) {
        const dayCount: Record<string, number> = {};
        moves.forEach(move => {
            const rawDate = move.preferredMoveDate ?? move.createdAt;
            const date = new Date(rawDate || Date.now());
            const day = date.toLocaleDateString('he-IL', { weekday: 'long' });
            dayCount[day] = (dayCount[day] ?? 0) + 1;
        });
        return Object.entries(dayCount)
            .map(([day, count]) => ({ day, count }))
            .sort((a, b) => b.count - a.count);
    }
}
