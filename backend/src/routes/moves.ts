import { Router } from 'express';
import {
    createMove,
    getAllMoves,
    getMoveById,
    getMoveWithDetails,
    getMovesByCustomer,
    calculateMovePrice,
    updateMove,
    deleteMove,
    addItemToMove,
    removeItemFromMove,
} from '../controllers/moveController';  // בקר (Controller) שמכיל את הלוגיקה

import { asyncHandler } from '../middleware/errorHandler';  // טיפול בשגיאות אסינכרוניות
import { estimateRateLimit, adminRateLimit } from '../middleware/rateLimiter';  // הגבלות בקשות (Rate Limits)

const router = Router();

// ** נתיבים ציבוריים ללקוחות **
// יצירת בקשת מעבר (בקשת הערכת מחיר) - מוגבל ע"י rate limit מותאם להערכת מחיר (estimateRateLimit)
router.post(
    '/',
    estimateRateLimit,
    asyncHandler(createMove)
);

// ** נתיבי אדמין - רק מנהלים יכולים לקרוא ולנהל את ההעברות **

// הבאת כל המעברים
router.get(
    '/',
    adminRateLimit,
    asyncHandler(getAllMoves)
);

// הבאת מעבר לפי מזהה
router.get(
    '/:id',
    adminRateLimit,
    asyncHandler(getMoveById)
);

// הבאת מעבר עם פרטים מלאים
router.get(
    '/:id/details',
    adminRateLimit,
    asyncHandler(getMoveWithDetails)
);

// חישוב מחיר מעבר לפי מזהה
router.get(
    '/:id/price',
    adminRateLimit,
    asyncHandler(calculateMovePrice)
);

// הבאת כל המעברים של לקוח מסוים לפי מזהה הלקוח
router.get(
    '/customer/:customerId',
    adminRateLimit,
    asyncHandler(getMovesByCustomer)
);

// עדכון מעבר לפי מזהה
router.put(
    '/:id',
    adminRateLimit,
    asyncHandler(updateMove)
);

// מחיקת מעבר לפי מזהה
router.delete(
    '/:id',
    adminRateLimit,
    asyncHandler(deleteMove)
);

// ** ניהול פריטי ריהוט במעבר **

// הוספת פריט ריהוט למעבר לפי מזהה מעבר
router.post(
    '/:id/items',
    adminRateLimit,
    asyncHandler(addItemToMove)
);

// הסרת פריט ריהוט לפי מזהה פריט
router.delete(
    '/items/:itemId',
    adminRateLimit,
    asyncHandler(removeItemFromMove)
);

export default router;
