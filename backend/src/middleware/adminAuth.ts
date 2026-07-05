import { Request, Response, NextFunction } from 'express';

/**
 * הגנה קלה על פעולות ניהול (עדכון שלב מעקב / מיקום GPS).
 * מצפה לכותרת x-admin-key שתואמת את ADMIN_API_KEY.
 * אם ADMIN_API_KEY לא הוגדר בסביבה, ניתן מעבר חופשי (עם אזהרה) כדי לא לחסום סביבות פיתוח.
 */
export const requireAdminKey = (req: Request, res: Response, next: NextFunction): void => {
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
        if (process.env.NODE_ENV === 'production') {
            // בפרודקשן ללא מפתח — חסום לחלוטין. אין הצדקה לפתוח נתיבי PII.
            res.status(503).json({
                success: false,
                message: 'שירות הניהול אינו זמין — ADMIN_API_KEY לא הוגדר בסביבת ה-production.'
            });
            return;
        }
        // בפיתוח — אפשר מעבר חופשי עם אזהרה
        console.warn('⚠️  ADMIN_API_KEY לא מוגדר — נתיבי ניהול פתוחים (סביבת פיתוח בלבד).');
        next();
        return;
    }

    const providedKey = req.header('x-admin-key');

    if (providedKey !== expectedKey) {
        res.status(401).json({ success: false, message: 'גישה לא מורשית' });
        return;
    }

    next();
};
