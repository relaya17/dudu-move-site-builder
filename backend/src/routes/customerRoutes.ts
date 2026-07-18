import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';

const router = Router();

router.get('/', MongoController.getAllCustomers);
router.get('/email/:email', MongoController.getCustomerByEmail);

export default router;
