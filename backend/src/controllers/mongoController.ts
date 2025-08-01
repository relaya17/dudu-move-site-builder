import { Request, Response } from 'express';
import { MongoService } from '../services/MongoService';

export class MongoController {
    // Move Estimate Controllers
    static async createMoveEstimate(req: Request, res: Response): Promise<void> {
        try {
            const estimateData = req.body;
            const estimate = await MongoService.createMoveEstimate(estimateData);

            res.status(201).json({
                success: true,
                data: estimate,
                message: 'Move estimate created successfully'
            });
        } catch (error) {
            console.error('Error creating move estimate:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create move estimate',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getMoveEstimateById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const estimate = await MongoService.getMoveEstimateById(id);

            if (!estimate) {
                res.status(404).json({
                    success: false,
                    message: 'Move estimate not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: estimate
            });
        } catch (error) {
            console.error('Error getting move estimate:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get move estimate',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAllMoveEstimates(req: Request, res: Response): Promise<void> {
        try {
            const { limit = 50, skip = 0, status } = req.query;

            let estimates;
            if (status) {
                estimates = await MongoService.getMoveEstimatesByStatus(
                    status as string,
                    parseInt(limit as string),
                    parseInt(skip as string)
                );
            } else {
                estimates = await MongoService.getAllMoveEstimates(
                    parseInt(limit as string),
                    parseInt(skip as string)
                );
            }

            res.status(200).json({
                success: true,
                data: estimates,
                count: estimates.length
            });
        } catch (error) {
            console.error('Error getting move estimates:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get move estimates',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async updateMoveEstimateStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
            if (!validStatuses.includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be one of: pending, approved, rejected, completed'
                });
                return;
            }

            const estimate = await MongoService.updateMoveEstimateStatus(id, status);

            if (!estimate) {
                res.status(404).json({
                    success: false,
                    message: 'Move estimate not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: estimate,
                message: 'Move estimate status updated successfully'
            });
        } catch (error) {
            console.error('Error updating move estimate status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update move estimate status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async deleteMoveEstimate(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await MongoService.deleteMoveEstimate(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Move estimate not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Move estimate deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting move estimate:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete move estimate',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Customer Controllers
    static async getCustomerByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            const customer = await MongoService.getCustomerByEmail(email);

            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: customer
            });
        } catch (error) {
            console.error('Error getting customer:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get customer',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async getAllCustomers(req: Request, res: Response): Promise<void> {
        try {
            const { limit = 50, skip = 0 } = req.query;
            const customers = await MongoService.getAllCustomers(
                parseInt(limit as string),
                parseInt(skip as string)
            );

            res.status(200).json({
                success: true,
                data: customers,
                count: customers.length
            });
        } catch (error) {
            console.error('Error getting customers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get customers',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Analytics Controllers
    static async getAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const analytics = await MongoService.getAnalytics();

            res.status(200).json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Error getting analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get analytics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Search Controllers
    static async searchMoveEstimates(req: Request, res: Response): Promise<void> {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
                return;
            }

            const estimates = await MongoService.searchMoveEstimates(q);

            res.status(200).json({
                success: true,
                data: estimates,
                count: estimates.length
            });
        } catch (error) {
            console.error('Error searching move estimates:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search move estimates',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async searchCustomers(req: Request, res: Response): Promise<void> {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
                return;
            }

            const customers = await MongoService.searchCustomers(q);

            res.status(200).json({
                success: true,
                data: customers,
                count: customers.length
            });
        } catch (error) {
            console.error('Error searching customers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search customers',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 