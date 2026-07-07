import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * אימות בעל-עסק (tenant) לפי JWT - זו ההגנה החדשה למערכת ה-SaaS הרב-דיירית,
 * במקביל ל-adminAuth.ts הישן (מפתח admin משותף אחד) שעדיין קיים ומגן על
 * הנתיבים הקיימים (mongoRoutes) עד לשלב ההגירה הבא (שיוך estimates/customers/
 * settings הקיימים ל-businessId ומעבר הפאנל להשתמש בטוקן הזה במקום x-admin-key).
 *
 * מצפה לכותרת: Authorization: Bearer <token>
 * הטוקן מונפק ב-authController.ts (signup/login) וכולל businessId ב-payload.
 */
export const requireBusinessAuth = (req: Request, res: Response, next: NextFunction): void => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error('❌ JWT_SECRET לא מוגדר בסביבה - לא ניתן לאמת חשבונות עסק.');
        res.status(503).json({
            success: false,
            message: 'שירות ההתחברות אינו זמין כרגע - JWT_SECRET לא הוגדר בשרת.'
        });
        return;
    }

    const authHeader = req.header('authorization') || req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

    if (!token) {
        res.status(401).json({ success: false, message: 'נדרשת התחברות' });
        return;
    }

    try {
        const payload = jwt.verify(token, secret) as { tenantId: string };
        req.tenantId = payload.tenantId;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'ההתחברות פגה או אינה תקינה - יש להתחבר מחדש' });
    }
};
