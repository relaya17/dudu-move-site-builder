import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PricingService } from '../services/PricingService';
import { createError } from '../middleware/errorHandler';

export const getFurnitureItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const furnitureItems = PricingService.getAllFurniturePricing();
        res.status(200).json(furnitureItems);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch furniture items';
        next(createError(message, 500));
    }
};

const previewEstimateSchema = z.object({
    furnitureItems: z.array(z.object({
        type: z.string(),
        quantity: z.number().min(1).max(50),
        needsDoorRemoval: z.boolean().optional()
    })).max(200).default([]),
    floorDifference: z.number().min(0).max(200).default(0),
    hasElevator: z.boolean().default(false),
    originHasCrane: z.boolean().default(false),
    destinationHasCrane: z.boolean().default(false)
});

/**
 * מחשב הערכת מחיר "חיה" (ללא שמירה במסד הנתונים) בזמן שהלקוח ממלא את הטופס,
 * כדי שיראה טווח מחיר משוער לפני שליחת הבקשה בפועל (ר' calculateTotalPrice
 * לתמחור המדויק שנשמר בפועל בעת שליחת הטופס).
 * נגיש ציבורית בכוונה - אין בו מידע רגיש, רק מחשבון מחיר.
 */
export const previewEstimate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = previewEstimateSchema.parse(req.body);

        const estimatedTotal = PricingService.calculateTotalPrice(
            '', // סוג הדירה עדיין לא ידוע בשלב זה של הטופס - לא משפיע על הערכת הפריטים/קומות
            parsed.furnitureItems,
            parsed.floorDifference,
            parsed.hasElevator,
            parsed.originHasCrane,
            parsed.destinationHasCrane
        );

        // טווח (לא נקודה בודדת) - כדי לשקף שזו הערכה בלבד, המחיר הסופי נקבע לאחר בדיקה
        res.status(200).json({
            success: true,
            data: {
                estimatedTotal,
                minEstimate: Math.round(estimatedTotal * 0.9),
                maxEstimate: Math.round(estimatedTotal * 1.15)
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'נתונים לא תקינים לחישוב הערכת מחיר' });
            return;
        }
        const message = error instanceof Error ? error.message : 'Failed to preview estimate';
        next(createError(message, 500));
    }
};