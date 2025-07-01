import { Request, Response } from 'express';
import { db } from '../db'; // Assuming db is exported from a file in the same directory

export const createQuote = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, move_type, move_date, from_address, to_address, details } = req.body;

        const [result] = await db.execute(
            `INSERT INTO quotes (name, email, phone, move_type, move_date, from_address, to_address, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, move_type, move_date, from_address, to_address, details]
        );

        // TypeScript לא יודע בדיוק את סוג התוצאה, אז אפשר לעשות type assertion:
        const insertResult = result as { insertId: number };

        res.status(201).json({ id: insertResult.insertId });
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
