import { db } from './db';

export const createQuote = async (req, res) => {
    const { name, email, phone, move_type, move_date, from_address, to_address, details } = req.body;
    const [rows, fields]: any = await db.execute(
        `INSERT INTO quotes (name, email, phone, move_type, move_date, from_address, to_address, details) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, phone, move_type, move_date, from_address, to_address, details]
    );
    res.status(201).json({ id: rows.insertId });
};
