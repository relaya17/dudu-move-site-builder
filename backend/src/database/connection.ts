import mysql from 'mysql2/promise';
import { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
    connectionLimit?: number;
}

interface DatabaseAdapter {
    getConnection(): Promise<PoolConnection>;
    query(sql: string, params?: any[]): Promise<any>;
    execute(sql: string, params?: any[]): Promise<any>;
    close(): Promise<void>;
}

class MySQLAdapter implements DatabaseAdapter {
    private pool: Pool;

    constructor(config: DatabaseConfig) {
        this.pool = mysql.createPool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port || 3306,
            connectionLimit: config.connectionLimit || 10,
            waitForConnections: true,
            queueLimit: 0,
        });
    }

    async getConnection(): Promise<PoolConnection> {
        return await this.pool.getConnection();
    }

    async query(sql: string, params?: any[]): Promise<any> {
        const [rows] = await this.pool.query(sql, params);
        return rows;
    }

    async execute(sql: string, params?: any[]): Promise<any> {
        const [result] = await this.pool.execute(sql, params);
        return result;
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}

// Database configuration from environment variables
const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dudu_move',
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
};

// Create database adapter instance
const database: DatabaseAdapter = new MySQLAdapter(dbConfig);

export default database;
export { DatabaseAdapter, DatabaseConfig }; 