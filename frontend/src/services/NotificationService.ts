// שירות התראות על הובלות חדשות/דחופות/יקרות, לניהול הדשבורד.
// הוחלף מ-Firestore realtime listeners (שכבר לא מקבלים נתונים אמיתיים מאז המעבר ל-MongoDB)
// לפולינג תקופתי מול ה-API של MongoDB, עם מיפוי לאותו טיפוס Move כדי לא לשבור את השימוש הקיים.

import { Move } from '@/types/moveTypes';
import { MovingEstimateRequest } from '@/types/movingEstimate';

const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

const POLL_INTERVAL_MS = 20000;
const HIGH_VALUE_THRESHOLD = 5000;

type NotificationCallback = (move: Move) => void;
type UnsubscribeFunction = () => void;

function toMove(estimate: MovingEstimateRequest): Move {
    return {
        id: estimate._id,
        customer: { name: estimate.name, phone: estimate.phone, email: estimate.email },
        preferred_move_date: estimate.preferredMoveDate,
        created_at: estimate.createdAt,
        status: estimate.status === 'approved' ? 'approved'
            : estimate.status === 'completed' ? 'completed'
            : estimate.status === 'rejected' ? 'cancelled'
            : 'pending',
        price_estimate: { totalPrice: estimate.totalPrice },
        current_address: estimate.currentAddress,
        destination_address: estimate.destinationAddress,
        origin_floor: estimate.originFloor,
        destination_floor: estimate.destinationFloor,
        origin_has_elevator: estimate.originHasElevator,
        destination_has_elevator: estimate.destinationHasElevator,
        additional_notes: estimate.additionalNotes,
        apartment_type: estimate.apartmentType
    };
}

export class NotificationService {
    private static intervals: Record<string, ReturnType<typeof setInterval>> = {};
    private static notifiedIds: Record<string, Set<string>> = {
        newMoves: new Set(),
        urgentMoves: new Set(),
        highValueMoves: new Set()
    };
    private static initialized: Record<string, boolean> = {};

    private static async fetchEstimates(): Promise<MovingEstimateRequest[]> {
        try {
            const response = await fetch(`${API_ROOT}/api/mongo/estimates`);
            if (!response.ok) return [];
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('שגיאה בשליפת הזמנות עבור התראות:', error);
            return [];
        }
    }

    static subscribeToNewMoves(callback: NotificationCallback): UnsubscribeFunction {
        const key = 'newMoves';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const poll = async () => {
            const estimates = await this.fetchEstimates();
            const isFirstRun = !this.initialized[key];
            for (const estimate of estimates) {
                if (this.notifiedIds[key].has(estimate._id)) continue;
                const createdAt = new Date(estimate.createdAt);
                if (createdAt >= today) {
                    this.notifiedIds[key].add(estimate._id);
                    if (!isFirstRun) callback(toMove(estimate));
                } else {
                    this.notifiedIds[key].add(estimate._id);
                }
            }
            this.initialized[key] = true;
        };

        poll();
        this.intervals[key] = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(this.intervals[key]);
    }

    static subscribeToUrgentMoves(callback: NotificationCallback): UnsubscribeFunction {
        const key = 'urgentMoves';
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const poll = async () => {
            const estimates = await this.fetchEstimates();
            const isFirstRun = !this.initialized[key];
            for (const estimate of estimates) {
                if (estimate.status !== 'pending') continue;
                const moveDate = new Date(estimate.preferredMoveDate);
                if (Number.isNaN(moveDate.getTime()) || moveDate > nextWeek) continue;

                if (!this.notifiedIds[key].has(estimate._id)) {
                    this.notifiedIds[key].add(estimate._id);
                    if (!isFirstRun) callback(toMove(estimate));
                }
            }
            this.initialized[key] = true;
        };

        poll();
        this.intervals[key] = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(this.intervals[key]);
    }

    static subscribeToHighValueMoves(callback: NotificationCallback): UnsubscribeFunction {
        const key = 'highValueMoves';

        const poll = async () => {
            const estimates = await this.fetchEstimates();
            const isFirstRun = !this.initialized[key];
            for (const estimate of estimates) {
                if (estimate.totalPrice < HIGH_VALUE_THRESHOLD) continue;
                if (!this.notifiedIds[key].has(estimate._id)) {
                    this.notifiedIds[key].add(estimate._id);
                    if (!isFirstRun) callback(toMove(estimate));
                }
            }
            this.initialized[key] = true;
        };

        poll();
        this.intervals[key] = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(this.intervals[key]);
    }

    static unsubscribeAll(): void {
        Object.values(this.intervals).forEach(interval => clearInterval(interval));
        this.intervals = {};
        this.notifiedIds = { newMoves: new Set(), urgentMoves: new Set(), highValueMoves: new Set() };
        this.initialized = {};
    }
}
