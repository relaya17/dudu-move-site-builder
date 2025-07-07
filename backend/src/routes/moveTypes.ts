import { Router } from 'express';
import { Request, Response } from 'express';
import { MoveTypeService } from '../services/moveTypeService'; // שירות לטיפול בלוגיקה של סוגי ההעברה (move types)
import { createError, asyncHandler } from '../middleware/errorHandler'; // טיפול בשגיאות אסינכרוניות
import { adminRateLimit, generalRateLimit } from '../middleware/rateLimiter'; // הגבלת בקשות (rate limiting) להגן על השרת

const router = Router();

/**
 * יצירת סוג העברה חדש.
 * הנתונים מתקבלים מה-body של הבקשה.
 * במקרה של הצלחה מחזיר סטטוס 201 עם הפריט שנוצר.
 * במקרה של שגיאה, זורק שגיאה עם הודעה מתאימה.
 */
const createMoveType = async (req: Request, res: Response): Promise<void> => {
    try {
        const typeData = req.body; // הנתונים שנשלחו ליצירת סוג העברה חדש
        const moveType = await MoveTypeService.createMoveType(typeData); // יצירת סוג ההעברה דרך השירות

        res.status(201).json({
            success: true,
            data: moveType,
            message: 'Move type created successfully'
        });
    } catch (error: any) {
        throw createError(error.message || 'Failed to create move type', 500);
    }
};

/**
 * הבאת כל סוגי ההעברה הקיימים במערכת.
 * מחזיר רשימה של סוגי העברה עם סטטוס 200.
 */
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

/**
 * הבאת סוג העברה לפי מזהה (id).
 * מזהה מגיע מפרמטרי ה-URL.
 * אם לא נמצא סוג העברה מתאים, זורק שגיאה 404.
 */
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
        throw error; // מעביר את השגיאה הלאה לטיפול גלובלי
    }
};

/**
 * עדכון סוג העברה קיים לפי מזהה (id).
 * מקבל את הנתונים החדשים מה-body.
 * מחזיר הודעה על הצלחה או שגיאה אם לא נמצא סוג העברה לעדכון.
 */
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

/**
 * מחיקת סוג העברה לפי מזהה (id).
 * מחזיר הודעה על הצלחה או שגיאה אם לא נמצא לפרט למחיקה.
 */
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

// הגדרת הנתיבים (Routes)
// GET / - מחזיר את כל סוגי ההעברה, מוגבל לפי כלל rate limiting כללי (generalRateLimit)
router.get('/', generalRateLimit, asyncHandler(getAllMoveTypes));

// GET /:id - מחזיר סוג העברה לפי מזהה, מוגבל גם כן לפי rate limiting כללי
router.get('/:id', generalRateLimit, asyncHandler(getMoveTypeById));

// POST / - יצירת סוג העברה חדש, מוגבל לפי rate limiting למנהלים בלבד (adminRateLimit)
router.post('/', adminRateLimit, asyncHandler(createMoveType));

// PUT /:id - עדכון סוג העברה קיים, מוגבל למנהלים בלבד
router.put('/:id', adminRateLimit, asyncHandler(updateMoveType));

// DELETE /:id - מחיקת סוג העברה קיים, מוגבל למנהלים בלבד
router.delete('/:id', adminRateLimit, asyncHandler(deleteMoveType));

export default router;
