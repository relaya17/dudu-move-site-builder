import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { requireAdminKey } from '../middleware/adminAuth';

const router = Router();

// ציבורי — כל אחד יכול לקרוא ביקורות ולהגיש ביקורת חדשה
router.get('/', ReviewController.getAll);
router.post('/', ReviewController.create);

// מוגן — רק צוות הניהול יכול להגיב / למחוק
router.post('/:id/reply', requireAdminKey, ReviewController.reply);
router.delete('/:id', requireAdminKey, ReviewController.remove);

export default router;
