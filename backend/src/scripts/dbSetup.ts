#!/usr/bin/env node

import { createTables, dropTables, seedDatabase } from '../database/schema';
import database from '../database/connection';

const command = process.argv[2];

async function runCommand() {
    try {
        switch (command) {
            case 'create':
                console.log('🔨 Creating database tables...');
                await createTables();
                break;

            case 'drop':
                console.log('🗑️  Dropping database tables...');
                await dropTables();
                break;

            case 'reset':
                console.log('🔄 Resetting database...');
                await dropTables();
                await createTables();
                break;

            case 'seed':
                console.log('🌱 Seeding database with sample data...');
                await seedDatabase();
                break;

            case 'setup':
                console.log('🚀 Setting up database from scratch...');
                await dropTables();
                await createTables();
                await seedDatabase();
                break;

            default:
                console.log(`
Usage: npm run db <command>

Commands:
  create  - Create database tables
  drop    - Drop all tables
  reset   - Drop and recreate tables
  seed    - Insert sample data
  setup   - Complete setup (drop, create, seed)

Examples:
  npm run db create
  npm run db reset
  npm run db setup
        `);
                process.exit(1);
        }

        console.log('✅ Database operation completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database operation failed:', error);
        process.exit(1);
    } finally {
        await database.end();
    }
}

runCommand(); 