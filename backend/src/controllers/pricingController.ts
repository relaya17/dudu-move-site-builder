import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/PricingService';
import { createError } from '../middleware/errorHandler';

export const getFurnitureItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const furnitureItems = PricingService.getAllFurniturePricing();
        res.status(200).json(furnitureItems);
    } catch (error: any) {
        next(createError(error.message || 'Failed to fetch furniture items', 500));
    }
};