import { Request, Response } from 'express';
import { MovingEstimateService } from '../services/MovingEstimateService';

export const submitMoveRequest = async (req: Request, res: Response) => {
    try {
        const { customerData, moveData, furnitureItems } = req.body;

        const result = await MovingEstimateService.submitEstimateRequest(
            customerData,
            moveData,
            furnitureItems
        );

        res.status(201).json({
            success: true,
            message: 'בקשת הערכת מחיר נשלחה בהצלחה',
            data: result
        });
    } catch (error) {
        console.error('שגיאה בשליחת בקשת הערכת מחיר:', error);
        res.status(500).json({
            success: false,
            message: 'אירעה שגיאה בשליחת בקשת הערכת המחיר'
        });
    }
}; 