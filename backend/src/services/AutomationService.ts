/**
 * Automation Service - אוטומציות שמופעלות על ידי אירועים
 */

import { eventBus } from './EventBus';
import { MongoService } from './MongoService';
import { EmailService } from './EmailService';
import { SmsService } from './SmsService';
import { QuoteService } from './QuoteService';
import { AuditService } from './AuditService';

interface WebhookConfig {
    url: string;
    events: string[];
    secret?: string;
    active: boolean;
}

// In-memory webhook registry (in production would be in DB per tenant)
const webhookRegistry: Map<string, WebhookConfig[]> = new Map();

export class AutomationService {
    /**
     * Initialize all automation handlers
     */
    static init(): void {
        console.log('[AutomationService] Initializing automations...');

        // Lead triage on new estimate
        eventBus.registerAutomation('estimate.created', async (payload) => {
            console.log('[Automation] New estimate created:', payload.estimateId);
            await AutomationService.triageLead(payload);
        });

        // Auto-send quote when status changes to approved
        eventBus.registerAutomation('estimate.status_changed', async (payload) => {
            console.log('[Automation] Status changed:', payload);
            
            if (payload.newStatus === 'approved' && payload.oldStatus === 'pending') {
                await AutomationService.handleApproval(payload.estimateId, payload.tenantId);
            }
            
            if (payload.newStatus === 'completed') {
                await AutomationService.handleCompletion(payload.estimateId, payload.tenantId);
            }
        });

        // Notify customer on tracking stage change
        eventBus.registerAutomation('tracking.stage_changed', async (payload) => {
            console.log('[Automation] Tracking stage changed:', payload);
            await AutomationService.notifyCustomerStageChange(payload);
        });

        // Log new reviews
        eventBus.registerAutomation('review.created', async (payload) => {
            console.log('[Automation] New review:', payload);
            // Could send notification to business owner
        });

        // Trigger webhooks for any event
        eventBus.registerAutomation('webhook.trigger', async (payload) => {
            await AutomationService.sendWebhooks(
                payload.tenantId,
                payload.event,
                payload.payload
            );
        });

        console.log('[AutomationService] Automations initialized');
    }

    /**
     * Triage a new lead and determine priority
     */
    private static async triageLead(payload: {
        estimateId: string;
        tenantId?: string;
        customerEmail: string;
        totalPrice: number;
        moveDate: string;
    }): Promise<void> {
        const { estimateId, tenantId, totalPrice, moveDate } = payload;
        
        const moveDateObj = new Date(moveDate);
        const daysUntilMove = Math.ceil((moveDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        let priority: 'urgent' | 'high' | 'normal' = 'normal';
        
        if (daysUntilMove <= 3) {
            priority = 'urgent';
        } else if (daysUntilMove <= 7 || totalPrice >= 5000) {
            priority = 'high';
        }

        // Log the triage
        AuditService.logSystem('create', 'estimate', tenantId, estimateId, {
            priority,
            daysUntilMove,
            totalPrice,
            triageReason: priority === 'urgent' ? 'תאריך קרוב מאוד' :
                          priority === 'high' ? (daysUntilMove <= 7 ? 'תאריך קרוב' : 'ערך גבוה') : 'רגיל'
        });

        // For urgent leads, could trigger immediate notification
        if (priority === 'urgent') {
            console.log(`[Automation] URGENT lead! ${estimateId} - move in ${daysUntilMove} days`);
            // Could send push notification / SMS to owner here
        }
    }

    /**
     * Handle estimate approval - auto generate quote
     */
    private static async handleApproval(estimateId: string, tenantId?: string): Promise<void> {
        try {
            const estimate = await MongoService.getMoveEstimateById(estimateId, tenantId);
            if (!estimate) return;

            // Auto-issue quote if not already issued
            if (!estimate.quote?.quoteNumber) {
                console.log('[Automation] Auto-issuing quote for approved estimate:', estimateId);
                const quote = await QuoteService.issueQuote(estimateId, tenantId);
                
                if (quote?.quote?.quoteNumber) {
                    AuditService.logSystem('quote_issued', 'quote', tenantId, estimateId, {
                        quoteNumber: quote.quote.quoteNumber,
                        automated: true
                    });
                }
            }
        } catch (err: any) {
            console.error('[Automation] Error auto-issuing quote:', err.message);
        }
    }

    /**
     * Handle estimate completion - send satisfaction survey link
     */
    private static async handleCompletion(estimateId: string, tenantId?: string): Promise<void> {
        try {
            const estimate = await MongoService.getMoveEstimateById(estimateId, tenantId);
            if (!estimate) return;

            console.log('[Automation] Move completed, could send satisfaction survey:', estimateId);
            // Could send review request email here
            
            AuditService.logSystem('status_change', 'estimate', tenantId, estimateId, {
                action: 'completion_processed',
                automated: true
            });
        } catch (err: any) {
            console.error('[Automation] Error handling completion:', err.message);
        }
    }

    /**
     * Notify customer when tracking stage changes
     */
    private static async notifyCustomerStageChange(payload: {
        estimateId: string;
        tenantId?: string;
        newStage: string;
        trackingToken: string;
    }): Promise<void> {
        const { estimateId, tenantId, newStage, trackingToken } = payload;

        try {
            const estimate = await MongoService.getMoveEstimateById(estimateId, tenantId);
            if (!estimate || !estimate.phone) return;

            const stageMessages: Record<string, string> = {
                packing: 'צוות האריזה שלנו מתחיל לעבוד!',
                loading: 'מתחילים להעמיס את הציוד שלך',
                in_transit: 'המשאית בדרך ליעד! 🚚',
                unloading: 'הגענו! מתחילים לפרוק',
                delivered: 'ההובלה הושלמה בהצלחה! ✅'
            };

            const message = stageMessages[newStage];
            if (!message) return;

            // Could send SMS here if SmsService is configured
            console.log(`[Automation] Would notify ${estimate.phone}: ${message}`);
            
            AuditService.logSystem('tracking_update', 'tracking', tenantId, estimateId, {
                stage: newStage,
                notificationSent: true
            });
        } catch (err: any) {
            console.error('[Automation] Error notifying customer:', err.message);
        }
    }

    /**
     * Send webhooks to registered endpoints
     */
    private static async sendWebhooks(
        tenantId: string,
        event: string,
        payload: unknown
    ): Promise<void> {
        const configs = webhookRegistry.get(tenantId) || [];
        
        for (const config of configs) {
            if (!config.active) continue;
            if (!config.events.includes(event) && !config.events.includes('*')) continue;

            try {
                const response = await fetch(config.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(config.secret ? { 'X-Webhook-Secret': config.secret } : {})
                    },
                    body: JSON.stringify({
                        event,
                        timestamp: new Date().toISOString(),
                        tenantId,
                        payload
                    })
                });

                console.log(`[Webhook] Sent to ${config.url}: ${response.status}`);
            } catch (err: any) {
                console.error(`[Webhook] Failed to send to ${config.url}:`, err.message);
            }
        }
    }

    /**
     * Register a webhook for a tenant
     */
    static registerWebhook(tenantId: string, config: WebhookConfig): void {
        const existing = webhookRegistry.get(tenantId) || [];
        existing.push(config);
        webhookRegistry.set(tenantId, existing);
        console.log(`[AutomationService] Webhook registered for tenant ${tenantId}`);
    }

    /**
     * Trigger webhook event manually
     */
    static triggerWebhook(tenantId: string, event: string, payload: unknown): void {
        eventBus.emit('webhook.trigger', { tenantId, event, payload });
    }
}
