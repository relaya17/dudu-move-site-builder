import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';

const router = Router();

// Move Estimate Routes
router.post('/estimates', MongoController.createMoveEstimate);
router.get('/estimates', MongoController.getAllMoveEstimates);
router.get('/estimates/:id', MongoController.getMoveEstimateById);
router.patch('/estimates/:id/status', MongoController.updateMoveEstimateStatus);
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