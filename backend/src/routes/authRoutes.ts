import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { requireBusinessAuth } from '../middleware/businessAuth';

const router = Router();

// ציבורי — הרשמה והתחברות
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// מחייב JWT (requireBusinessAuth מחלץ tenantId מהטוקן ומצרף אותו ל-req)
router.get('/me', requireBusinessAuth, AuthController.me);
router.get('/employees', requireBusinessAuth, AuthController.listEmployees);
router.post('/employees', requireBusinessAuth, AuthController.addEmployee);
router.delete('/employees/:id', requireBusinessAuth, AuthController.deleteEmployee);

export default router;
