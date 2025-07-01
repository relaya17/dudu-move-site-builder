#!/usr/bin/env node

import database from '../database/connection';

interface Migration {
    id: string;
    name: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}

const migrations: Migration[] = [
    {
        id: '001',
        name: 'create_base_tables',
        up: async () => {
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
        },
        down: async () => {
            await database.execute('SET FOREIGN_KEY_CHECKS = 0');
            await database.execute('DROP TABLE IF EXISTS item_in_move');
            await database.execute('DROP TABLE IF EXISTS move');
            await database.execute('DROP TABLE IF EXISTS move_type');
            await database.execute('DROP TABLE IF EXISTS move_item');
            await database.execute('DROP TABLE IF EXISTS customers');
            await database.execute('SET FOREIGN_KEY_CHECKS = 1');
        }
    },
    // Add more migrations here as needed
];

async function ensureMigrationsTable() {
    await database.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
    const rows = await database.query('SELECT id FROM migrations ORDER BY id');
    return rows.map((row: any) => row.id);
}

async function markMigrationAsExecuted(id: string, name: string) {
    await database.execute(
        'INSERT INTO migrations (id, name) VALUES (?, ?)',
        [id, name]
    );
}

async function removeMigrationRecord(id: string) {
    await database.execute('DELETE FROM migrations WHERE id = ?', [id]);
}

async function runMigrations() {
    console.log('🚀 Running database migrations...');

    await ensureMigrationsTable();
    const executedMigrations = await getExecutedMigrations();

    let count = 0;
    for (const migration of migrations) {
        if (!executedMigrations.includes(migration.id)) {
            console.log(`📦 Running migration: ${migration.id} - ${migration.name}`);
            try {
                await migration.up();
                await markMigrationAsExecuted(migration.id, migration.name);
                count++;
                console.log(`✅ Migration ${migration.id} completed`);
            } catch (error) {
                console.error(`❌ Migration ${migration.id} failed:`, error);
                throw error;
            }
        }
    }

    if (count === 0) {
        console.log('ℹ️  No new migrations to run');
    } else {
        console.log(`✅ ${count} migration(s) completed successfully!`);
    }
}

async function rollbackMigration() {
    console.log('🔄 Rolling back last migration...');

    await ensureMigrationsTable();
    const executedMigrations = await getExecutedMigrations();

    if (executedMigrations.length === 0) {
        console.log('ℹ️  No migrations to rollback');
        return;
    }

    const lastMigrationId = executedMigrations[executedMigrations.length - 1];
    const migration = migrations.find(m => m.id === lastMigrationId);

    if (!migration) {
        console.error(`❌ Migration ${lastMigrationId} not found in migration files`);
        return;
    }

    console.log(`📦 Rolling back migration: ${migration.id} - ${migration.name}`);
    try {
        await migration.down();
        await removeMigrationRecord(migration.id);
        console.log(`✅ Migration ${migration.id} rolled back successfully`);
    } catch (error) {
        console.error(`❌ Rollback of migration ${migration.id} failed:`, error);
        throw error;
    }
}

async function showMigrationStatus() {
    await ensureMigrationsTable();
    const executedMigrations = await getExecutedMigrations();

    console.log('\n📊 Migration Status:');
    console.log('===================');

    for (const migration of migrations) {
        const status = executedMigrations.includes(migration.id) ? '✅ Applied' : '⏳ Pending';
        console.log(`${migration.id} - ${migration.name}: ${status}`);
    }
    console.log('');
}

async function main() {
    const command = process.argv[2];

    try {
        switch (command) {
            case 'up':
                await runMigrations();
                break;

            case 'down':
                await rollbackMigration();
                break;

            case 'status':
                await showMigrationStatus();
                break;

            default:
                console.log(`
Usage: npm run migrate <command>

Commands:
  up      - Run all pending migrations
  down    - Rollback the last migration
  status  - Show migration status

Examples:
  npm run migrate up
  npm run migrate down
  npm run migrate status
        `);
                process.exit(1);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Migration operation failed:', error);
        process.exit(1);
    } finally {
        await database.close();
    }
}

main(); 