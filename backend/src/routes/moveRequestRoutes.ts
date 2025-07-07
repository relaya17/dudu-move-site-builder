import { Router } from 'express';
import { submitMoveRequest } from '../controllers/moveRequestController';
import { asyncHandler } from '../middleware/errorHandler';
import { estimateRateLimit } from '../middleware/rateLimiter';

const router = Router();

router.post('/', asyncHandler(submitMoveRequest));

export default router;
