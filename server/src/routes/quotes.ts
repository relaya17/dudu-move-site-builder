import { Router, Request, Response } from 'express';
import mysql from 'mysql2/promise';

const router = Router();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // שנה לפי הצורך
    database: 'david_move',
});

// GET - שליפת הצעות
router.get('/', async (_req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM quotes ORDER BY timestamp DESC');

        const data = (rows as any[]).map((row) => ({
            id: `quote_${row.id}`,
            timestamp: row.timestamp,
            customerInfo: {
                name: row.name,
                email: row.email,
                phone: row.phone,
            },
            moveDetails: {
                moveType: row.moveType,
                moveDate: row.moveDate,
                fromAddress: row.fromAddress,
                toAddress: row.toAddress,
                details: row.details,
            },
            furnitureInventory: JSON.parse(row.furnitureInventory || '[]'),
            status: row.status,
        }));

        res.json(data);
    } catch (err) {
        console.error('שגיאה ב-get:', err);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
});

// POST - שמירת הצעת מחיר
router.post('/', async (req: Request, res: Response) => {
    const { customerInfo, moveDetails, furnitureInventory, status } = req.body;

    try {
        const [result] = await pool.execute(
            `INSERT INTO quotes 
       (name, email, phone, moveType, moveDate, fromAddress, toAddress, details, furnitureInventory, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerInfo.name,
                customerInfo.email,
                customerInfo.phone,
                moveDetails.moveType,
                moveDetails.moveDate,
                moveDetails.fromAddress,
                moveDetails.toAddress,
                moveDetails.details,
                JSON.stringify(furnitureInventory),
                status || 'pending',
            ]
        );

        const insertId = (result as any).insertId;
        res.status(201).json({
            id: `quote_${insertId}`,
            timestamp: new Date().toISOString(),
            customerInfo,
            moveDetails,
            furnitureInventory,
            status: status || 'pending',
        });
    } catch (err) {
        console.error('שגיאה ב-post:', err);
        res.status(500).json({ error: 'שגיאה בשמירת הצעת המחיר' });
    }
});

export default router;
