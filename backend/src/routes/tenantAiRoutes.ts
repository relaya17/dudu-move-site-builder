/**
 * Tenant AI Routes - סוכן AI לבעלי עסקים (JWT protected)
 */

import { Router, Request, Response } from 'express';
import { requireBusinessAuth } from '../middleware/businessAuth';
import { AgentService } from '../services/ai/AgentService';
import { AuditService } from '../services/AuditService';
import { BusinessSettings } from '../database/models/BusinessSettings';
import { tenantFilter } from '../lib/tenantFilter';
import { DEFAULT_TURBO_SETTINGS } from 'shared';

const router = Router();

// All routes require JWT authentication
router.use(requireBusinessAuth);

// In-memory session store (in production use Redis)
const agentSessions: Map<string, AgentService> = new Map();

async function isTurboAiEnabled(tenantId?: string): Promise<boolean> {
    if (!tenantId) return false;
    const settings = await BusinessSettings.findOne(tenantFilter(tenantId)).lean();
    const turbo = { ...DEFAULT_TURBO_SETTINGS, ...(settings?.turbo || {}) };
    return turbo.turboMode && turbo.turboAi;
}

/**
 * POST /api/tenant/ai/chat
 * Send a message to the AI agent
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, resetSession } = req.body;
        const tenantId = (req as any).tenantId;
        const userId = (req as any).user?.id;

        if (!message || typeof message !== 'string') {
            res.status(400).json({ success: false, message: 'הודעה נדרשת' });
            return;
        }

        if (message.length > 2000) {
            res.status(400).json({ success: false, message: 'ההודעה ארוכה מדי (מקסימום 2000 תווים)' });
            return;
        }

        // Get or create agent session
        const sessionKey = `${tenantId}:${userId}`;
        let agent = agentSessions.get(sessionKey);
        const turboAi = await isTurboAiEnabled(tenantId);

        if (!agent || resetSession) {
            agent = new AgentService(tenantId, userId, { turboAi });
            agentSessions.set(sessionKey, agent);
        } else {
            agent.setTurboAi(turboAi);
        }

        // Process the message
        const response = await agent.chat(message);

        res.json({
            success: true,
            data: {
                message: response.message,
                toolsUsed: response.toolsUsed,
                tokensUsed: response.tokensUsed,
                turboAi,
            }
        });
    } catch (err: any) {
        console.error('[tenantAiRoutes] Chat error:', err.message);
        res.status(500).json({ success: false, message: 'שגיאה בעיבוד ההודעה' });
    }
});

/**
 * POST /api/tenant/ai/reset
 * Reset the conversation
 */
router.post('/reset', async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = (req as any).tenantId;
        const userId = (req as any).user?.id;
        const sessionKey = `${tenantId}:${userId}`;

        const agent = agentSessions.get(sessionKey);
        if (agent) {
            agent.resetConversation();
        }

        res.json({ success: true, message: 'השיחה אופסה' });
    } catch (err: any) {
        res.status(500).json({ success: false, message: 'שגיאה באיפוס השיחה' });
    }
});

/**
 * GET /api/tenant/ai/history
 * Get conversation history
 */
router.get('/history', async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = (req as any).tenantId;
        const userId = (req as any).user?.id;
        const sessionKey = `${tenantId}:${userId}`;

        const agent = agentSessions.get(sessionKey);
        const history = agent ? agent.getHistory() : [];

        res.json({ success: true, data: history });
    } catch (err: any) {
        res.status(500).json({ success: false, message: 'שגיאה בטעינת ההיסטוריה' });
    }
});

/**
 * GET /api/tenant/ai/activity
 * Get activity summary for the business
 */
router.get('/activity', async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = (req as any).tenantId;
        const days = parseInt(req.query.days as string) || 7;

        const activity = await AuditService.getActivitySummary(tenantId, days);

        res.json({ success: true, data: activity });
    } catch (err: any) {
        res.status(500).json({ success: false, message: 'שגיאה בטעינת פעילות' });
    }
});

/**
 * GET /api/tenant/ai/audit-log
 * Get detailed audit log
 */
router.get('/audit-log', async (req: Request, res: Response): Promise<void> => {
    try {
        const tenantId = (req as any).tenantId;
        const { action, resource, days, limit } = req.query;

        const startDate = days ? new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000) : undefined;

        const logs = await AuditService.getLogsForTenant(tenantId, {
            action: action as any,
            resource: resource as any,
            startDate,
            limit: parseInt(limit as string) || 50
        });

        res.json({ success: true, data: logs });
    } catch (err: any) {
        res.status(500).json({ success: false, message: 'שגיאה בטעינת יומן' });
    }
});

export default router;
