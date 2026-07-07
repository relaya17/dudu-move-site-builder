import mongoose from 'mongoose';

/**
 * מחזיר תנאי סינון לפי tenantId, לשימוש בכל שאילתה שנוגעת לנתונים ששייכים
 * לחשבון עסק (Business) ספציפי. זה הלב של הבידוד בין דיירים (tenants) במערכת
 * ה-SaaS: כשיש tenantId (בקשה שעברה אימות דרך requireBusinessAuth, ר'
 * middleware/businessAuth.ts) מסננים לפי אותו tenantId בלבד; כשאין (הזרימה
 * הישנה של דוד הובלות, מוגנת ב-requireAdminKey) מסננים לפי "אין tenantId
 * בכלל" - כדי שהנתונים הישנים (חד-דייריים) לא יתערבבו עם נתונים של דיירים
 * חדשים שנרשמים למערכת.
 *
 * חשוב: לעולם אין להריץ שאילתה על אוסף רגיש (הצעות מחיר/לקוחות/הערות) בלי
 * לעבור דרך הפונקציה הזאת - אחרת יש סיכון ממשי לדליפת מידע בין דיירים.
 */
export function tenantFilter(tenantId?: string): Record<string, unknown> {
    if (!tenantId) {
        return { tenantId: { $exists: false } };
    }
    return { tenantId: new mongoose.Types.ObjectId(tenantId) };
}
