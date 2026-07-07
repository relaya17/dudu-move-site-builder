import express from 'express';
import { getFurnitureItems, previewEstimate } from '../controllers/pricingController';

const router = express.Router();

router.get('/furniture-items', getFurnitureItems);
router.post('/estimate-preview', previewEstimate);

export default router;