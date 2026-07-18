import { Router } from 'express';
import { MongoController } from '../controllers/mongoController';

const router = Router();

router.post('/', MongoController.createMoveEstimate);
router.get('/', MongoController.getAllMoveEstimates);
router.get('/:id', MongoController.getMoveEstimateById);
router.patch('/:id/status', MongoController.updateMoveEstimateStatus);
router.delete('/:id', MongoController.deleteMoveEstimate);

export default router;
