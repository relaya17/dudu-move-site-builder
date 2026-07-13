/**
 * AI Agent Tools - כלים שהסוכן יכול להפעיל
 * כל כלי מוגדר עם schema ופונקציית execute
 */

import { MongoService } from '../MongoService';
import { QuoteService } from '../QuoteService';
import { InvoiceService } from '../InvoiceService';
import { EmailService } from '../EmailService';
import { TrackingService } from '../TrackingService';
import { AuditService } from '../AuditService';
import { eventBus } from '../EventBus';
import { PaymentMethod } from 'shared';

// Tool definitions for OpenAI function calling
export const AGENT_TOOLS = [
    {
        type: 'function' as const,
        function: {
            name: 'list_estimates',
            description: 'רשימת הזמנות/לידים. ניתן לסנן לפי סטטוס, תאריך, או חיפוש טקסט.',
            parameters: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        enum: ['pending', 'approved', 'rejected', 'completed'],
                        description: 'סינון לפי סטטוס'
                    },
                    search: {
                        type: 'string',
                        description: 'חיפוש בשם, אימייל או טלפון'
                    },
                    days: {
                        type: 'number',
                        description: 'הזמנות מה-X ימים האחרונים'
                    },
                    limit: {
                        type: 'number',
                        description: 'מספר תוצאות מקסימלי (ברירת מחדל: 10)'
                    }
                }
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_estimate_details',
            description: 'פרטים מלאים של הזמנה ספציפית לפי ID',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    }
                },
                required: ['estimateId']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'update_estimate_status',
            description: 'עדכון סטטוס הזמנה (pending/approved/rejected/completed)',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    },
                    newStatus: {
                        type: 'string',
                        enum: ['pending', 'approved', 'rejected', 'completed'],
                        description: 'הסטטוס החדש'
                    },
                    reason: {
                        type: 'string',
                        description: 'סיבה לשינוי (אופציונלי)'
                    }
                },
                required: ['estimateId', 'newStatus']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'issue_quote',
            description: 'הפקת הצעת מחיר להזמנה',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    }
                },
                required: ['estimateId']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'send_quote_email',
            description: 'שליחת הצעת מחיר במייל ללקוח',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    }
                },
                required: ['estimateId']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'issue_invoice',
            description: 'הפקת חשבונית/קבלה להזמנה שהושלמה',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    },
                    paymentMethod: {
                        type: 'string',
                        enum: ['cash', 'credit_card', 'bank_transfer', 'bit', 'paybox', 'check'],
                        description: 'אמצעי תשלום'
                    },
                    customerId: {
                        type: 'string',
                        description: 'ת.ז. או ח.פ. לקוח (חובה מעל 5000₪)'
                    }
                },
                required: ['estimateId', 'paymentMethod']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'update_tracking_stage',
            description: 'עדכון שלב ההובלה (order_placed/packing/loading/in_transit/unloading/delivered)',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    },
                    stage: {
                        type: 'string',
                        enum: ['order_placed', 'packing', 'loading', 'in_transit', 'unloading', 'delivered'],
                        description: 'השלב החדש'
                    },
                    notes: {
                        type: 'string',
                        description: 'הערות (אופציונלי)'
                    }
                },
                required: ['estimateId', 'stage']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_analytics',
            description: 'נתונים סטטיסטיים על העסק - הזמנות, לקוחות, הכנסות',
            parameters: {
                type: 'object',
                properties: {
                    period: {
                        type: 'string',
                        enum: ['today', 'week', 'month', 'year'],
                        description: 'תקופה לניתוח'
                    }
                }
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'list_customers',
            description: 'רשימת לקוחות',
            parameters: {
                type: 'object',
                properties: {
                    search: {
                        type: 'string',
                        description: 'חיפוש בשם, אימייל או טלפון'
                    },
                    limit: {
                        type: 'number',
                        description: 'מספר תוצאות מקסימלי'
                    }
                }
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_activity_log',
            description: 'יומן פעילות - מה קרה לאחרונה בעסק',
            parameters: {
                type: 'object',
                properties: {
                    days: {
                        type: 'number',
                        description: 'מספר ימים אחורה (ברירת מחדל: 7)'
                    },
                    action: {
                        type: 'string',
                        description: 'סינון לפי סוג פעולה'
                    }
                }
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'classify_lead',
            description: 'סיווג ליד חדש - דחוף/ערך גבוה/רגיל',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה לסיווג'
                    }
                },
                required: ['estimateId']
            }
        }
    },
    {
        type: 'function' as const,
        function: {
            name: 'draft_follow_up',
            description: 'יצירת טיוטת הודעת follow-up ללקוח',
            parameters: {
                type: 'object',
                properties: {
                    estimateId: {
                        type: 'string',
                        description: 'מזהה ההזמנה'
                    },
                    channel: {
                        type: 'string',
                        enum: ['email', 'sms', 'whatsapp'],
                        description: 'ערוץ התקשורת'
                    }
                },
                required: ['estimateId']
            }
        }
    }
];

// Tool execution functions
export class AgentToolExecutor {
    constructor(private tenantId?: string) {}

    async execute(toolName: string, args: Record<string, unknown>): Promise<unknown> {
        switch (toolName) {
            case 'list_estimates':
                return this.listEstimates(args);
            case 'get_estimate_details':
                return this.getEstimateDetails(args.estimateId as string);
            case 'update_estimate_status':
                return this.updateEstimateStatus(
                    args.estimateId as string,
                    args.newStatus as string,
                    args.reason as string | undefined
                );
            case 'issue_quote':
                return this.issueQuote(args.estimateId as string);
            case 'send_quote_email':
                return this.sendQuoteEmail(args.estimateId as string);
            case 'issue_invoice':
                return this.issueInvoice(
                    args.estimateId as string,
                    args.paymentMethod as string,
                    args.customerId as string | undefined
                );
            case 'update_tracking_stage':
                return this.updateTrackingStage(
                    args.estimateId as string,
                    args.stage as string,
                    args.notes as string | undefined
                );
            case 'get_analytics':
                return this.getAnalytics();
            case 'list_customers':
                return this.listCustomers(args);
            case 'get_activity_log':
                return this.getActivityLog(args.days as number | undefined);
            case 'classify_lead':
                return this.classifyLead(args.estimateId as string);
            case 'draft_follow_up':
                return this.draftFollowUp(args.estimateId as string, args.channel as string);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }

    private async listEstimates(args: Record<string, unknown>) {
        const { status, search, days, limit = 10 } = args;
        
        let estimates = await MongoService.getAllMoveEstimates(100, 0, this.tenantId);
        
        if (status) {
            estimates = estimates.filter((e: any) => e.status === status);
        }
        
        if (days && typeof days === 'number') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            estimates = estimates.filter((e: any) => new Date(e.createdAt) >= cutoff);
        }
        
        if (search) {
            const term = (search as string).toLowerCase();
            estimates = estimates.filter((e: any) =>
                e.name?.toLowerCase().includes(term) ||
                e.email?.toLowerCase().includes(term) ||
                e.phone?.includes(term)
            );
        }
        
        const limitNum = typeof limit === 'number' ? limit : 10;
        return estimates.slice(0, limitNum).map((e: any) => ({
            id: e._id,
            name: e.name,
            phone: e.phone,
            status: e.status,
            totalPrice: e.totalPrice,
            moveDate: e.preferredMoveDate,
            createdAt: e.createdAt
        }));
    }

    private async getEstimateDetails(estimateId: string) {
        const estimate = await MongoService.getMoveEstimateById(estimateId, this.tenantId);
        if (!estimate) return { error: 'הזמנה לא נמצאה' };
        return estimate;
    }

    private async updateEstimateStatus(estimateId: string, newStatus: string, reason?: string) {
        const estimate = await MongoService.getMoveEstimateById(estimateId, this.tenantId);
        if (!estimate) return { error: 'הזמנה לא נמצאה' };

        const oldStatus = estimate.status;
        const updated = await MongoService.updateMoveEstimateStatus(estimateId, newStatus as any, this.tenantId);
        
        if (updated) {
            eventBus.emit('estimate.status_changed', {
                estimateId,
                tenantId: this.tenantId,
                oldStatus,
                newStatus,
                updatedBy: 'ai_agent'
            });

            AuditService.logSystem('status_change', 'estimate', this.tenantId, estimateId, {
                oldStatus,
                newStatus,
                reason,
                triggeredBy: 'ai_agent'
            });
        }

        return { success: true, message: `סטטוס עודכן מ-${oldStatus} ל-${newStatus}` };
    }

    private async issueQuote(estimateId: string) {
        try {
            const quote = await QuoteService.issueQuote(estimateId, this.tenantId);
            if (!quote) return { error: 'הזמנה לא נמצאה' };
            
            const quoteNumber = quote.quote?.quoteNumber;
            
            eventBus.emit('estimate.quote_issued', {
                estimateId,
                tenantId: this.tenantId,
                quoteNumber: quoteNumber || '',
                amount: quote.totalPrice || 0
            });

            return { success: true, quoteNumber, message: 'הצעת מחיר הופקה בהצלחה' };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    private async sendQuoteEmail(estimateId: string) {
        const estimate = await MongoService.getMoveEstimateById(estimateId, this.tenantId);
        if (!estimate) return { error: 'הזמנה לא נמצאה' };
        if (!estimate.quote?.quoteNumber) return { error: 'אין הצעת מחיר להזמנה זו. יש להפיק הצעת מחיר תחילה.' };

        try {
            await EmailService.sendQuoteEmail({
                to: estimate.email,
                name: estimate.name,
                quoteNumber: estimate.quote.quoteNumber,
                totalPrice: estimate.totalPrice,
                fromAddress: estimate.currentAddress,
                toAddress: estimate.destinationAddress,
                moveDate: estimate.preferredMoveDate
            });
            
            eventBus.emit('estimate.quote_sent', {
                estimateId,
                tenantId: this.tenantId,
                recipientEmail: estimate.email
            });

            return { success: true, message: `הצעת מחיר נשלחה ל-${estimate.email}` };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    private async issueInvoice(estimateId: string, paymentMethod: string, customerId?: string) {
        try {
            const invoice = await InvoiceService.issueInvoiceReceipt(
                estimateId,
                {
                    paymentMethod: paymentMethod as PaymentMethod,
                    customerIdNumber: customerId
                },
                this.tenantId
            );
            if (!invoice) return { error: 'הזמנה לא נמצאה' };

            const invoiceNumber = invoice.invoice?.documentNumber;

            eventBus.emit('estimate.invoice_issued', {
                estimateId,
                tenantId: this.tenantId,
                invoiceNumber: invoiceNumber || '',
                amount: invoice.totalPrice || 0
            });

            return { success: true, invoiceNumber, message: 'חשבונית הופקה בהצלחה' };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    private async updateTrackingStage(estimateId: string, stage: string, notes?: string) {
        try {
            // First get the estimate to get its tracking token
            const estimate = await MongoService.getMoveEstimateById(estimateId, this.tenantId);
            if (!estimate) return { error: 'הזמנה לא נמצאה' };

            await TrackingService.updateStage(estimate.trackingToken, stage, notes);
            
            eventBus.emit('tracking.stage_changed', {
                estimateId,
                tenantId: this.tenantId,
                oldStage: estimate.stage || '',
                newStage: stage,
                trackingToken: estimate.trackingToken
            });

            return { success: true, message: `שלב עודכן ל-${stage}` };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    private async getAnalytics() {
        const analytics = await MongoService.getAnalytics(this.tenantId);
        return analytics;
    }

    private async listCustomers(args: Record<string, unknown>) {
        const { search, limit = 20 } = args;
        
        if (search) {
            return MongoService.searchCustomers(search as string, this.tenantId);
        }
        
        const customers = await MongoService.getAllCustomers(50, 0, this.tenantId);
        const limitNum = typeof limit === 'number' ? limit : 20;
        return customers.slice(0, limitNum);
    }

    private async getActivityLog(days = 7) {
        if (!this.tenantId) return { error: 'נדרש tenantId' };
        
        return AuditService.getActivitySummary(this.tenantId, days);
    }

    private async classifyLead(estimateId: string) {
        const estimate = await MongoService.getMoveEstimateById(estimateId, this.tenantId);
        if (!estimate) return { error: 'הזמנה לא נמצאה' };

        const classifications: string[] = [];
        const price = estimate.totalPrice || 0;
        const moveDate = new Date(estimate.preferredMoveDate);
        const daysUntilMove = Math.ceil((moveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        // Urgent if move is within 7 days
        if (daysUntilMove <= 7 && daysUntilMove > 0) {
            classifications.push('urgent');
        }

        // High value if over 5000₪
        if (price >= 5000) {
            classifications.push('high_value');
        }

        // Has special items (crane usage or large apartment)
        if (estimate.originHasCrane || estimate.destinationHasCrane) {
            classifications.push('special_handling');
        }

        return {
            estimateId,
            name: estimate.name,
            classifications: classifications.length ? classifications : ['normal'],
            details: {
                price,
                daysUntilMove,
                hasSpecialItems: classifications.includes('special_handling')
            },
            recommendation: this.getLeadRecommendation(classifications, daysUntilMove)
        };
    }

    private getLeadRecommendation(classifications: string[], daysUntilMove: number): string {
        if (classifications.includes('urgent')) {
            return 'ליד דחוף! יש להתקשר ללקוח מיידית.';
        }
        if (classifications.includes('high_value')) {
            return 'ליד בערך גבוה - מומלץ להתקשר תוך שעה.';
        }
        if (daysUntilMove <= 14) {
            return 'יש לטפל בליד תוך 24 שעות.';
        }
        return 'ליד רגיל - ניתן לטפל במהלך יום העבודה.';
    }

    private async draftFollowUp(estimateId: string, channel: string) {
        const estimate = await MongoService.getMoveEstimateById(estimateId, this.tenantId);
        if (!estimate) return { error: 'הזמנה לא נמצאה' };

        const name = estimate.name?.split(' ')[0] || 'לקוח יקר';
        const price = estimate.totalPrice?.toLocaleString('he-IL') || '---';
        const date = estimate.preferredMoveDate 
            ? new Date(estimate.preferredMoveDate).toLocaleDateString('he-IL')
            : 'לא צוין';

        let message = '';
        
        if (channel === 'sms' || channel === 'whatsapp') {
            message = `שלום ${name}! קיבלנו את בקשתך להובלה בתאריך ${date}. המחיר המשוער: ₪${price}. לאישור או שאלות - השב להודעה זו או התקשר 054-7777623`;
        } else {
            message = `שלום ${name},

תודה שפנית אלינו!

קיבלנו את בקשתך להובלה:
📅 תאריך מבוקש: ${date}
💰 מחיר משוער: ₪${price}

אנחנו זמינים לכל שאלה.
לאישור ההזמנה - פשוט השב למייל זה.

בברכה,
צוות ההובלות`;
        }

        return {
            channel,
            recipient: channel === 'email' ? estimate.email : estimate.phone,
            subject: channel === 'email' ? `אישור בקשת הובלה - ${date}` : undefined,
            message,
            note: 'זוהי טיוטה. יש לעבור ולאשר לפני שליחה.'
        };
    }
}
