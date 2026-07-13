import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
    | 'login'
    | 'logout'
    | 'view'
    | 'create'
    | 'update'
    | 'delete'
    | 'status_change'
    | 'quote_issued'
    | 'quote_sent'
    | 'invoice_issued'
    | 'tracking_update'
    | 'review_reply'
    | 'settings_update'
    | 'employee_add'
    | 'employee_remove'
    | 'ai_chat'
    | 'export';

export type AuditResource =
    | 'estimate'
    | 'customer'
    | 'review'
    | 'invoice'
    | 'quote'
    | 'settings'
    | 'employee'
    | 'tracking'
    | 'analytics'
    | 'report'
    | 'session';

export interface IAuditLog extends Document {
    tenantId?: string;
    userId?: string;
    userEmail?: string;
    userRole?: 'owner' | 'manager' | 'driver' | 'admin' | 'system';
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        tenantId: { type: String, index: true },
        userId: { type: String, index: true },
        userEmail: { type: String },
        userRole: { type: String, enum: ['owner', 'manager', 'driver', 'admin', 'system'] },
        action: {
            type: String,
            required: true,
            enum: [
                'login', 'logout', 'view', 'create', 'update', 'delete',
                'status_change', 'quote_issued', 'quote_sent', 'invoice_issued',
                'tracking_update', 'review_reply', 'settings_update',
                'employee_add', 'employee_remove', 'ai_chat', 'export'
            ],
            index: true
        },
        resource: {
            type: String,
            required: true,
            enum: [
                'estimate', 'customer', 'review', 'invoice', 'quote',
                'settings', 'employee', 'tracking', 'analytics', 'report', 'session'
            ],
            index: true
        },
        resourceId: { type: String },
        details: { type: Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String },
        success: { type: Boolean, default: true },
        errorMessage: { type: String }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        capped: { size: 104857600, max: 100000 } // 100MB or 100K docs, auto-cleanup old entries
    }
);

// TTL index - auto delete after 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Compound indexes for common queries
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, resource: 1, resourceId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
