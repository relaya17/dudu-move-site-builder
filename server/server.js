const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',      // שנה לפי ההגדרות שלך
  user: 'root',           // שם משתמש
  password: 'your_password', // סיסמה
  database: 'moving_quotes',
});

app.post('/api/quotes', async (req, res) => {
  const {
    name, email, phone, moveType, moveDate,
    fromAddress, toAddress, details, furnitureInventory
  } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO quotes (name, email, phone, move_type, move_date, from_address, to_address, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, moveType, moveDate, fromAddress, toAddress, details]
    );

    const quoteId = result.insertId;

    for (const item of furnitureInventory) {
      await conn.query(
        `INSERT INTO furniture_items (quote_id, type, quantity, needs_disassembly)
         VALUES (?, ?, ?, ?)`,
        [quoteId, item.type, item.quantity, item.needsDisassembly ? 1 : 0]
      );
    }

    await conn.commit();

    res.json({ success: true, quoteId });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ success: false, error: 'שגיאה בשמירת הצעת המחיר' });
  } finally {
    conn.release();
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
