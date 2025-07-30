import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { Move, CreateMoveRequest, MoveWithDetails } from '../types/moveTypes';

export class MoveService {
    /** יצירת מעבר חדש */
    static async createMove(moveData: CreateMoveRequest): Promise<Move> {
        try {
            const moveDoc = await addDoc(collection(db, 'moves'), {
                customer_id: moveData.customer_id,
                move_type: moveData.move_type_id,
                origin_address: moveData.origin_address,
                destination_address: moveData.destination_address,
                date: moveData.date,
                origin_floor: moveData.origin_floor,
                destination_floor: moveData.destination_floor,
                origin_has_elevator: moveData.origin_has_elevator,
                destination_has_elevator: moveData.destination_has_elevator,
                comments: moveData.comments,
                items: moveData.items || [],
                created_at: Timestamp.now(),
                status: 'pending'
            });

            return {
                id: moveDoc.id,
                ...moveData
            };
        } catch (error) {
            console.error('שגיאה ביצירת מעבר:', error);
            throw error;
        }
    }

    /** שליפת כל המעברים */
    static async getAllMoves(): Promise<Move[]> {
        try {
            const movesSnapshot = await getDocs(collection(db, 'moves'));
            return movesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Move));
        } catch (error) {
            console.error('שגיאה בשליפת מעברים:', error);
            throw error;
        }
    }

    /** שליפת מעבר לפי מזהה */
    static async getMoveById(moveId: string): Promise<Move | null> {
        try {
            const moveDoc = await getDoc(doc(db, 'moves', moveId));
            if (!moveDoc.exists()) return null;

            return {
                id: moveDoc.id,
                ...moveDoc.data()
            } as Move;
        } catch (error) {
            console.error('שגיאה בשליפת מעבר:', error);
            throw error;
        }
    }

    /** עדכון מעבר */
    static async updateMove(moveId: string, updateData: Partial<Move>): Promise<void> {
        try {
            await updateDoc(doc(db, 'moves', moveId), {
                ...updateData,
                updated_at: Timestamp.now()
            });
        } catch (error) {
            console.error('שגיאה בעדכון מעבר:', error);
            throw error;
        }
    }

    /** מחיקת מעבר */
    static async deleteMove(moveId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, 'moves', moveId));
        } catch (error) {
            console.error('שגיאה במחיקת מעבר:', error);
            throw error;
        }
    }

    /** שליפת מעברים לפי מזהה לקוח */
    static async getMovesByCustomerId(customerId: string): Promise<Move[]> {
        try {
            const q = query(
                collection(db, 'moves'),
                where('customer_id', '==', customerId)
            );
            const movesSnapshot = await getDocs(q);

            return movesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Move));
        } catch (error) {
            console.error('שגיאה בשליפת מעברים לפי לקוח:', error);
            throw error;
        }
    }
}