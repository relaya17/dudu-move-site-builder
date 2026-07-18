import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';

const router = Router();

router.get('/', MongoController.getAnalytics);

export default router;
