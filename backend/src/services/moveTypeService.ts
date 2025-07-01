import database from '../database/connection';
import { MoveType } from '../types/moveTypes';

export class MoveTypeService {

    static async createMoveType(typeData: Omit<MoveType, 'id'>): Promise<MoveType> {
        const result = await database.execute(
            `INSERT INTO move_type (name, added_price) 
       VALUES (?, ?)`,
            [typeData.name, typeData.added_price]
        );

        const insertId = (result as any).insertId;

        return {
            id: insertId,
            ...typeData
        };
    }

    static async getAllMoveTypes(): Promise<MoveType[]> {
        const rows = await database.query(
            'SELECT * FROM move_type ORDER BY added_price ASC'
        );

        return rows as MoveType[];
    }

    static async getMoveTypeById(id: number): Promise<MoveType | null> {
        const rows = await database.query(
            'SELECT * FROM move_type WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as MoveType;
    }

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
            return false;
        }

        values.push(id);

        const result = await database.execute(
            `UPDATE move_type SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return (result as any).affectedRows > 0;
    }

    static async deleteMoveType(id: number): Promise<boolean> {
        // Check if type is used in any moves
        const usageRows = await database.query(
            'SELECT COUNT(*) as count FROM move WHERE move_type_id = ?',
            [id]
        );

        const usageCount = (usageRows[0] as any).count;

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