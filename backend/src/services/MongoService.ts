import { EstimateStatus } from 'shared';
import { MoveEstimate, IMoveEstimate } from '../database/models/MoveEstimate';
import { Customer, ICustomer } from '../database/models/Customer';
import { CalendarNote, ICalendarNote } from '../database/models/CalendarNote';
import { tenantFilter } from '../lib/tenantFilter';

export class MongoService {
    // Move Estimate Methods
    // הערה: יצירת הערכה חדשה מתבצעת אך ורק דרך MovingEstimateService.submitEstimateRequest
    // (הכולל ולידציה, חישוב מחיר, trackingToken ומייל אישור) - כדי למנוע נתיב כפול לא-מתועד.
    //
    // כל מתודה כאן מקבלת tenantId אופציונלי ומסננת דרכו (ר' lib/tenantFilter.ts) -
    // זה מה שמבטיח שדייר אחד (מוביל) לא יראה/ישנה/ימחק נתונים של דייר אחר.

    static async getMoveEstimateById(id: string, tenantId?: string): Promise<IMoveEstimate | null> {
        try {
            return await MoveEstimate.findOne({ _id: id, ...tenantFilter(tenantId) });
        } catch (error) {
            console.error('Error getting move estimate:', error);
            throw new Error('Failed to get move estimate');
        }
    }

    static async getAllMoveEstimates(limit: number = 50, skip: number = 0, tenantId?: string): Promise<IMoveEstimate[]> {
        try {
            return await MoveEstimate.find(tenantFilter(tenantId))
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            console.error('Error getting all move estimates:', error);
            throw new Error('Failed to get move estimates');
        }
    }

    static async getMoveEstimatesByStatus(status: string, limit: number = 50, skip: number = 0, tenantId?: string): Promise<IMoveEstimate[]> {
        try {
            return await MoveEstimate.find({ status, ...tenantFilter(tenantId) })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            console.error('Error getting move estimates by status:', error);
            throw new Error('Failed to get move estimates by status');
        }
    }

    static async updateMoveEstimateStatus(id: string, status: EstimateStatus, tenantId?: string): Promise<IMoveEstimate | null> {
        try {
            return await MoveEstimate.findOneAndUpdate(
                { _id: id, ...tenantFilter(tenantId) },
                { status },
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating move estimate status:', error);
            throw new Error('Failed to update move estimate status');
        }
    }

    static async deleteMoveEstimate(id: string, tenantId?: string): Promise<boolean> {
        try {
            const result = await MoveEstimate.findOneAndDelete({ _id: id, ...tenantFilter(tenantId) });
            return !!result;
        } catch (error) {
            console.error('Error deleting move estimate:', error);
            throw new Error('Failed to delete move estimate');
        }
    }

    // Customer Methods
    static async getCustomerByEmail(email: string, tenantId?: string): Promise<ICustomer | null> {
        try {
            return await Customer.findOne({ email, ...tenantFilter(tenantId) });
        } catch (error) {
            console.error('Error getting customer by email:', error);
            throw new Error('Failed to get customer');
        }
    }

    static async getCustomerByPhone(phone: string, tenantId?: string): Promise<ICustomer | null> {
        try {
            return await Customer.findOne({ phone, ...tenantFilter(tenantId) });
        } catch (error) {
            console.error('Error getting customer by phone:', error);
            throw new Error('Failed to get customer');
        }
    }

    static async getAllCustomers(limit: number = 50, skip: number = 0, tenantId?: string): Promise<ICustomer[]> {
        try {
            return await Customer.find(tenantFilter(tenantId))
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            console.error('Error getting all customers:', error);
            throw new Error('Failed to get customers');
        }
    }

    static async updateCustomerStats(email: string, name: string, phone: string, movePrice: number, tenantId?: string): Promise<void> {
        try {
            const customer = await Customer.findOne({ email, ...tenantFilter(tenantId) });

            if (customer) {
                // Update existing customer
                customer.totalMoves += 1;
                customer.totalSpent += movePrice;
                customer.lastMoveDate = new Date();
                customer.name = name; // Update name in case it changed
                customer.phone = phone; // Update phone in case it changed
                await customer.save();
            } else {
                // Create new customer
                const newCustomer = new Customer({
                    email,
                    name,
                    phone,
                    tenantId: tenantId || undefined,
                    totalMoves: 1,
                    totalSpent: movePrice,
                    lastMoveDate: new Date()
                });
                await newCustomer.save();
            }
        } catch (error) {
            console.error('Error updating customer stats:', error);
            // Don't throw error here as it's not critical for the main flow
        }
    }

    // Analytics Methods
    static async getAnalytics(tenantId?: string): Promise<{
        totalEstimates: number;
        totalCustomers: number;
        totalRevenue: number;
        estimatesByStatus: Array<{ _id: string; count: number }>;
        topCustomers: ICustomer[];
    }> {
        try {
            const filter = tenantFilter(tenantId);
            const totalEstimates = await MoveEstimate.countDocuments(filter);
            const totalCustomers = await Customer.countDocuments(filter);
            const totalRevenue = await MoveEstimate.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const estimatesByStatus = await MoveEstimate.aggregate([
                { $match: filter },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            const topCustomers = await Customer.find(filter)
                .sort({ totalSpent: -1 })
                .limit(10);

            return {
                totalEstimates,
                totalCustomers,
                totalRevenue: totalRevenue[0]?.total || 0,
                estimatesByStatus,
                topCustomers
            };
        } catch (error) {
            console.error('Error getting analytics:', error);
            throw new Error('Failed to get analytics');
        }
    }

    // Search Methods
    static async searchMoveEstimates(query: string, tenantId?: string): Promise<IMoveEstimate[]> {
        try {
            return await MoveEstimate.find({
                ...tenantFilter(tenantId),
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } },
                    { currentAddress: { $regex: query, $options: 'i' } },
                    { destinationAddress: { $regex: query, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error searching move estimates:', error);
            throw new Error('Failed to search move estimates');
        }
    }

    static async searchCustomers(query: string, tenantId?: string): Promise<ICustomer[]> {
        try {
            return await Customer.find({
                ...tenantFilter(tenantId),
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { phone: { $regex: query, $options: 'i' } }
                ]
            }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error searching customers:', error);
            throw new Error('Failed to search customers');
        }
    }

    // Calendar Note Methods - הערות חופשיות של ההנהלה על ימים בלוח השנה
    static async getCalendarNotes(fromDate?: string, toDate?: string, tenantId?: string): Promise<ICalendarNote[]> {
        try {
            const filter: Record<string, unknown> = { ...tenantFilter(tenantId) };
            if (fromDate || toDate) {
                filter.date = {
                    ...(fromDate ? { $gte: fromDate } : {}),
                    ...(toDate ? { $lte: toDate } : {})
                };
            }
            return await CalendarNote.find(filter).sort({ date: 1 });
        } catch (error) {
            console.error('Error getting calendar notes:', error);
            throw new Error('Failed to get calendar notes');
        }
    }

    static async createCalendarNote(date: string, text: string, tenantId?: string): Promise<ICalendarNote> {
        try {
            return await CalendarNote.create({ date, text, tenantId: tenantId || undefined });
        } catch (error) {
            console.error('Error creating calendar note:', error);
            throw new Error('Failed to create calendar note');
        }
    }

    static async deleteCalendarNote(id: string, tenantId?: string): Promise<boolean> {
        try {
            const result = await CalendarNote.findOneAndDelete({ _id: id, ...tenantFilter(tenantId) });
            return Boolean(result);
        } catch (error) {
            console.error('Error deleting calendar note:', error);
            throw new Error('Failed to delete calendar note');
        }
    }
}
