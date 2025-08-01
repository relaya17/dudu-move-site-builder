import { MoveEstimate, IMoveEstimate } from '../database/models/MoveEstimate';
import { Customer, ICustomer } from '../database/models/Customer';

export class MongoService {
    // Move Estimate Methods
    static async createMoveEstimate(estimateData: Partial<IMoveEstimate>): Promise<IMoveEstimate> {
        try {
            const estimate = new MoveEstimate(estimateData);
            const savedEstimate = await estimate.save();

            // Update or create customer
            await this.updateCustomerStats(estimateData.email!, estimateData.name!, estimateData.phone!, savedEstimate.totalPrice);

            return savedEstimate;
        } catch (error) {
            console.error('Error creating move estimate:', error);
            throw new Error('Failed to create move estimate');
        }
    }

    static async getMoveEstimateById(id: string): Promise<IMoveEstimate | null> {
        try {
            return await MoveEstimate.findById(id);
        } catch (error) {
            console.error('Error getting move estimate:', error);
            throw new Error('Failed to get move estimate');
        }
    }

    static async getAllMoveEstimates(limit: number = 50, skip: number = 0): Promise<IMoveEstimate[]> {
        try {
            return await MoveEstimate.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            console.error('Error getting all move estimates:', error);
            throw new Error('Failed to get move estimates');
        }
    }

    static async getMoveEstimatesByStatus(status: string, limit: number = 50, skip: number = 0): Promise<IMoveEstimate[]> {
        try {
            return await MoveEstimate.find({ status })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            console.error('Error getting move estimates by status:', error);
            throw new Error('Failed to get move estimates by status');
        }
    }

    static async updateMoveEstimateStatus(id: string, status: string): Promise<IMoveEstimate | null> {
        try {
            return await MoveEstimate.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );
        } catch (error) {
            console.error('Error updating move estimate status:', error);
            throw new Error('Failed to update move estimate status');
        }
    }

    static async deleteMoveEstimate(id: string): Promise<boolean> {
        try {
            const result = await MoveEstimate.findByIdAndDelete(id);
            return !!result;
        } catch (error) {
            console.error('Error deleting move estimate:', error);
            throw new Error('Failed to delete move estimate');
        }
    }

    // Customer Methods
    static async getCustomerByEmail(email: string): Promise<ICustomer | null> {
        try {
            return await Customer.findOne({ email });
        } catch (error) {
            console.error('Error getting customer by email:', error);
            throw new Error('Failed to get customer');
        }
    }

    static async getCustomerByPhone(phone: string): Promise<ICustomer | null> {
        try {
            return await Customer.findOne({ phone });
        } catch (error) {
            console.error('Error getting customer by phone:', error);
            throw new Error('Failed to get customer');
        }
    }

    static async getAllCustomers(limit: number = 50, skip: number = 0): Promise<ICustomer[]> {
        try {
            return await Customer.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);
        } catch (error) {
            console.error('Error getting all customers:', error);
            throw new Error('Failed to get customers');
        }
    }

    static async updateCustomerStats(email: string, name: string, phone: string, movePrice: number): Promise<void> {
        try {
            const customer = await Customer.findOne({ email });

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
    static async getAnalytics(): Promise<any> {
        try {
            const totalEstimates = await MoveEstimate.countDocuments();
            const totalCustomers = await Customer.countDocuments();
            const totalRevenue = await MoveEstimate.aggregate([
                { $group: { _id: null, total: { $sum: '$totalPrice' } } }
            ]);

            const estimatesByStatus = await MoveEstimate.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            const topCustomers = await Customer.find()
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
    static async searchMoveEstimates(query: string): Promise<IMoveEstimate[]> {
        try {
            return await MoveEstimate.find({
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

    static async searchCustomers(query: string): Promise<ICustomer[]> {
        try {
            return await Customer.find({
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
} 