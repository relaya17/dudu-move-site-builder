import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';
import { requireAdminKey } from '../middleware/adminAuth';

const router = Router();

// כל הנתיבים כאן חושפים מידע אישי (PII) של לקוחות או מאפשרים שינוי/מחיקת נתונים -
// שימוש בלעדי לצוות הניהול, מוגן ב-x-admin-key.
router.use(requireAdminKey);

// Move Estimate Routes
// יצירת הערכה חדשה מתבצעת אך ורק דרך /api/move-requests (ולידציה + מחיר + טוקן מעקב + מייל אישור).
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

export default router; 