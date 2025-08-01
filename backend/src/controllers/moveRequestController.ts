import { Request, Response } from 'express';
import { MovingEstimateService } from '../services/MovingEstimateService';
import { estimateRequestSchema } from '../middleware/validation';

export const submitMoveRequest = async (req: Request, res: Response) => {
    try {
        console.log('Received request data:', JSON.stringify(req.body, null, 2));

        const validatedData = await estimateRequestSchema.parseAsync(req.body);
        console.log('Validated data:', JSON.stringify(validatedData, null, 2));

        const { customerData, moveData, furnitureItems } = validatedData;
        const result = await MovingEstimateService.submitEstimateRequest(customerData, {
            ...moveData,
            preferred_move_date: moveData.preferred_move_date || '',
            additional_notes: moveData.additional_notes || ''
        }, furnitureItems);
        res.status(201).json({ success: true, message: 'בקשת הערכת מחיר נשלחה בהצלחה', data: result });
    } catch (error: any) {
        console.error('שגיאה בשליחת בקשת הערכת מחיר:', error);

        // אם זו שגיאת ולידציה
        if (error.name === 'ZodError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({
                success: false,
                message: 'נתונים לא תקינים',
                errors: error.errors
            });
        }

        res.status(500).json({ success: false, message: 'אירעה שגיאה בשליחת בקשת הערכת המחיר' });
    }
};

export const getAllMoveRequests = async (req: Request, res: Response) => {
    try {
        const requests = await MovingEstimateService.getAllMoveRequests();

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('שגיאה בשליפת בקשות הערכת מחיר:', error);
        res.status(500).json({
            success: false,
            message: 'אירעה שגיאה בשליפת בקשות הערכת המחיר'
        });
    }
};

export const getMoveRequestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const request = await MovingEstimateService.getMoveRequestById(id);

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('שגיאה בשליפת בקשת הערכת מחיר:', error);
        res.status(404).json({
            success: false,
            message: 'בקשת הערכת המחיר לא נמצאה'
        });
    }
};

export const updateMoveRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await MovingEstimateService.updateMoveRequestStatus(id, status);

        res.status(200).json({
            success: true,
            message: 'סטטוס בקשת הערכת המחיר עודכן בהצלחה'
        });
    } catch (error) {
        console.error('שגיאה בעדכון סטטוס בקשת הערכת מחיר:', error);
        res.status(500).json({
            success: false,
            message: 'אירעה שגיאה בעדכון סטטוס בקשת הערכת המחיר'
        });
    }
}; 