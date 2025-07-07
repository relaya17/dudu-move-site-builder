import { Router } from 'express';
import { Request, Response } from 'express';
import { MoveItemService } from '../services/moveItemService'; // שירות לטיפול בפריטי העברה
import { createError, asyncHandler } from '../middleware/errorHandler'; // טיפול בשגיאות אסינכרוניות
import { adminRateLimit } from '../middleware/rateLimiter'; // הגבלת בקשות למנהלים בלבד

const router = Router();

/**
 * יצירת פריט העברה חדש.
 * מקבל נתונים מה-body של הבקשה.
 * מחזיר את הפריט שנוצר עם סטטוס 201.
 * זורק שגיאה 500 במקרה של כישלון.
 */
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

/**
 * קבלת כל פריטי ההעברה.
 * ניתן לבצע חיפוש לפי מחרוזת query param בשם search.
 * מחזיר רשימת פריטים עם סטטוס 200.
 */
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

/**
 * קבלת פריט העברה לפי מזהה (id).
 * אם לא נמצא, מחזיר שגיאה 404.
 */
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

/**
 * עדכון פריט העברה לפי מזהה.
 * מחזיר הודעה על הצלחה.
 * אם לא נמצא פריט או לא נעשו שינויים, מחזיר שגיאה 404.
 */
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

/**
 * מחיקת פריט העברה לפי מזהה.
 * מחזיר הודעת הצלחה.
 * אם לא נמצא פריט מתאים, מחזיר שגיאה 404.
 */
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

// הגדרת הנתיבים (Routes) - כולם מוגבלים ל-admin בלבד
router.get('/', adminRateLimit, asyncHandler(getAllMoveItems));       // קבלת כל הפריטים עם חיפוש אופציונלי
router.get('/:id', adminRateLimit, asyncHandler(getMoveItemById));    // קבלת פריט לפי id
router.post('/', adminRateLimit, asyncHandler(createMoveItem));       // יצירת פריט חדש
router.put('/:id', adminRateLimit, asyncHandler(updateMoveItem));     // עדכון פריט קיים
router.delete('/:id', adminRateLimit, asyncHandler(deleteMoveItem));  // מחיקת פריט

export default router;
