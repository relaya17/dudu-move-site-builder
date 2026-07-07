import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';
import { SettingsController } from '../controllers/settingsController';
import { requireBusinessAuth } from '../middleware/businessAuth';

const router = Router();

// גרסת ה-SaaS הרב-דיירי של mongoRoutes.ts: אותם controllers בדיוק, אבל מוגנים
// ב-requireBusinessAuth (טוקן JWT של חשבון עסק ספציפי) במקום מפתח admin משותף.
// req.tenantId שנקבע ע"י ה-middleware הזה גורם לכל controller לסנן את
// הנתונים לפי הדייר המחובר בלבד (ר' lib/tenantFilter.ts) - כך שכל מוביל שנרשם
// רואה אך ורק את הנתונים שלו.
router.use(requireBusinessAuth);

// Move Estimate Routes
// יצירת הערכה חדשה עדיין מתבצעת אך ורק דרך /api/move-requests הציבורי
// (טופס ההערכה של האתר של אותו דייר, עם tenantSlug - ר' moveRequestController.ts).
router.get('/estimates', MongoController.getAllMoveEstimates);
router.get('/estimates/:id', MongoController.getMoveEstimateById);
router.patch('/estimates/:id/status', MongoController.updateMoveEstimateStatus);
router.post('/estimates/:id/quote', MongoController.issueQuote);
router.post('/estimates/:id/send-quote-email', MongoController.sendQuoteEmail);
router.post('/estimates/:id/invoice', MongoController.issueInvoice);
router.delete('/estimates/:id', MongoController.deleteMoveEstimate);

// Customer Routes
router.get('/customers', MongoController.getAllCustomers);
router.get('/customers/email/:email', MongoController.getCustomerByEmail);

// Analytics Routes
router.get('/analytics', MongoController.getAnalytics);

// Search Routes
router.get('/search/estimates', MongoController.searchMoveEstimates);
router.get('/search/customers', MongoController.searchCustomers);

// Calendar Note Routes
router.get('/calendar-notes', MongoController.getCalendarNotes);
router.post('/calendar-notes', MongoController.createCalendarNote);
router.delete('/calendar-notes/:id', MongoController.deleteCalendarNote);

// Business Settings Routes
router.get('/settings', SettingsController.getSettings);
router.put('/settings', SettingsController.updateSettings);
router.post('/settings/test-green-invoice', SettingsController.testGreenInvoiceConnection);

export default router;
