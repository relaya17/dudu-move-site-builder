import database from '../database/connection';
import { CreateCustomerRequest } from '../types/moveTypes';
import { CustomerService } from '../services/customerService';

export class MovingEstimateService {

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
        const connection = await database.getConnection();  // שליפת חיבור למסד הנתונים (pool)
        try {
            await connection.beginTransaction();  // התחלת טרנזקציה כדי לבצע כמה פעולות כיחידה אחת

            // יצירת לקוח חדש או מציאת לקוח קיים לפי נתוני הלקוח
            const customer = await CustomerService.findOrCreateCustomer(customerData);

            // יצירת רשומה בטבלת המעברים (move) עם פרטי המעבר
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

            const moveId = moveResult.insertId; // מזהה המעבר שנוצר

            // הוספת כל פריטי הריהוט שצוינו לטבלה items_in_move, קשורים למעבר
            for (const item of furnitureItems) {
                await connection.execute(
                    `INSERT INTO items_in_move (move_id, name, quantity) VALUES (?, ?, ?)`,
                    [moveId, item.name, item.quantity]
                );
            }

            await connection.commit();  // אישור כל השינויים כיחידה אטומית

            // מחזיר את מזהי המעבר והלקוח שנוצר/נמצא
            return { moveId, customerId: customer.id };
        } catch (error) {
            await connection.rollback();  // במקרה של שגיאה מחזיר את מצב ה-DB למה שהיה לפני הטרנזקציה
            console.error('שגיאה בשליחת הערכת מעבר:', error);
            throw error;
        } finally {
            connection.release();  // שחרור החיבור לבריכה (pool)
        }
    }
}
