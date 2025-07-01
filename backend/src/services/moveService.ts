import database from '../database/connection';
import { Move, CreateMoveRequest, MoveWithDetails, MovePriceCalculation, ItemInMove, CreateItemInMoveRequest } from '../types/moveTypes';
import { CustomerService } from './customerService';

export class MoveService {

    static async createMove(moveData: CreateMoveRequest): Promise<Move> {
        const connection = await database.getConnection();

        try {
            await connection.beginTransaction();

            // Handle customer creation or lookup
            let customerId = moveData.customer_id;

            if (!customerId && moveData.customer) {
                const customer = await CustomerService.findOrCreateCustomer(moveData.customer);
                customerId = customer.id!;
            }

            if (!customerId) {
                throw new Error('Customer ID or customer data is required');
            }

            // Create the move
            const [moveResult] = await connection.execute(
                `INSERT INTO move 
        (customer_id, move_type_id, origin_address, destination_address, date, 
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

            // Add items to the move
            if (moveData.items && moveData.items.length > 0) {
                for (const item of moveData.items) {
                    await connection.execute(
                        `INSERT INTO item_in_move 
            (move_id, move_item_id, isFragile, needsDisassemble, needsReassemble, comments, addedPrice) 
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

    static async getAllMoves(): Promise<Move[]> {
        const rows = await database.query(
            'SELECT * FROM move ORDER BY created_at DESC'
        );

        return rows as Move[];
    }

    static async getMoveById(id: number): Promise<Move | null> {
        const rows = await database.query(
            'SELECT * FROM move WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Move;
    }

    static async getMoveWithDetails(id: number): Promise<MoveWithDetails | null> {
        const rows = await database.query(
            `SELECT 
        m.*,
        c.phone as customer_phone, c.first_name as customer_first_name, 
        c.last_name as customer_last_name, c.email as customer_email,
        mt.name as move_type_name, mt.added_price as move_type_price
       FROM move m
       JOIN customers c ON m.customer_id = c.id
       JOIN move_type mt ON m.move_type_id = mt.id
       WHERE m.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        const moveRow = rows[0] as any;

        // Get items for this move
        const itemRows = await database.query(
            `SELECT 
        iim.*,
        mi.name as item_name, mi.added_price as item_base_price
       FROM item_in_move iim
       JOIN move_item mi ON iim.move_item_id = mi.id
       WHERE iim.move_id = ?`,
            [id]
        );

        const items = (itemRows as any[]).map(itemRow => ({
            id: itemRow.id,
            move_id: itemRow.move_id,
            move_item_id: itemRow.move_item_id,
            isFragile: itemRow.isFragile,
            needsDisassemble: itemRow.needsDisassemble,
            needsReassemble: itemRow.needsReassemble,
            comments: itemRow.comments,
            addedPrice: itemRow.addedPrice,
            move_item: {
                id: itemRow.move_item_id,
                name: itemRow.item_name,
                added_price: itemRow.item_base_price
            }
        }));

        // Calculate total price
        const basePrice = moveRow.move_type_price;
        const itemsPrice = items.reduce((sum, item) =>
            sum + item.move_item.added_price + item.addedPrice, 0
        );
        const totalPrice = basePrice + itemsPrice;

        return {
            id: moveRow.id,
            customer_id: moveRow.customer_id,
            move_type_id: moveRow.move_type_id,
            origin_address: moveRow.origin_address,
            destination_address: moveRow.destination_address,
            date: moveRow.date,
            origin_floor: moveRow.origin_floor,
            destination_floor: moveRow.destination_floor,
            origin_has_elevator: moveRow.origin_has_elevator,
            destination_has_elevator: moveRow.destination_has_elevator,
            comments: moveRow.comments,
            created_at: moveRow.created_at,
            updated_at: moveRow.updated_at,
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

    static async getMovesByCustomer(customerId: number): Promise<Move[]> {
        const rows = await database.query(
            'SELECT * FROM move WHERE customer_id = ? ORDER BY created_at DESC',
            [customerId]
        );

        return rows as Move[];
    }

    static async calculateMovePrice(moveId: number): Promise<MovePriceCalculation | null> {
        const moveWithDetails = await this.getMoveWithDetails(moveId);

        if (!moveWithDetails) {
            return null;
        }

        const basePrice = moveWithDetails.move_type.added_price;
        const itemsBreakdown = moveWithDetails.items.map(item => ({
            name: item.move_item!.name,
            base_price: item.move_item!.added_price,
            added_price: item.addedPrice,
            total_price: item.move_item!.added_price + item.addedPrice
        }));

        const itemsPrice = itemsBreakdown.reduce((sum, item) => sum + item.total_price, 0);
        const totalPrice = basePrice + itemsPrice;

        return {
            base_price: basePrice,
            items_price: itemsPrice,
            total_price: totalPrice,
            breakdown: {
                move_type: moveWithDetails.move_type.name,
                move_type_price: basePrice,
                items: itemsBreakdown
            }
        };
    }

    static async updateMove(id: number, moveData: Partial<Move>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        // Only allow updating certain fields
        const allowedFields = [
            'origin_address', 'destination_address', 'date', 'origin_floor',
            'destination_floor', 'origin_has_elevator', 'destination_has_elevator', 'comments'
        ];

        Object.entries(moveData).forEach(([key, value]) => {
            if (value !== undefined && allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) {
            return false;
        }

        values.push(id);

        const result = await database.execute(
            `UPDATE move SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return (result as any).affectedRows > 0;
    }

    static async deleteMove(id: number): Promise<boolean> {
        const result = await database.execute(
            'DELETE FROM move WHERE id = ?',
            [id]
        );

        return (result as any).affectedRows > 0;
    }

    static async addItemToMove(moveId: number, itemData: CreateItemInMoveRequest): Promise<ItemInMove> {
        const result = await database.execute(
            `INSERT INTO item_in_move 
      (move_id, move_item_id, isFragile, needsDisassemble, needsReassemble, comments, addedPrice) 
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

    static async removeItemFromMove(itemInMoveId: number): Promise<boolean> {
        const result = await database.execute(
            'DELETE FROM item_in_move WHERE id = ?',
            [itemInMoveId]
        );

        return (result as any).affectedRows > 0;
    }
} 