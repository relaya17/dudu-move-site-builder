import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';

const router = Router();

router.get('/estimates', MongoController.searchMoveEstimates);
router.get('/customers', MongoController.searchCustomers);

export default router;
