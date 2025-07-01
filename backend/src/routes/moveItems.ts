import { Router } from 'express';
import { Request, Response } from 'express';
import { MoveItemService } from '../services/moveItemService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { adminRateLimit } from '../middleware/rateLimiter';

const router = Router();

const createMoveItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const itemData = req.body;
        const item = await MoveItemService.createMoveItem(itemData);

        res.status(201).json({
            success: true,
            data: item,
            message: 'Move item created successfully'
        });
    } catch (error: any) {
        throw createError(error.message || 'Failed to create move item', 500);
    }
};

const getAllMoveItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;

        let items;
        if (search) {
            items = await MoveItemService.searchMoveItems(search as string);
        } else {
            items = await MoveItemService.getAllMoveItems();
        }

        res.status(200).json({
            success: true,
            data: items,
            count: items.length
        });
    } catch (error) {
        throw createError('Failed to fetch move items', 500);
    }
};

const getMoveItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const item = await MoveItemService.getMoveItemById(parseInt(id));

        if (!item) {
            throw createError('Move item not found', 404);
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        throw error;
    }
};

const updateMoveItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const itemData = req.body;

        const updated = await MoveItemService.updateMoveItem(parseInt(id), itemData);

        if (!updated) {
            throw createError('Move item not found or no changes made', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Move item updated successfully'
        });
    } catch (error) {
        throw error;
    }
};

const deleteMoveItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await MoveItemService.deleteMoveItem(parseInt(id));

        if (!deleted) {
            throw createError('Move item not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Move item deleted successfully'
        });
    } catch (error: any) {
        throw createError(error.message || 'Failed to delete move item', 500);
    }
};

// Routes
router.get('/', adminRateLimit, asyncHandler(getAllMoveItems));
router.get('/:id', adminRateLimit, asyncHandler(getMoveItemById));
router.post('/', adminRateLimit, asyncHandler(createMoveItem));
router.put('/:id', adminRateLimit, asyncHandler(updateMoveItem));
router.delete('/:id', adminRateLimit, asyncHandler(deleteMoveItem));

export default router; 