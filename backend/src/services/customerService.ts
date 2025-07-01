import database from '../database/connection';
import { Customer, CreateCustomerRequest } from '../types/moveTypes';

export class CustomerService {

    static async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
        const result = await database.execute(
            `INSERT INTO customers (phone, first_name, last_name, email) 
       VALUES (?, ?, ?, ?)`,
            [
                customerData.phone,
                customerData.first_name,
                customerData.last_name,
                customerData.email
            ]
        );

        const insertId = (result as any).insertId;

        return {
            id: insertId,
            ...customerData
        };
    }

    static async getAllCustomers(): Promise<Customer[]> {
        const rows = await database.query(
            'SELECT * FROM customers ORDER BY created_at DESC'
        );

        return rows as Customer[];
    }

    static async getCustomerById(id: number): Promise<Customer | null> {
        const rows = await database.query(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Customer;
    }

    static async getCustomerByEmail(email: string): Promise<Customer | null> {
        const rows = await database.query(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Customer;
    }

    static async getCustomerByPhone(phone: string): Promise<Customer | null> {
        const rows = await database.query(
            'SELECT * FROM customers WHERE phone = ?',
            [phone]
        );

        if (rows.length === 0) {
            return null;
        }

        return rows[0] as Customer;
    }

    static async updateCustomer(id: number, customerData: Partial<CreateCustomerRequest>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        Object.entries(customerData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) {
            return false;
        }

        values.push(id);

        const result = await database.execute(
            `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return (result as any).affectedRows > 0;
    }

    static async deleteCustomer(id: number): Promise<boolean> {
        const result = await database.execute(
            'DELETE FROM customers WHERE id = ?',
            [id]
        );

        return (result as any).affectedRows > 0;
    }

    static async findOrCreateCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
        // Try to find existing customer by email
        let customer = await this.getCustomerByEmail(customerData.email);

        if (!customer) {
            // Try to find by phone
            customer = await this.getCustomerByPhone(customerData.phone);
        }

        if (!customer) {
            // Create new customer
            customer = await this.createCustomer(customerData);
        }

        return customer;
    }
} 