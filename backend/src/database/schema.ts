import database from './connection';

export const createTables = async (): Promise<void> => {
  try {
    // Create customers table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(50) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create move_item table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS move_item (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        added_price INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create move_type table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS move_type (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        added_price INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create move table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS move (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        move_type_id INT NOT NULL,
        origin_address TEXT NOT NULL,
        destination_address TEXT NOT NULL,
        date DATE NOT NULL,
        origin_floor INT DEFAULT 0,
        destination_floor INT DEFAULT 0,
        origin_has_elevator BOOLEAN DEFAULT FALSE,
        destination_has_elevator BOOLEAN DEFAULT FALSE,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (move_type_id) REFERENCES move_type(id) ON DELETE RESTRICT,
        INDEX idx_customer (customer_id),
        INDEX idx_move_type (move_type_id),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create item_in_move table
    await database.execute(`
      CREATE TABLE IF NOT EXISTS item_in_move (
        id INT AUTO_INCREMENT PRIMARY KEY,
        move_id INT NOT NULL,
        move_item_id INT NOT NULL,
        isFragile BOOLEAN DEFAULT FALSE,
        needsDisassemble BOOLEAN DEFAULT FALSE,
        needsReassemble BOOLEAN DEFAULT FALSE,
        comments TEXT,
        addedPrice INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (move_id) REFERENCES move(id) ON DELETE CASCADE,
        FOREIGN KEY (move_item_id) REFERENCES move_item(id) ON DELETE RESTRICT,
        INDEX idx_move (move_id),
        INDEX idx_move_item (move_item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create audit log table for tracking changes
    await database.execute(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        record_id INT NOT NULL,
        action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
        old_values JSON,
        new_values JSON,
        changed_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_table_record (table_name, record_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
    throw error;
  }
};

export const dropTables = async (): Promise<void> => {
  try {
    // Drop tables in reverse order to respect foreign key constraints
    await database.execute('SET FOREIGN_KEY_CHECKS = 0');
    await database.execute('DROP TABLE IF EXISTS audit_log');
    await database.execute('DROP TABLE IF EXISTS item_in_move');
    await database.execute('DROP TABLE IF EXISTS move');
    await database.execute('DROP TABLE IF EXISTS move_type');
    await database.execute('DROP TABLE IF EXISTS move_item');
    await database.execute('DROP TABLE IF EXISTS customers');
    await database.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping database tables:', error);
    throw error;
  }
};

export const seedDatabase = async (): Promise<void> => {
  try {
    // Insert sample customers
    await database.execute(`
      INSERT IGNORE INTO customers (phone, first_name, last_name, email) VALUES 
      ('050-123-4567', 'יוסי', 'כהן', 'yossi@example.com'),
      ('052-987-6543', 'שרה', 'לוי', 'sara@example.com'),
      ('054-555-7777', 'דוד', 'מזרחי', 'david@example.com')
    `);

    // Insert sample move types
    await database.execute(`
      INSERT IGNORE INTO move_type (name, added_price) VALUES 
      ('דירת סטודיו', 0),
      ('דירת 1 חדר', 100),
      ('דירת 2 חדרים', 200),
      ('דירת 3 חדרים', 350),
      ('דירת 4 חדרים', 500),
      ('דירת 5+ חדרים', 700),
      ('בית פרטי', 1000),
      ('משרד קטן', 300),
      ('משרד גדול', 800)
    `);

    // Insert sample move items
    await database.execute(`
      INSERT IGNORE INTO move_item (name, added_price) VALUES 
      ('ספה תלת מושבית', 150),
      ('ספה דו מושבית', 100),
      ('כורסא', 75),
      ('מיטה זוגית', 120),
      ('מיטה יחיד', 80),
      ('ארון בגדים קטן', 100),
      ('ארון בגדים גדול', 200),
      ('שולחן אוכל', 100),
      ('כסאות אוכל (4)', 60),
      ('מקרר', 180),
      ('מכונת כביסה', 150),
      ('מדיח כלים', 120),
      ('מזגן', 200),
      ('טלוויזיה', 80),
      ('מחשב נייח', 50),
      ('ארגז כלים', 40),
      ('קרטונים (10)', 20),
      ('פסנתר', 500),
      ('כספת', 300),
      ('אופניים', 30)
    `);

    // Insert sample moves
    const customersResult = await database.query('SELECT id FROM customers LIMIT 3');
    const customers = customersResult as any[];

    const moveTypesResult = await database.query('SELECT id FROM move_type WHERE name = "דירת 3 חדרים"');
    const moveTypes = moveTypesResult as any[];

    if (customers.length > 0 && moveTypes.length > 0) {
      await database.execute(`
        INSERT IGNORE INTO move (
          customer_id, move_type_id, origin_address, destination_address, 
          date, origin_floor, destination_floor, origin_has_elevator, 
          destination_has_elevator, comments
        ) VALUES 
        (
          ${customers[0].id}, ${moveTypes[0].id}, 
          'רחוב הרצל 123, תל אביב', 'שדרות רוטשילד 456, תל אביב',
          '2024-02-15', 3, 2, TRUE, FALSE,
          'מעבר דחוף, יש הרבה חפצים שבירים'
        ),
        (
          ${customers[1] ? customers[1].id : customers[0].id}, ${moveTypes[0].id},
          'רחוב דיזנגוף 789, תל אביב', 'רחוב אלנבי 321, תל אביב',
          '2024-03-01', 1, 4, FALSE, TRUE,
          'מעבר רגיל, צריך לפרק ולהרכיב ארונות'
        )
      `);

      // Insert sample items in moves
      const movesResult = await database.query('SELECT id FROM move LIMIT 2');
      const moves = movesResult as any[];

      const itemsResult = await database.query('SELECT id FROM move_item WHERE name IN ("ספה תלת מושבית", "מיטה זוגית", "ארון בגדים גדול") LIMIT 3');
      const items = itemsResult as any[];

      if (moves.length > 0 && items.length > 0) {
        await database.execute(`
          INSERT IGNORE INTO item_in_move (
            move_id, move_item_id, isFragile, needsDisassemble, needsReassemble, comments, addedPrice
          ) VALUES 
          (${moves[0].id}, ${items[0].id}, FALSE, FALSE, FALSE, 'ספה במצב טוב', 0),
          (${moves[0].id}, ${items[1] ? items[1].id : items[0].id}, FALSE, TRUE, TRUE, 'מיטה צריכה פירוק והרכבה', 50),
          (${moves[0].id}, ${items[2] ? items[2].id : items[0].id}, FALSE, TRUE, TRUE, 'ארון גדול וכבד', 100)
        `);
      }
    }

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}; 