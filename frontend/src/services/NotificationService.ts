import { db } from '@/config/firebase';
import {
    collection,
    onSnapshot,
    query,
    where,
    Timestamp,
    DocumentData,
    QuerySnapshot,
    DocumentChange
} from 'firebase/firestore';
import { Move } from '@/types/moveTypes';

type NotificationCallback = (move: Move) => void;
type UnsubscribeFunction = () => void;

export class NotificationService {
    private static listeners: Record<string, UnsubscribeFunction> = {};

    static validateMove(data: DocumentData): Move {
        if (!data.customer?.name || !data.date || !data.status || !data.price_estimate?.totalPrice) {
            throw new Error('נתוני הובלה לא תקינים');
        }
        return data as Move;
    }

    static subscribeToNewMoves(callback: NotificationCallback): UnsubscribeFunction {
        const movesRef = collection(db, 'moves');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const q = query(movesRef, where('created_at', '>=', Timestamp.fromDate(today)));

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            snapshot.docChanges().forEach((change: DocumentChange<DocumentData>) => {
                if (change.type === 'added') {
                    try {
                        const moveData = this.validateMove({
                            id: change.doc.id,
                            ...change.doc.data()
                        });
                        callback(moveData);
                    } catch (error) {
                        console.error('שגיאה בעיבוד נתוני הובלה:', error);
                    }
                }
            });
        });

        this.listeners['newMoves'] = unsubscribe;
        return unsubscribe;
    }

    static subscribeToUrgentMoves(callback: NotificationCallback): UnsubscribeFunction {
        const movesRef = collection(db, 'moves');
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const q = query(
            movesRef,
            where('date', '<=', Timestamp.fromDate(nextWeek)),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            snapshot.docChanges().forEach((change: DocumentChange<DocumentData>) => {
                if (change.type === 'added' || change.type === 'modified') {
                    try {
                        const moveData = this.validateMove({
                            id: change.doc.id,
                            ...change.doc.data()
                        });
                        callback(moveData);
                    } catch (error) {
                        console.error('שגיאה בעיבוד נתוני הובלה דחופה:', error);
                    }
                }
            });
        });

        this.listeners['urgentMoves'] = unsubscribe;
        return unsubscribe;
    }

    static subscribeToHighValueMoves(callback: NotificationCallback): UnsubscribeFunction {
        const movesRef = collection(db, 'moves');
        const q = query(movesRef, where('price_estimate.totalPrice', '>=', 5000));

        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            snapshot.docChanges().forEach((change: DocumentChange<DocumentData>) => {
                if (change.type === 'added') {
                    try {
                        const moveData = this.validateMove({
                            id: change.doc.id,
                            ...change.doc.data()
                        });
                        callback(moveData);
                    } catch (error) {
                        console.error('שגיאה בעיבוד נתוני הובלה יקרה:', error);
                    }
                }
            });
        });

        this.listeners['highValueMoves'] = unsubscribe;
        return unsubscribe;
    }

    static unsubscribeAll(): void {
        Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
        this.listeners = {};
    }
}