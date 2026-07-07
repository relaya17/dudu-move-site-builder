import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ESTIMATE_STATUSES } from 'shared';
import { MovingEstimateService } from '../services/MovingEstimateService';
import { estimateRequestSchema } from '../middleware/validation';
import { Business } from '../database/models/Business';

/**
 * מזהה לאיזה דייר (מוביל) שייכת בקשת ההערכה, לפי tenantSlug אופציונלי שנשלח
 * מה-frontend (זהות "האתר" ממנו הוגשה הבקשה - לקראת פתרון subdomain מלא בעתיד).
 * בלי הפרמטר (המצב היום עבור האתר של דוד הובלות) מוחזר undefined - כלומר
 * ההזמנה משויכת לזרימה הישנה/חד-דיירית, אפס שינוי התנהגות.
 */
async function resolveTenantId(tenantSlug: unknown): Promise<string | undefined> {
    if (typeof tenantSlug !== 'string' || !tenantSlug.trim()) {
        return undefined;
    }
    const business = await Business.findOne({ slug: tenantSlug.trim().toLowerCase() });
    return business?.id;
}

export const submitMoveRequest = async (req: Request, res: Response) => {
    try {
        // לוג מפורט (כולל שם/טלפון/אימייל הלקוח) רק בפיתוח - אין להדפיס PII ללוגים בפרודקשן.
        if (process.env.NODE_ENV === 'development') {
            console.log('Received request data:', JSON.stringify(req.body, null, 2));
        }

        const validatedData = await estimateRequestSchema.parseAsync(req.body);

        if (process.env.NODE_ENV === 'development') {
            console.log('Validated data:', JSON.stringify(validatedData, null, 2));
        }

        const { customerData, moveData, furnitureItems } = validatedData;
        const tenantId = await resolveTenantId((req.body as { tenantSlug?: unknown })?.tenantSlug);
        const result = await MovingEstimateService.submitEstimateRequest(customerData, {
            ...moveData,
            preferred_move_date: moveData.preferred_move_date || '',
            additional_notes: moveData.additional_notes || ''
        }, furnitureItems, tenantId);
        res.status(201).json({ success: true, message: 'בקשת הערכת מחיר נשלחה בהצלחה', data: result });
    } catch (error) {
        console.error('שגיאה בשליחת בקשת הערכת מחיר:', error);

        // אם זו שגיאת ולידציה
        if (error instanceof ZodError) {
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
        const requests = await MovingEstimateService.getAllMoveRequests(req.tenantId);

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
        const request = await MovingEstimateService.getMoveRequestById(id, req.tenantId);

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

        if (!ESTIMATE_STATUSES.includes(status)) {
            res.status(400).json({
                success: false,
                message: `סטטוס לא תקין. ערכים אפשריים: ${ESTIMATE_STATUSES.join(', ')}`
            });
            return;
        }

        await MovingEstimateService.updateMoveRequestStatus(id, status, req.tenantId);

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