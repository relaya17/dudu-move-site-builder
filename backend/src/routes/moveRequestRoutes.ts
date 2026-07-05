import { Router } from 'express';
import {
    submitMoveRequest,
    getAllMoveRequests,
    getMoveRequestById,
    updateMoveRequestStatus
} from '../controllers/moveRequestController';
import { asyncHandler } from '../middleware/errorHandler';
import { estimateRateLimit } from '../middleware/rateLimiter';
import { requireAdminKey } from '../middleware/adminAuth';

const router = Router();

// POST - יצירת בקשת הערכת מחיר חדשה (ציבורי - טופס הלקוח)
router.post('/', estimateRateLimit, asyncHandler(submitMoveRequest));

// שאר הנתיבים חושפים PII של לקוחות / מאפשרים שינוי סטטוס - לצוות הניהול בלבד.
// GET - קבלת כל בקשות הערכת המחיר
router.get('/', requireAdminKey, asyncHandler(getAllMoveRequests));

// GET - קבלת בקשת הערכת מחיר לפי ID
router.get('/:id', requireAdminKey, asyncHandler(getMoveRequestById));

// PATCH - עדכון סטטוס בקשת הערכת מחיר
router.patch('/:id/status', requireAdminKey, asyncHandler(updateMoveRequestStatus));

export default router;
