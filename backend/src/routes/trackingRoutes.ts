import { Router } from 'express';
import { getTrackingByToken, getTrackingDocuments, updateTrackingStage, updateTrackingLocation } from '../controllers/trackingController';
import {
    getPaymentStatus,
    initiateCardPayment,
    confirmDemoPayment,
    markBankTransfer,
    requestOpenBanking,
} from '../controllers/paymentController';
import { asyncHandler } from '../middleware/errorHandler';
import { requireAdminKey } from '../middleware/adminAuth';

const router = Router();

router.get('/:token', asyncHandler(getTrackingByToken));
router.get('/:token/documents', asyncHandler(getTrackingDocuments));

router.get('/:token/payment', asyncHandler(getPaymentStatus));
router.post('/:token/payment/card', asyncHandler(initiateCardPayment));
router.post('/:token/payment/card/confirm-demo', asyncHandler(confirmDemoPayment));
router.post('/:token/payment/bank-transfer', asyncHandler(markBankTransfer));
router.post('/:token/payment/open-banking', asyncHandler(requestOpenBanking));

router.patch('/:token/stage', requireAdminKey, asyncHandler(updateTrackingStage));
router.patch('/:token/location', requireAdminKey, asyncHandler(updateTrackingLocation));

export default router;
