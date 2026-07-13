import { EventEmitter } from 'events';

// Type-safe event definitions
export interface AppEvents {
    // Lead/Estimate events
    'estimate.created': { estimateId: string; tenantId?: string; customerEmail: string; totalPrice: number; moveDate: string };
    'estimate.status_changed': { estimateId: string; tenantId?: string; oldStatus: string; newStatus: string; updatedBy?: string };
    'estimate.quote_issued': { estimateId: string; tenantId?: string; quoteNumber: string; amount: number };
    'estimate.quote_sent': { estimateId: string; tenantId?: string; recipientEmail: string };
    'estimate.invoice_issued': { estimateId: string; tenantId?: string; invoiceNumber: string; amount: number };

    // Tracking events
    'tracking.stage_changed': { estimateId: string; tenantId?: string; oldStage: string; newStage: string; trackingToken: string };
    'tracking.location_updated': { estimateId: string; tenantId?: string; lat: number; lng: number };

    // Customer events
    'customer.created': { customerId: string; tenantId?: string; email: string; name: string };
    'customer.tracking_viewed': { trackingToken: string; tenantId?: string; timestamp: Date };

    // Review events
    'review.created': { reviewId: string; tenantId?: string; customerName: string; rating: number };
    'review.replied': { reviewId: string; tenantId?: string; reply: string };

    // Auth events
    'auth.login': { userId?: string; tenantId?: string; email: string; role: string; success: boolean };
    'auth.logout': { userId?: string; tenantId?: string };

    // AI events
    'ai.chat': { tenantId?: string; userId?: string; messageCount: number; tokensUsed?: number };

    // Settings events
    'settings.updated': { tenantId: string; updatedFields: string[] };

    // Webhook events (for outbound)
    'webhook.trigger': { tenantId: string; event: string; payload: unknown };
}

type EventName = keyof AppEvents;
type EventPayload<E extends EventName> = AppEvents[E];

class TypedEventBus {
    private emitter = new EventEmitter();
    private handlers: Map<string, Array<(payload: unknown) => Promise<void>>> = new Map();

    constructor() {
        // Allow many listeners for automation
        this.emitter.setMaxListeners(50);
    }

    /**
     * Emit an event - fire and forget, handlers run async
     */
    emit<E extends EventName>(event: E, payload: EventPayload<E>): void {
        console.log(`[EventBus] Emitting: ${event}`, JSON.stringify(payload).slice(0, 200));
        this.emitter.emit(event, payload);

        // Also trigger automation handlers
        const handlers = this.handlers.get(event) || [];
        for (const handler of handlers) {
            handler(payload).catch(err => {
                console.error(`[EventBus] Handler error for ${event}:`, err.message);
            });
        }
    }

    /**
     * Subscribe to an event (for real-time listeners)
     */
    on<E extends EventName>(event: E, listener: (payload: EventPayload<E>) => void): void {
        this.emitter.on(event, listener);
    }

    /**
     * Unsubscribe from an event
     */
    off<E extends EventName>(event: E, listener: (payload: EventPayload<E>) => void): void {
        this.emitter.off(event, listener);
    }

    /**
     * Register an async automation handler
     */
    registerAutomation<E extends EventName>(
        event: E,
        handler: (payload: EventPayload<E>) => Promise<void>
    ): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler as (payload: unknown) => Promise<void>);
        console.log(`[EventBus] Registered automation for: ${event}`);
    }

    /**
     * One-time listener
     */
    once<E extends EventName>(event: E, listener: (payload: EventPayload<E>) => void): void {
        this.emitter.once(event, listener);
    }
}

// Singleton instance
export const eventBus = new TypedEventBus();

// Re-export types for consumers
export type { EventName, EventPayload };
