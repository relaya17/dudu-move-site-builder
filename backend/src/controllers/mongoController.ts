import { Request, Response } from 'express';
import { ESTIMATE_STATUSES, EstimateStatus, PAYMENT_METHODS, PaymentMethod } from 'shared';
import { MongoService } from '../services/MongoService';
import { QuoteService } from '../services/QuoteService';
import { InvoiceService } from '../services/InvoiceService';
import { EmailService } from '../services/EmailService';

// הערה על req.tenantId בכל מתודה כאן: זה הבקר המשותף לשתי מערכות הרשאה -
// הישן (requireAdminKey, בלי tenantId - הזרימה החד-דיירית של דוד הובלות) והחדש
// (requireBusinessAuth, עם tenantId - כל דייר/מוביל שנרשם). ר' routes/mongoRoutes.ts
// (ישן) ו-routes/tenantRoutes.ts (חדש) - שניהם מצביעים על אותם controllers,
// וההבדל היחיד הוא אם req.tenantId מוגדר או לא. לעולם אין להסיר את ה-tenantId
// מהקריאות ל-MongoService - זה מה שמבטיח בידוד בין דיירים.

export class MongoController {
    // Move Estimate Controllers
    // הערה: יצירת הערכה חדשה מתבצעת אך ורק דרך POST /api/move-requests
    // (הכולל ולידציית Zod, חישוב מחיר, יצירת trackingToken ושליחת מייל אישור).

    static async getMoveEstimateById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const estimate = await MongoService.getMoveEstimateById(id, req.tenantId);

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
                    parseInt(skip as string),
                    req.tenantId
                );
            } else {
                estimates = await MongoService.getAllMoveEstimates(
                    parseInt(limit as string),
                    parseInt(skip as string),
                    req.tenantId
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

            const estimate = await MongoService.updateMoveEstimateStatus(id, status as EstimateStatus, req.tenantId);

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
    // הגנה כפולה (defense in depth): גם getMoveEstimateById וגם QuoteService עצמו
    // מסננים לפי tenantId, כך שאין תלות בסדר הקריאות בלבד.
    static async issueQuote(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const owned = await MongoService.getMoveEstimateById(id, req.tenantId);
            if (!owned) {
                res.status(404).json({ success: false, message: 'Move estimate not found' });
                return;
            }

            const estimate = await QuoteService.issueQuote(id, req.tenantId);

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

    // הפקת חשבונית מס/קבלה - עצמאית (built_in) או דרך ספק חשבוניות חיצוני, לפי BusinessSettings.
    // אמצעי תשלום (paymentMethod) הוא שדה חובה בגוף הבקשה, ות.ז/ח.פ הלקוח
    // (customerIdNumber) נדרש בפועל מעל 5,000 ₪ - ר' InvoiceService לאכיפה המלאה.
    static async issueInvoice(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { paymentMethod, customerIdNumber } = req.body as {
                paymentMethod?: string;
                customerIdNumber?: string;
            };

            const owned = await MongoService.getMoveEstimateById(id, req.tenantId);
            if (!owned) {
                res.status(404).json({ success: false, message: 'Move estimate not found' });
                return;
            }

            if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
                res.status(400).json({
                    success: false,
                    message: `יש לבחור אמצעי תשלום תקין: ${PAYMENT_METHODS.join(', ')}`
                });
                return;
            }

            const estimate = await InvoiceService.issueInvoiceReceipt(
                id,
                { paymentMethod: paymentMethod as PaymentMethod, customerIdNumber },
                req.tenantId
            );

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
            // שגיאות ולידציה עסקית (למשל חסר ת.ז מעל 5,000 ₪) הן 400, לא 500 -
            // הן תקלת קלט, לא תקלת שרת.
            const message = error instanceof Error ? error.message : 'Failed to issue invoice';
            res.status(400).json({
                success: false,
                message,
                error: message
            });
        }
    }

    /**
     * הפקת חשבוניות באצווה (Turbo Processing).
     * גוף: { ids: string[], paymentMethod, customerIdNumber? }
     * מחזיר תוצאה לכל מזהה (הצלחה/כישלון) בלי לעצור על השגיאה הראשונה.
     */
    static async batchIssueInvoices(req: Request, res: Response): Promise<void> {
        try {
            const { ids, paymentMethod, customerIdNumber } = req.body as {
                ids?: string[];
                paymentMethod?: string;
                customerIdNumber?: string;
            };

            if (!Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({ success: false, message: 'יש לספק רשימת מזהי הזמנות' });
                return;
            }
            if (ids.length > 50) {
                res.status(400).json({ success: false, message: 'מקסימום 50 חשבוניות באצווה אחת' });
                return;
            }
            if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
                res.status(400).json({
                    success: false,
                    message: `יש לבחור אמצעי תשלום תקין: ${PAYMENT_METHODS.join(', ')}`
                });
                return;
            }

            const results: Array<{ id: string; success: boolean; error?: string }> = [];

            for (const id of ids) {
                try {
                    const owned = await MongoService.getMoveEstimateById(id, req.tenantId);
                    if (!owned) {
                        results.push({ id, success: false, error: 'הזמנה לא נמצאה' });
                        continue;
                    }
                    await InvoiceService.issueInvoiceReceipt(
                        id,
                        { paymentMethod: paymentMethod as PaymentMethod, customerIdNumber },
                        req.tenantId
                    );
                    results.push({ id, success: true });
                } catch (err) {
                    results.push({
                        id,
                        success: false,
                        error: err instanceof Error ? err.message : 'שגיאה בהפקה',
                    });
                }
            }

            const succeeded = results.filter(r => r.success).length;
            res.status(200).json({
                success: true,
                data: {
                    results,
                    summary: { total: ids.length, succeeded, failed: ids.length - succeeded },
                },
            });
        } catch (error) {
            console.error('Error batch issuing invoices:', error);
            res.status(500).json({
                success: false,
                message: 'הפקת חשבוניות באצווה נכשלה',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // שולח הצעת מחיר במייל ללקוח (מנפיק מספר הצעה אם עדיין לא קיים)
    static async sendQuoteEmail(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const owned = await MongoService.getMoveEstimateById(id, req.tenantId);
            if (!owned) {
                res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
                return;
            }

            const estimate = await QuoteService.issueQuote(id, req.tenantId);

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
            const deleted = await MongoService.deleteMoveEstimate(id, req.tenantId);

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
            const customer = await MongoService.getCustomerByEmail(email, req.tenantId);

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
                parseInt(skip as string),
                req.tenantId
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
            const analytics = await MongoService.getAnalytics(req.tenantId);

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

            const estimates = await MongoService.searchMoveEstimates(q, req.tenantId);

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

            const customers = await MongoService.searchCustomers(q, req.tenantId);

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

    // Calendar Note Controllers - הערות חופשיות בלוח השנה של הדשבורד
    static async getCalendarNotes(req: Request, res: Response): Promise<void> {
        try {
            const { from, to } = req.query;
            const notes = await MongoService.getCalendarNotes(
                typeof from === 'string' ? from : undefined,
                typeof to === 'string' ? to : undefined,
                req.tenantId
            );

            res.status(200).json({
                success: true,
                data: notes,
                count: notes.length
            });
        } catch (error) {
            console.error('Error getting calendar notes:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get calendar notes',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async createCalendarNote(req: Request, res: Response): Promise<void> {
        try {
            const { date, text } = req.body as { date?: string; text?: string };

            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                res.status(400).json({ success: false, message: 'תאריך לא תקין (נדרש YYYY-MM-DD)' });
                return;
            }
            if (!text || !text.trim()) {
                res.status(400).json({ success: false, message: 'טקסט ההערה לא יכול להיות ריק' });
                return;
            }

            const note = await MongoService.createCalendarNote(date, text.trim(), req.tenantId);

            res.status(201).json({ success: true, data: note });
        } catch (error) {
            console.error('Error creating calendar note:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create calendar note',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    static async deleteCalendarNote(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await MongoService.deleteCalendarNote(id, req.tenantId);

            if (!deleted) {
                res.status(404).json({ success: false, message: 'הערה לא נמצאה' });
                return;
            }

            res.status(200).json({ success: true, message: 'ההערה נמחקה בהצלחה' });
        } catch (error) {
            console.error('Error deleting calendar note:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete calendar note',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
