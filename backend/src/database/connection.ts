import mysql from 'mysql2/promise';
import { databaseConfig } from '../config/database';

export interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    connectionLimit: number;
}

const pool = mysql.createPool({
    host: databaseConfig.host,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    port: databaseConfig.port,
    connectionLimit: databaseConfig.connectionLimit,
    waitForConnections: true,
    queueLimit: 0,
});

export default pool; 