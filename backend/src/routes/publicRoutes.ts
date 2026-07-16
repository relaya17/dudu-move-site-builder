import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { submitContactForm } from '../controllers/contactController';
import { submitPrivacyRequest, exportMyData } from '../controllers/privacyController';
import { generateVirtualStaging } from '../controllers/stagingController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/business-info', SettingsController.getPublicInfo);
router.post('/contact', asyncHandler(submitContactForm));
router.post('/privacy/request', asyncHandler(submitPrivacyRequest));
router.post('/privacy/export', asyncHandler(exportMyData));
router.post('/staging', asyncHandler(generateVirtualStaging));

export default router;
