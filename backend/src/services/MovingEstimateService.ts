import { db } from '../config/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { CreateCustomerRequest } from '../types/moveTypes';
import { customerSchema, moveDetailsSchema, furnitureItemSchema } from '../middleware/validation';
import { PricingService } from './PricingService';

export class MovingEstimateService {
    /**
     * יצירת בקשת הערכת מעבר חדשה.
     * - מוודא תקינות הנתונים
     * - מחשב מחיר משוער
     * - שומר את הבקשה בפיירבייס
     */
    static async submitEstimateRequest(
        customerData: CreateCustomerRequest,
        moveData: {
            apartment_type: string;
            preferred_move_date: string;
            current_address: string;
            destination_address: string;
            additional_notes: string;
            origin_floor: number;
            destination_floor: number;
            origin_has_elevator: boolean;
            destination_has_elevator: boolean;
        },
        furnitureItems: Array<{
            name: string;
            quantity: number;
            isFragile?: boolean;
            needsDisassemble?: boolean;
            needsReassemble?: boolean;
            comments?: string;
        }>
    ) {
        try {
            // ולידציה של הנתונים
            await customerSchema.parseAsync(customerData);
            await moveDetailsSchema.parseAsync(moveData);
            for (const item of furnitureItems) {
                await furnitureItemSchema.parseAsync(item);
            }

            // חישוב הפרש קומות
            const floorDifference = Math.abs(moveData.destination_floor - moveData.origin_floor);

            // חישוב מחיר משוער
            const priceEstimate = PricingService.calculateTotalPrice(
                moveData.apartment_type,
                furnitureItems,
                floorDifference,
                moveData.origin_has_elevator && moveData.destination_has_elevator
            );

            // יצירת מסמך לקוח חדש
            const customerRef = await addDoc(collection(db, 'customers'), {
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                created_at: Timestamp.now()
            });

            // יצירת מסמך מעבר חדש
            const moveRef = await addDoc(collection(db, 'moves'), {
                customer_id: customerRef.id,
                apartment_type: moveData.apartment_type,
                preferred_move_date: moveData.preferred_move_date,
                current_address: moveData.current_address,
                destination_address: moveData.destination_address,
                origin_floor: moveData.origin_floor,
                destination_floor: moveData.destination_floor,
                origin_has_elevator: moveData.origin_has_elevator,
                destination_has_elevator: moveData.destination_has_elevator,
                additional_notes: moveData.additional_notes,
                furniture_items: furnitureItems,
                price_estimate: priceEstimate,
                status: 'pending',
                created_at: Timestamp.now()
            });

            return {
                id: moveRef.id,
                customerId: customerRef.id,
                priceEstimate
            };
        } catch (error) {
            console.error('שגיאה בשליחת הערכת מעבר:', error);
            throw error;
        }
    }

    /**
     * קבלת כל בקשות הערכת המחיר
     */
    static async getAllMoveRequests() {
        try {
            const movesRef = collection(db, 'moves');
            const q = query(movesRef, orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);

            const moves = [];
            for (const docSnapshot of querySnapshot.docs) {
                const moveData = docSnapshot.data();
                const customerDoc = await getDoc(doc(db, 'customers', moveData.customer_id));
                const customerData = customerDoc.data();

                moves.push({
                    id: docSnapshot.id,
                    customer: customerData,
                    ...moveData,
                    created_at: moveData.created_at.toDate()
                });
            }

            return moves;
        } catch (error) {
            console.error('שגיאה בשליפת בקשות הערכת מחיר:', error);
            throw error;
        }
    }

    /**
     * קבלת בקשת הערכת מחיר לפי ID
     */
    static async getMoveRequestById(id: string) {
        try {
            const moveDoc = await getDoc(doc(db, 'moves', id));
            if (!moveDoc.exists()) {
                throw new Error('בקשת הערכת המחיר לא נמצאה');
            }

            const moveData = moveDoc.data();
            const customerDoc = await getDoc(doc(db, 'customers', moveData.customer_id));
            const customerData = customerDoc.data();

            return {
                id: moveDoc.id,
                customer: customerData,
                ...moveData,
                created_at: moveData.created_at.toDate()
            };
        } catch (error) {
            console.error('שגיאה בשליפת בקשת הערכת מחיר:', error);
            throw error;
        }
    }

    /**
     * עדכון סטטוס בקשת הערכת מחיר
     */
    static async updateMoveRequestStatus(id: string, status: 'pending' | 'estimated' | 'accepted' | 'rejected') {
        try {
            const moveRef = doc(db, 'moves', id);
            await updateDoc(moveRef, {
                status: status,
                updated_at: Timestamp.now()
            });

            return { success: true };
        } catch (error) {
            console.error('שגיאה בעדכון סטטוס בקשת הערכת מחיר:', error);
            throw error;
        }
    }
}