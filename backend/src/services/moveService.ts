import database from '../database/connection';
import { Move, CreateMoveRequest, MoveWithDetails, MovePriceCalculation, ItemInMove, CreateItemInMoveRequest } from '../types/moveTypes';
import { CustomerService } from './customerService';

/**
 * MoveService: אחראית על פעולות הקשורות למעברי דירה, לקוחות, פריטים, וחישוב מחירים
 */
export class MoveService {
    /** יצירת מעבר חדש כולל לקוח ופריטים */
    static async createMove(moveData: CreateMoveRequest): Promise<Move> {
        const connection = await database.getConnection();
        try {
            await connection.beginTransaction();
            let customerId = moveData.customer_id;
            if (!customerId && moveData.customer) {
                const customer = await CustomerService.findOrCreateCustomer(moveData.customer);
                customerId = customer.id!;
            }
            if (!customerId) throw new Error('Customer ID or customer data is required');

            const [moveResult] = await connection.execute(
                `INSERT INTO move (customer_id, move_type_id, origin_address, destination_address, date,
          origin_floor, destination_floor, origin_has_elevator, destination_has_elevator, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    customerId,
                    moveData.move_type_id,
                    moveData.origin_address,
                    moveData.destination_address,
                    moveData.date,
                    moveData.origin_floor,
                    moveData.destination_floor,
                    moveData.origin_has_elevator,
                    moveData.destination_has_elevator,
                    moveData.comments
                ]
            );
            const moveId = (moveResult as any).insertId;

            if (moveData.items?.length) {
                for (const item of moveData.items) {
                    await connection.execute(
                        `INSERT INTO item_in_move (move_id, move_item_id, isFragile, needsDisassemble, needsReassemble, comments, addedPrice)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            moveId,
                            item.move_item_id,
                            item.isFragile,
                            item.needsDisassemble,
                            item.needsReassemble,
                            item.comments,
                            item.addedPrice || 0
                        ]
                    );
                }
            }

            await connection.commit();
            return {
                id: moveId,
                customer_id: customerId,
                move_type_id: moveData.move_type_id,
                origin_address: moveData.origin_address,
                destination_address: moveData.destination_address,
                date: moveData.date,
                origin_floor: moveData.origin_floor,
                destination_floor: moveData.destination_floor,
                origin_has_elevator: moveData.origin_has_elevator,
                destination_has_elevator: moveData.destination_has_elevator,
                comments: moveData.comments
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /** שליפת כל המעברים */
    static async getAllMoves(): Promise<Move[]> {
        const rows = await database.query('SELECT * FROM move ORDER BY created_at DESC');
        return rows as Move[];
    }

    /** שליפת מעבר לפי מזהה */
    static async getMoveById(id: number): Promise<Move | null> {
        const rows = await database.query('SELECT * FROM move WHERE id = ?', [id]);
        return rows.length ? (rows[0] as Move) : null;
    }

    /** שליפת מעבר עם כל הפרטים (לקוח, סוג מעבר, פריטים) */
    static async getMoveWithDetails(id: number): Promise<MoveWithDetails | null> {
        const rows = await database.query(
            `SELECT m.*, c.phone as customer_phone, c.first_name as customer_first_name,
              c.last_name as customer_last_name, c.email as customer_email,
              mt.name as move_type_name, mt.added_price as move_type_price
       FROM move m
       JOIN customers c ON m.customer_id = c.id
       JOIN move_type mt ON m.move_type_id = mt.id
       WHERE m.id = ?`,
            [id]
        );
        if (!rows.length) return null;
        const moveRow = rows[0] as any;

        const itemRows = await database.query(
            `SELECT iim.*, mi.name as item_name, mi.added_price as item_base_price
       FROM item_in_move iim
       JOIN move_item mi ON iim.move_item_id = mi.id
       WHERE iim.move_id = ?`,
            [id]
        );

        const items = (itemRows as any[]).map(item => ({
            id: item.id,
            move_id: item.move_id,
            move_item_id: item.move_item_id,
            isFragile: item.isFragile,
            needsDisassemble: item.needsDisassemble,
            needsReassemble: item.needsReassemble,
            comments: item.comments,
            addedPrice: item.addedPrice,
            move_item: {
                id: item.move_item_id,
                name: item.item_name,
                added_price: item.item_base_price
            }
        }));

        const basePrice = moveRow.move_type_price;
        const itemsPrice = items.reduce((sum, i) => sum + i.move_item.added_price + i.addedPrice, 0);
        const totalPrice = basePrice + itemsPrice;

        return {
            ...moveRow,
            customer: {
                id: moveRow.customer_id,
                phone: moveRow.customer_phone,
                first_name: moveRow.customer_first_name,
                last_name: moveRow.customer_last_name,
                email: moveRow.customer_email
            },
            move_type: {
                id: moveRow.move_type_id,
                name: moveRow.move_type_name,
                added_price: moveRow.move_type_price
            },
            items,
            total_price: totalPrice
        };
    }

    /** שליפת מעברים לפי לקוח */
    static async getMovesByCustomer(customerId: number): Promise<Move[]> {
        const rows = await database.query(
            'SELECT * FROM move WHERE customer_id = ? ORDER BY created_at DESC',
            [customerId]
        );
        return rows as Move[];
    }

    /** חישוב מחיר כולל של מעבר */
    static async calculateMovePrice(moveId: number): Promise<MovePriceCalculation | null> {
        const move = await this.getMoveWithDetails(moveId);
        if (!move) return null;

        const base = move.move_type.added_price;
        const items = move.items.map(i => ({
            name: i.move_item!.name,
            base_price: i.move_item!.added_price,
            added_price: i.addedPrice,
            total_price: i.move_item!.added_price + i.addedPrice
        }));
        const itemsTotal = items.reduce((sum, i) => sum + i.total_price, 0);

        return {
            base_price: base,
            items_price: itemsTotal,
            total_price: base + itemsTotal,
            breakdown: {
                move_type: move.move_type.name,
                move_type_price: base,
                items
            }
        };
    }

    /** עדכון מעבר */
    static async updateMove(id: number, moveData: Partial<Move>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];
        const allowed = ['origin_address', 'destination_address', 'date', 'origin_floor', 'destination_floor', 'origin_has_elevator', 'destination_has_elevator', 'comments'];

        for (const [key, val] of Object.entries(moveData)) {
            if (allowed.includes(key) && val !== undefined) {
                fields.push(`${key} = ?`);
                values.push(val);
            }
        }

        if (!fields.length) return false;
        values.push(id);
        const result = await database.execute(`UPDATE move SET ${fields.join(', ')} WHERE id = ?`, values);
        return (result as any).affectedRows > 0;
    }

    /** מחיקת מעבר */
    static async deleteMove(id: number): Promise<boolean> {
        const result = await database.execute('DELETE FROM move WHERE id = ?', [id]);
        return (result as any).affectedRows > 0;
    }

    /** הוספת פריט למעבר */
    static async addItemToMove(moveId: number, itemData: CreateItemInMoveRequest): Promise<ItemInMove> {
        const result = await database.execute(
            `INSERT INTO item_in_move (move_id, move_item_id, isFragile, needsDisassemble, needsReassemble, comments, addedPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                moveId,
                itemData.move_item_id,
                itemData.isFragile,
                itemData.needsDisassemble,
                itemData.needsReassemble,
                itemData.comments,
                itemData.addedPrice || 0
            ]
        );
        const insertId = (result as any).insertId;
        return {
            id: insertId,
            move_id: moveId,
            move_item_id: itemData.move_item_id,
            isFragile: itemData.isFragile,
            needsDisassemble: itemData.needsDisassemble,
            needsReassemble: itemData.needsReassemble,
            comments: itemData.comments,
            addedPrice: itemData.addedPrice || 0
        };
    }

    /** הסרת פריט ממעבר */
    static async removeItemFromMove(itemInMoveId: number): Promise<boolean> {
        const result = await database.execute('DELETE FROM item_in_move WHERE id = ?', [itemInMoveId]);
        return (result as any).affectedRows > 0;
    }
}
