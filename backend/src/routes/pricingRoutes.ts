import express from 'express';
import { getFurnitureItems } from '../controllers/pricingController';

const router = express.Router();

router.get('/furniture-items', getFurnitureItems);

export default router;