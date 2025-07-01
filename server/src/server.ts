import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

async function init() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'david_move',
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      moveType VARCHAR(100),
      moveDate VARCHAR(100),
      fromAddress TEXT,
      toAddress TEXT,
      details TEXT,
      furnitureInventory JSON,
      status ENUM('pending', 'processed', 'sent') DEFAULT 'pending'
    )
  `);

  app.post('/api/quotes', async (req, res) => {
    const {
      customerInfo,
      moveDetails,
      furnitureInventory,
      status = 'pending'
    } = req.body;

    try {
      const [result] = await db.execute(
        `INSERT INTO quotes (
          name, email, phone, moveType, moveDate,
          fromAddress, toAddress, details,
          furnitureInventory, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          status
        ]
      );

      const insertedId = (result as any).insertId;
      res.status(201).json({
        id: `quote_${insertedId}`,
        timestamp: new Date().toISOString(),
        customerInfo,
        moveDetails,
        furnitureInventory,
        status
      });
    } catch (err) {
      console.error('שגיאה בשמירת הצעת מחיר:', err);
      res.status(500).json({ error: 'בעיה בשמירת הצעת המחיר' });
    }
  });

  app.get('/api/quotes', async (_req, res) => {
    try {
      const [rows] = await db.execute(`SELECT * FROM quotes ORDER BY timestamp DESC`);
      const quotes = (rows as any[]).map((row) => ({
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

      res.json(quotes);
    } catch (err) {
      console.error('שגיאה בשליפת הצעות מחיר:', err);
      res.status(500).json({ error: 'בעיה בשליפת הצעות המחיר' });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 שרת רץ על http://localhost:${PORT}`);
  });
}

init();
