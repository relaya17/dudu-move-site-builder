import { Router } from 'express';
import {
    submitMoveRequest,
    getAllMoveRequests,
    getMoveRequestById,
    updateMoveRequestStatus
} from '../controllers/moveRequestController';
import { asyncHandler } from '../middleware/errorHandler';
import { estimateRateLimit } from '../middleware/rateLimiter';

const router = Router();

// POST - יצירת בקשת הערכת מחיר חדשה
router.post('/', estimateRateLimit, asyncHandler(submitMoveRequest));

// GET - קבלת כל בקשות הערכת המחיר
router.get('/', asyncHandler(getAllMoveRequests));

// GET - קבלת בקשת הערכת מחיר לפי ID
router.get('/:id', asyncHandler(getMoveRequestById));

// PATCH - עדכון סטטוס בקשת הערכת מחיר
router.patch('/:id/status', asyncHandler(updateMoveRequestStatus));

export default router;
