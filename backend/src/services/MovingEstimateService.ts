import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
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
}