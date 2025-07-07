import database from '../database/connection';
import { MoveItem } from '../types/moveTypes';

export class MoveItemService {

    // יצירת פריט חדש להובלה במסד הנתונים
    static async createMoveItem(itemData: Omit<MoveItem, 'id'>): Promise<MoveItem> {
        const result = await database.execute(
            `INSERT INTO move_item (name, added_price) 
       VALUES (?, ?)`,
            [itemData.name, itemData.added_price]
        );

        const insertId = (result as any).insertId;

        return {
            id: insertId,
            ...itemData
        };
    }

    // שליפה של כל פריטי ההובלה מהמסד (ממוינים לפי שם)
    static async getAllMoveItems(): Promise<MoveItem[]> {
        const rows = await database.query(
            'SELECT * FROM move_item ORDER BY name ASC'
        );

        return rows as MoveItem[];
    }

    // שליפת פריט הובלה לפי מזהה ייחודי
    static async getMoveItemById(id: number): Promise<MoveItem | null> {
        const rows = await database.query(
            'SELECT * FROM move_item WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as MoveItem;
    }

    // עדכון של פריט הובלה (לפי מזהה)
    static async updateMoveItem(id: number, itemData: Partial<Omit<MoveItem, 'id'>>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        // יוצרים את חלק ה־SET של השאילתה דינמית
        Object.entries(itemData).forEach(([key, value]) => {
            if (value !== undefined && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) {
            return false;
        }

        values.push(id);

        const result = await database.execute(
            `UPDATE move_item SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return (result as any).affectedRows > 0;
    }

    // מחיקת פריט הובלה ממסד הנתונים, אם הוא לא בשימוש
    static async deleteMoveItem(id: number): Promise<boolean> {
        // בדיקה אם הפריט בשימוש כלשהו בהובלות קיימות
        const usageRows = await database.query(
            'SELECT COUNT(*) as count FROM item_in_move WHERE move_item_id = ?',
            [id]
        );

        const usageCount = (usageRows[0] as any).count;

        if (usageCount > 0) {
            throw new Error('Cannot delete move item that is used in existing moves');
        }

        const result = await database.execute(
            'DELETE FROM move_item WHERE id = ?',
            [id]
        );

        return (result as any).affectedRows > 0;
    }

    // חיפוש פריטי הובלה לפי מונח חיפוש בשם (חיפוש חלקי)
    static async searchMoveItems(searchTerm: string): Promise<MoveItem[]> {
        const rows = await database.query(
            'SELECT * FROM move_item WHERE name LIKE ? ORDER BY name ASC',
            [`%${searchTerm}%`]
        );

        return rows as MoveItem[];
    }
}
