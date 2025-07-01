import { Router } from 'express';
import { Request, Response } from 'express';
import { MoveTypeService } from '../services/moveTypeService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { adminRateLimit, generalRateLimit } from '../middleware/rateLimiter';

const router = Router();

const createMoveType = async (req: Request, res: Response): Promise<void> => {
    try {
        const typeData = req.body;
        const moveType = await MoveTypeService.createMoveType(typeData);

        res.status(201).json({
            success: true,
            data: moveType,
            message: 'Move type created successfully'
        });
    } catch (error: any) {
        throw createError(error.message || 'Failed to create move type', 500);
    }
};

const getAllMoveTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const moveTypes = await MoveTypeService.getAllMoveTypes();

        res.status(200).json({
            success: true,
            data: moveTypes,
            count: moveTypes.length
        });
    } catch (error) {
        throw createError('Failed to fetch move types', 500);
    }
};

const getMoveTypeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const moveType = await MoveTypeService.getMoveTypeById(parseInt(id));

        if (!moveType) {
            throw createError('Move type not found', 404);
        }

        res.status(200).json({
            success: true,
            data: moveType
        });
    } catch (error) {
        throw error;
    }
};

const updateMoveType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const typeData = req.body;

        const updated = await MoveTypeService.updateMoveType(parseInt(id), typeData);

        if (!updated) {
            throw createError('Move type not found or no changes made', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Move type updated successfully'
        });
    } catch (error) {
        throw error;
    }
};

const deleteMoveType = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await MoveTypeService.deleteMoveType(parseInt(id));

        if (!deleted) {
            throw createError('Move type not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Move type deleted successfully'
        });
    } catch (error: any) {
        throw createError(error.message || 'Failed to delete move type', 500);
    }
};

// Routes - move types are public for frontend to display options
router.get('/', generalRateLimit, asyncHandler(getAllMoveTypes));
router.get('/:id', generalRateLimit, asyncHandler(getMoveTypeById));

// Admin routes for management
router.post('/', adminRateLimit, asyncHandler(createMoveType));
router.put('/:id', adminRateLimit, asyncHandler(updateMoveType));
router.delete('/:id', adminRateLimit, asyncHandler(deleteMoveType));

export default router; 