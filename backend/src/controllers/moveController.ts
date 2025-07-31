import { MoveService } from '../services/moveService';
import { createError } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

export const createMove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const moveData = req.body;
        // TODO: בדיקת תקינות moveData כאן

        const move = await MoveService.createMove(moveData);

        res.status(201).json({
            success: true,
            data: move,
            message: 'Move created successfully'
        });
    } catch (error: any) {
        next(createError(error.message || 'Failed to create move', 500));
    }
};


export const getAllMoves = async (req: Request, res: Response): Promise<void> => {
    try {
        const moves = await MoveService.getAllMoves();

        res.status(200).json({
            success: true,
            data: moves,
            count: moves.length
        });
    } catch (error) {
        throw createError('Failed to fetch moves', 500);
    }
};

export const getMoveById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const move = await MoveService.getMoveById(id);

        if (!move) {
            throw createError('Move not found', 404);
        }

        res.status(200).json({
            success: true,
            data: move
        });
    } catch (error) {
        throw error;
    }
};

export const getMoveWithDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const move = await MoveService.getMoveWithDetails(id);

        if (!move) {
            throw createError('Move not found', 404);
        }

        res.status(200).json({
            success: true,
            data: move
        });
    } catch (error) {
        throw error;
    }
};

export const getMovesByCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.params;
        const moves = await MoveService.getMovesByCustomerId(customerId);

        res.status(200).json({
            success: true,
            data: moves,
            count: moves.length
        });
    } catch (error) {
        throw createError('Failed to fetch customer moves', 500);
    }
};

export const calculateMovePrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const calculation = await MoveService.calculateMovePrice(id);

        res.status(200).json({
            success: true,
            data: calculation
        });
    } catch (error) {
        throw error;
    }
};

export const updateMove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const moveData = req.body;

        await MoveService.updateMove(id, moveData);

        res.status(200).json({
            success: true,
            message: 'Move updated successfully'
        });
    } catch (error) {
        throw error;
    }
};

export const deleteMove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await MoveService.deleteMove(id);

        res.status(200).json({
            success: true,
            message: 'Move deleted successfully'
        });
    } catch (error) {
        throw error;
    }
};

export const addItemToMove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const itemData = req.body;

        await MoveService.addItemToMove(id, itemData);

        res.status(201).json({
            success: true,
            message: 'Item added to move successfully'
        });
    } catch (error: any) {
        throw createError(error.message || 'Failed to add item to move', 500);
    }
};

export const removeItemFromMove = async (req: Request, res: Response): Promise<void> => {
    try {
        const { moveId, itemId } = req.params;
        await MoveService.removeItemFromMove(moveId, itemId);

        res.status(200).json({
            success: true,
            message: 'Item removed from move successfully'
        });
    } catch (error) {
        throw error;
    }
}; 