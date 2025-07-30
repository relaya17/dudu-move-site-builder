import express, { Request, Response } from 'express';
import { AiAnalysisService } from '../services/AiAnalysisService';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

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
router.post('/custom-analysis', asyncHandler(async (req: Request, res: Response) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // For now, return a mock response since we don't have a custom analysis method
        const mockResponse = {
            analysis: `ניתוח מותאם אישית עבור: "${query}"
            
            המלצות כלליות:
            - בדוק את המחירים בשוק
            - שפר את השירות ללקוחות
            - הרחב את הצוות במידת הצורך`,
            query: query,
            timestamp: new Date().toISOString()
        };

        res.json(mockResponse);
    } catch (error) {
        console.error('Error generating custom analysis:', error);
        res.status(500).json({
            error: 'Failed to generate custom analysis',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

export default router; 