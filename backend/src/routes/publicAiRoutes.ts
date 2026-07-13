/**
 * Public AI Routes - סוכן AI ללקוחות (בדף מעקב)
 */

import { Router, Request, Response } from 'express';
import { CustomerAgentService } from '../services/ai/AgentService';
import { TrackingService } from '../services/TrackingService';
import { MongoService } from '../services/MongoService';

const router = Router();

// Rate limiting for public AI (stricter than authenticated)
const requestCounts: Map<string, { count: number; resetAt: number }> = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(token: string): boolean {
    const now = Date.now();
    const record = requestCounts.get(token);
    
    if (!record || now > record.resetAt) {
        requestCounts.set(token, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }
    
    if (record.count >= RATE_LIMIT) {
        return false;
    }
    
    record.count++;
    return true;
}

/**
 * POST /api/public/ai/chat/:trackingToken
 * Customer chat about their move
 */
router.post('/chat/:trackingToken', async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackingToken } = req.params;
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            res.status(400).json({ success: false, message: 'הודעה נדרשת' });
            return;
        }

        if (message.length > 500) {
            res.status(400).json({ success: false, message: 'ההודעה ארוכה מדי (מקסימום 500 תווים)' });
            return;
        }

        // Rate limiting
        if (!checkRateLimit(trackingToken)) {
            res.status(429).json({ success: false, message: 'יותר מדי בקשות. נסה שוב בעוד דקה.' });
            return;
        }

        // Get estimate data by tracking token
        const estimate = await TrackingService.getByToken(trackingToken);
        if (!estimate) {
            res.status(404).json({ success: false, message: 'לא נמצאה הזמנה' });
            return;
        }

        // Create customer agent and process message
        const agent = new CustomerAgentService(trackingToken, estimate);
        const response = await agent.chat(message);

        res.json({
            success: true,
            data: {
                message: response
            }
        });
    } catch (err: any) {
        console.error('[publicAiRoutes] Chat error:', err.message);
        res.status(500).json({ success: false, message: 'שגיאה בעיבוד ההודעה' });
    }
});

/**
 * GET /api/public/ai/suggestions/:trackingToken
 * Get suggested questions for customer
 */
router.get('/suggestions/:trackingToken', async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackingToken } = req.params;

        const estimate = await TrackingService.getByToken(trackingToken);
        if (!estimate) {
            res.status(404).json({ success: false, message: 'לא נמצאה הזמנה' });
            return;
        }

        // Dynamic suggestions based on stage
        const suggestions = getSuggestionsForStage(estimate.stage);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: 'שגיאה' });
    }
});

function getSuggestionsForStage(stage?: string): string[] {
    const baseSuggestions = [
        'מה הסטטוס של ההובלה שלי?',
        'מתי מתוכננת ההובלה?'
    ];

    switch (stage) {
        case 'order_placed':
            return [
                ...baseSuggestions,
                'מה כלול במחיר?',
                'איך אני יכול לשנות את התאריך?'
            ];
        case 'packing':
        case 'loading':
            return [
                'כמה זמן עוד?',
                'מה השלב הבא?',
                ...baseSuggestions
            ];
        case 'in_transit':
            return [
                'איפה המשאית עכשיו?',
                'מתי תגיעו?',
                ...baseSuggestions
            ];
        case 'unloading':
        case 'delivered':
            return [
                'ההובלה הסתיימה?',
                'איך אני יכול לדרג את השירות?',
                ...baseSuggestions
            ];
        default:
            return baseSuggestions;
    }
}

export default router;
