import database from '../database/connection';
import { Customer, CreateCustomerRequest } from '../types/moveTypes';

export class CustomerService {

    // יצירת לקוח חדש במסד הנתונים
    static async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
        const result = await database.execute(
            `INSERT INTO customers (name, email, phone) 
       VALUES (?, ?, ?)`,
            [
                customerData.name,
                customerData.email,
                customerData.phone
            ]
        );

        const insertId = (result as any).insertId;

        return {
            id: insertId.toString(),
            name: customerData.name,
            email: customerData.email || '',
            phone: customerData.phone,
            created_at: new Date()
        };
    }

    // שליפת כל הלקוחות ממסד הנתונים (בסדר יורד לפי תאריך יצירה)
    static async getAllCustomers(): Promise<Customer[]> {
        const [rows] = await database.query(
            'SELECT * FROM customers ORDER BY created_at DESC'
        );

        return rows as Customer[];
    }

    // שליפת לקוח לפי מזהה ייחודי (ID)
    static async getCustomerById(id: number): Promise<Customer | null> {
        const [rows] = await database.query(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );

        if ((rows as any[]).length === 0) return null;

        return (rows as any[])[0] as Customer;
    }

    // שליפת לקוח לפי כתובת אימייל
    static async getCustomerByEmail(email: string): Promise<Customer | null> {
        const [rows] = await database.query(
            'SELECT * FROM customers WHERE email = ?',
            [email]
        );

        if ((rows as any[]).length === 0) return null;

        return (rows as any[])[0] as Customer;
    }

    // שליפת לקוח לפי מספר טלפון
    static async getCustomerByPhone(phone: string): Promise<Customer | null> {
        const [rows] = await database.query(
            'SELECT * FROM customers WHERE phone = ?',
            [phone]
        );

        if ((rows as any[]).length === 0) return null;

        return (rows as any[])[0] as Customer;
    }

    // עדכון לקוח לפי ID (רק שדות שנשלחו בפועל)
    static async updateCustomer(id: number, customerData: Partial<CreateCustomerRequest>): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        Object.entries(customerData).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) return false;

        values.push(id);

        const result = await database.execute(
            `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return (result as any).affectedRows > 0;
    }

    // מחיקת לקוח לפי ID
    static async deleteCustomer(id: number): Promise<boolean> {
        const result = await database.execute(
            'DELETE FROM customers WHERE id = ?',
            [id]
        );

        return (result as any).affectedRows > 0;
    }

    // חיפוש לקוח קיים לפי אימייל או טלפון, ואם לא קיים - יצירתו
    static async findOrCreateCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
        // ניסיון למצוא לקוח קיים לפי אימייל
        let customer = await this.getCustomerByEmail(customerData.email || '');

        if (!customer) {
            // אם לא נמצא לפי אימייל, ננסה לפי טלפון
            customer = await this.getCustomerByPhone(customerData.phone);
        }

        if (!customer) {
            // אם עדיין לא נמצא - ניצור לקוח חדש
            customer = await this.createCustomer(customerData);
        }

        return customer;
    }
}
