import database from '../database/connection';
import { MoveType } from '../types/moveTypes';

export class MoveTypeService {

    /**
     * יצירת סוג מעבר חדש עם שם ועלות נוספת.
     */
    static async createMoveType(typeData: Omit<MoveType, 'id'>): Promise<MoveType> {
        const result = await database.execute(
            `INSERT INTO move_type (name, base_price) VALUES (?, ?)`,
            [typeData.name, typeData.base_price]
        );

        const insertId = (result as any).insertId;

        return {
            id: insertId,
            ...typeData
        };
    }

    /**
     * שליפת כל סוגי המעבר, ממוינים לפי מחיר נוסף.
     */
    static async getAllMoveTypes(): Promise<MoveType[]> {
        const [rows] = await database.query(
            'SELECT * FROM move_type ORDER BY base_price ASC'
        );

        return rows as MoveType[];
    }

    /**
     * קבלת סוג מעבר לפי מזהה.
     * מחזיר null אם לא קיים.
     */
    static async getMoveTypeById(id: number): Promise<MoveType | null> {
        const [rows] = await database.query(
            'SELECT * FROM move_type WHERE id = ?',
            [id]
        );

        if ((rows as any[]).length === 0) {
            return null;
        }

        return (rows as any[])[0] as MoveType;
    }

    /**
     * עדכון שדות בסוג מעבר קיים.
     * מקבל אובייקט עם השדות שיש לעדכן.
     * מחזיר true אם בוצע עדכון, אחרת false.
     */
    static async updateMoveType(id: number, typeData: Partial<Omit<MoveType, 'id'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        Object.entries(typeData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) {
            return false; // אין שדות לעדכן
        }

        values.push(id);

        const result = await database.execute(
            `UPDATE move_type SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return (result as any).affectedRows > 0;
    }

    /**
     * מחיקת סוג מעבר לפי מזהה.
     * מונע מחיקה אם הסוג בשימוש בטבלה 'move'.
     * זורק שגיאה אם נמצא שימוש.
     * מחזיר true אם המחיקה בוצעה.
     */
    static async deleteMoveType(id: number): Promise<boolean> {
        // בדיקת שימוש בטבלה 'move'
        const [usageRows] = await database.query(
            'SELECT COUNT(*) as count FROM move WHERE move_type_id = ?',
            [id]
        );

        const usageCount = Number((usageRows as any[])[0].count);

        if (usageCount > 0) {
            throw new Error('Cannot delete move type that is used in existing moves');
        }

        const result = await database.execute(
            'DELETE FROM move_type WHERE id = ?',
            [id]
        );

        return (result as any).affectedRows > 0;
    }
}
