import database from '../database/connection';
import { CreateCustomerRequest } from '../types/moveTypes';
import { CustomerService } from './customerService';

export class MovingEstimateService {

    /**
     * יצירת בקשת הערכת מעבר חדשה.
     * - יוצר או מוצא לקוח קיים.
     * - יוצר רשומת מעבר חדשה.
     * - מוסיף פריטי ריהוט למעבר.
     * כל הפעולות מבוצעות בטרנזקציה כדי לשמור על עקביות הנתונים.
     */
    static async submitEstimateRequest(
        customerData: CreateCustomerRequest,
        moveData: {
            apartment_type: string;
            preferred_move_date: string;
            current_address: string;
            destination_address: string;
            additional_notes: string;
        },
        furnitureItems: Array<{ name: string; quantity: number }>
    ) {
        // קבלת חיבור למסד הנתונים מתוך ה-pool
        const connection = await database.getConnection();

        try {
            // התחלת טרנזקציה - כל הפעולות יעבדו כיחידה אטומית
            await connection.beginTransaction();

            // יצירת או מציאת לקוח חדש (באמצעות שירות לקוחות)
            const customer = await CustomerService.findOrCreateCustomer(customerData);

            // יצירת רשומת מעבר בטבלה 'move'
            const [moveResult]: any = await connection.execute(
                `INSERT INTO move (customer_id, apartment_type, preferred_move_date, current_address, destination_address, additional_notes)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    customer.id,
                    moveData.apartment_type,
                    moveData.preferred_move_date,
                    moveData.current_address,
                    moveData.destination_address,
                    moveData.additional_notes,
                ]
            );

            // שמירת מזהה המעבר שנוצר
            const moveId = moveResult.insertId;

            // הכנסת פריטי הריהוט לטבלת items_in_move, עם קישור למעבר
            for (const item of furnitureItems) {
                await connection.execute(
                    `INSERT INTO items_in_move (move_id, name, quantity) VALUES (?, ?, ?)`,
                    [moveId, item.name, item.quantity]
                );
            }

            // אישור הטרנזקציה
            await connection.commit();

            // החזרת מזהי המעבר והלקוח שנוצרו
            return { moveId, customerId: customer.id };
        } catch (error) {
            // במקרה של שגיאה - ביטול כל השינויים שבוצעו
            await connection.rollback();
            console.error('שגיאה בשליחת הערכת מעבר:', error);
            throw error;
        } finally {
            // שחרור החיבור לבריכה
            connection.release();
        }
    }
}
