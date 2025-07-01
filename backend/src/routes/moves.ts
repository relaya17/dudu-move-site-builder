import { Router } from 'express';
import {
    createMove,
    getAllMoves,
    getMoveById,
    getMoveWithDetails,
    getMovesByCustomer,
    calculateMovePrice,
    updateMove,
    deleteMove,
    addItemToMove,
    removeItemFromMove,
} from '../controllers/moveController';
import { asyncHandler } from '../middleware/errorHandler';
import { estimateRateLimit, adminRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Public routes for customers
router.post(
    '/',
    estimateRateLimit,
    asyncHandler(createMove)
);

// Admin routes
router.get(
    '/',
    adminRateLimit,
    asyncHandler(getAllMoves)
);

router.get(
    '/:id',
    adminRateLimit,
    asyncHandler(getMoveById)
);

router.get(
    '/:id/details',
    adminRateLimit,
    asyncHandler(getMoveWithDetails)
);

router.get(
    '/:id/price',
    adminRateLimit,
    asyncHandler(calculateMovePrice)
);

router.get(
    '/customer/:customerId',
    adminRateLimit,
    asyncHandler(getMovesByCustomer)
);

router.put(
    '/:id',
    adminRateLimit,
    asyncHandler(updateMove)
);

router.delete(
    '/:id',
    adminRateLimit,
    asyncHandler(deleteMove)
);

// Item management in moves
router.post(
    '/:id/items',
    adminRateLimit,
    asyncHandler(addItemToMove)
);

router.delete(
    '/items/:itemId',
    adminRateLimit,
    asyncHandler(removeItemFromMove)
);

export default router; 