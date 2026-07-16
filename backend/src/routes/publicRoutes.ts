import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { submitContactForm } from '../controllers/contactController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// נתיבים ציבוריים בכוונה - בלי requireAdminKey (בניגוד ל-mongoRoutes) - נועדו
// לשימוש בעמודי הלקוחות עצמם (Navbar/Footer) כדי שכל מוביל שמפעיל את המערכת
// יוכל להציג את שם העסק שלו (שנקבע במסך ההגדרות בפאנל הניהול) בלי מפתח ניהול
// ובלי לגעת בקוד. חושפים כאן אך ורק מידע ציבורי ובטוח - ר' SettingsController.getPublicInfo.
router.get('/business-info', SettingsController.getPublicInfo);
router.post('/contact', asyncHandler(submitContactForm));

export default router;
