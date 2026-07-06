import express, { Request, Response } from 'express';
import { AiAnalysisService } from '../services/AiAnalysisService';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdminKey } from '../middleware/adminAuth';

const router = express.Router();

// כל נתיבי ה-AI חושפים נתונים עסקיים ומפעילים קריאות בתשלום ל-OpenAI - לצוות הניהול בלבד.
router.use(requireAdminKey);

// GET /api/ai/business-insights
router.get('/business-insights', asyncHandler(async (_req: Request, res: Response) => {
    try {
        const insights = await AiAnalysisService.generateBusinessInsights();
        res.json(insights);
    } catch (error) {
        console.error('Error generating business insights:', error);
        res.status(500).json({
            error: 'Failed to generate business insights',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// GET /api/ai/pricing-recommendations
router.get('/pricing-recommendations', asyncHandler(async (_req: Request, res: Response) => {
    try {
        const recommendations = await AiAnalysisService.generatePricingRecommendations();
        res.json(recommendations);
    } catch (error) {
        console.error('Error generating pricing recommendations:', error);
        res.status(500).json({
            error: 'Failed to generate pricing recommendations',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

// POST /api/ai/custom-analysis
// body: { query: string, history?: {role:'user'|'assistant', content:string}[] }
router.post('/custom-analysis', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { query, history } = req.body as {
            query?: string;
            history?: { role: 'user' | 'assistant'; content: string }[];
        };

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const result = await AiAnalysisService.generateCustomAnalysis(
            query.trim(),
            Array.isArray(history) ? history : []
        );
        res.json(result);
    } catch (error) {
        console.error('Error generating custom analysis:', error);
        res.status(500).json({
            error: 'Failed to generate custom analysis',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

export default router; 