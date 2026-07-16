import { Router } from 'express';
import { getTrackingByToken, getTrackingDocuments, updateTrackingStage, updateTrackingLocation } from '../controllers/trackingController';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdminKey } from '../middleware/adminAuth';

const router = Router();

// GET - צפייה ציבורית במעקב הובלה (הלקוח מקבל קישור עם טוקן)
router.get('/:token', asyncHandler(getTrackingByToken));

// GET - מסמכים (הצעה/חשבונית) להורדה/הדפסה ללקוח
router.get('/:token/documents', asyncHandler(getTrackingDocuments));

// PATCH - עדכון שלב מעקב (לשימוש הצוות/ניהול בלבד)
router.patch('/:token/stage', requireAdminKey, asyncHandler(updateTrackingStage));

// PATCH - עדכון מיקום GPS נוכחי (לשימוש הצוות/ניהול בלבד)
router.patch('/:token/location', requireAdminKey, asyncHandler(updateTrackingLocation));

export default router;
