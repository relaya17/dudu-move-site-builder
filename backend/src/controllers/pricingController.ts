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
    apartmentType: z.union([z.string(), z.number()]).optional(),
    rooms: z.number().min(0).max(20).optional(),
    furnitureItems: z.array(z.object({
        type: z.string(),
        quantity: z.number().min(1).max(50),
        needsDoorRemoval: z.boolean().optional()
    })).max(200).default([]),
    floorDifference: z.number().min(0).max(200).default(0),
    hasElevator: z.boolean().default(false),
    originHasCrane: z.boolean().default(false),
    destinationHasCrane: z.boolean().default(false),
    hasAddresses: z.boolean().optional(),
    moveDateKnown: z.boolean().optional(),
});

/**
 * מחשב הערכת מחיר "חיה" (ללא שמירה) עם פירוק גורמים לשוק הישראלי.
 * אותה נוסחה שקובעת מחיר בשמירה — רק עם שקיפות מלאה ללקוח.
 */
export const previewEstimate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = previewEstimateSchema.parse(req.body);

        const detailed = PricingService.calculateDetailedEstimate({
            apartmentType: parsed.apartmentType,
            rooms: parsed.rooms,
            furnitureItems: parsed.furnitureItems,
            floorDifference: parsed.floorDifference,
            hasElevator: parsed.hasElevator,
            originHasCrane: parsed.originHasCrane,
            destinationHasCrane: parsed.destinationHasCrane,
            hasAddresses: parsed.hasAddresses,
            moveDateKnown: parsed.moveDateKnown,
        });

        res.status(200).json({
            success: true,
            data: detailed,
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
