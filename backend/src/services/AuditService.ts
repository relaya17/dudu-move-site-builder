import { Request } from 'express';
import { AuditLog, AuditAction, AuditResource, IAuditLog } from '../database/models/AuditLog';

interface AuditEntry {
    tenantId?: string;
    userId?: string;
    userEmail?: string;
    userRole?: 'owner' | 'manager' | 'driver' | 'admin' | 'system';
    action: AuditAction;
    resource: AuditResource;
    resourceId?: string;
    details?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
}

export class AuditService {
    /**
     * Log an action to the audit trail
     */
    static async log(entry: AuditEntry, req?: Request): Promise<void> {
        try {
            const doc: Partial<IAuditLog> = {
                ...entry,
                success: entry.success ?? true,
                ipAddress: req ? AuditService.getClientIp(req) : undefined,
                userAgent: req?.headers['user-agent']?.slice(0, 500)
            };

            // Fire and forget - don't block the main request
            AuditLog.create(doc).catch(err => {
                console.error('[AuditService] Failed to write audit log:', err.message);
            });
        } catch (err) {
            console.error('[AuditService] Error preparing audit log:', err);
        }
    }

    /**
     * Helper to extract user info from request and log
     */
    static async logFromRequest(
        req: Request,
        action: AuditAction,
        resource: AuditResource,
        resourceId?: string,
        details?: Record<string, unknown>,
        success = true,
        errorMessage?: string
    ): Promise<void> {
        const user = (req as any).user;
        const tenantId = (req as any).tenantId;

        await AuditService.log({
            tenantId,
            userId: user?.id || user?._id,
            userEmail: user?.email,
            userRole: user?.role || (tenantId ? 'owner' : 'admin'),
            action,
            resource,
            resourceId,
            details,
            success,
            errorMessage
        }, req);
    }

    /**
     * Log system-triggered action (cron, automation)
     */
    static async logSystem(
        action: AuditAction,
        resource: AuditResource,
        tenantId?: string,
        resourceId?: string,
        details?: Record<string, unknown>
    ): Promise<void> {
        await AuditService.log({
            tenantId,
            userRole: 'system',
            action,
            resource,
            resourceId,
            details
        });
    }

    /**
     * Get audit logs for a tenant
     */
    static async getLogsForTenant(
        tenantId: string,
        options: {
            action?: AuditAction;
            resource?: AuditResource;
            resourceId?: string;
            startDate?: Date;
            endDate?: Date;
            limit?: number;
            skip?: number;
        } = {}
    ): Promise<IAuditLog[]> {
        const query: Record<string, unknown> = { tenantId };

        if (options.action) query.action = options.action;
        if (options.resource) query.resource = options.resource;
        if (options.resourceId) query.resourceId = options.resourceId;
        if (options.startDate || options.endDate) {
            query.createdAt = {};
            if (options.startDate) (query.createdAt as any).$gte = options.startDate;
            if (options.endDate) (query.createdAt as any).$lte = options.endDate;
        }

        return AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(options.skip || 0)
            .limit(options.limit || 100)
            .lean();
    }

    /**
     * Get activity summary for dashboard
     */
    static async getActivitySummary(
        tenantId: string,
        days = 7
    ): Promise<{ action: string; count: number }[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return AuditLog.aggregate([
            { $match: { tenantId, createdAt: { $gte: startDate } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $project: { action: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } }
        ]);
    }

    /**
     * Get recent activity for a specific resource
     */
    static async getResourceHistory(
        tenantId: string,
        resource: AuditResource,
        resourceId: string,
        limit = 20
    ): Promise<IAuditLog[]> {
        return AuditLog.find({ tenantId, resource, resourceId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    private static getClientIp(req: Request): string | undefined {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        return req.socket?.remoteAddress;
    }
}
