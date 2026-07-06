import { Request, Response } from 'express';
import { ESTIMATE_STATUSES, EstimateStatus } from 'shared';
import { MongoService } from '../services/MongoService';
import { QuoteService } from '../services/QuoteService';
import { InvoiceService } from '../services/InvoiceService';
import { EmailService } from '../services/EmailService';

export class MongoController {
    // Move Estimate Controllers
    // הערה: יצירת הערכה חדשה מתבצעת אך ורק דרך POST /api/move-requests
    // (הכולל ולידציית Zod, חישוב מחיר, יצירת trackingToken ושליחת מייל אישור).

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

            if (!ESTIMATE_STATUSES.includes(status)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${ESTIMATE_STATUSES.join(', ')}`
                });
                return;
            }

            const estimate = await MongoService.updateMoveEstimateStatus(id, status as EstimateStatus);

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

    // הפקת מספר הצעת מחיר (מסמך לא-פיסקלי) - ה-PDF עצמו נוצר ומודפס בצד הלקוח (frontend).
    static async issueQuote(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const estimate = await QuoteService.issueQuote(id);

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
            console.error('Error issuing quote:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to issue quote',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // הפקת חשבונית מס קבלה (מסמך מס) דרך ספק חשבוניות מורשה חיצוני (Green Invoice).
    static async issueInvoice(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const estimate = await InvoiceService.issueInvoiceReceipt(id);

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
            console.error('Error issuing invoice:', error);
            res.status(error instanceof Error && error.message.includes('לא זמינה') ? 503 : 500).json({
                success: false,
                message: 'Failed to issue invoice',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // שולח הצעת מחיר במייל ללקוח (מנפיק מספר הצעה אם עדיין לא קיים)
    static async sendQuoteEmail(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const estimate = await QuoteService.issueQuote(id);

            if (!estimate) {
                res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
                return;
            }

            if (!estimate.email) {
                res.status(400).json({ success: false, message: 'אין כתובת מייל ללקוח' });
                return;
            }

            await EmailService.sendQuoteEmail({
                to: estimate.email,
                name: estimate.name,
                quoteNumber: estimate.quote!.quoteNumber,
                totalPrice: estimate.totalPrice ?? 0,
                fromAddress: estimate.currentAddress ?? '',
                toAddress: estimate.destinationAddress ?? '',
                moveDate: estimate.preferredMoveDate
                    ? new Date(estimate.preferredMoveDate).toLocaleDateString('he-IL')
                    : 'לא נקבע',
            });

            res.status(200).json({ success: true, quoteNumber: estimate.quote!.quoteNumber });
        } catch (error) {
            console.error('Error sending quote email:', error);
            res.status(500).json({
                success: false,
                message: 'שגיאה בשליחת הצעת המחיר',
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