import { DateLike } from './tracking';

/**
 * טיפוסים למסמכי חשבונאות הקשורים להזמנת הובלה.
 *
 * חשוב: "הצעת מחיר" (QuoteDocumentInfo) היא מסמך שיווקי/מסחרי בלבד ואינה מסמך מס -
 * ניתן להפיק אותה עצמאית באפליקציה ללא כל חיבור חיצוני.
 *
 * "חשבונית/קבלה" (InvoiceDocumentInfo) היא מסמך מס מוסדר לפי חוק, ולכן מופקת אך ורק
 * דרך שירות חשבוניות מורשה חיצוני (למשל Green Invoice / Morning) שמטפל בהקצאת
 * מספרים, חתימה דיגיטלית ותאימות לרפורמת "חשבוניות ישראל" של רשות המסים.
 * אין ואסור ליצור "מסמך מס" מקומי בקוד האתר עצמו.
 *
 * TDate: כפי שנהוג בכל שאר החבילה (ר' tracking.ts) - Date בצד ה-Mongoose, string (ISO) בצד ה-API/frontend.
 */

export interface QuoteDocumentInfo<TDate extends DateLike = string> {
    /** מספר סידורי פנימי של ההצעה (לא מספר הקצאה - זהו מסמך לא-פיסקלי) */
    quoteNumber: string;
    generatedAt: TDate;
}

export interface InvoiceDocumentInfo<TDate extends DateLike = string> {
    /** סוג המסמך שהופק אצל ספק החשבוניות */
    docType: 'invoice_receipt' | 'invoice' | 'receipt';
    /** מזהה המסמך במערכת הספק (למשל Green Invoice) */
    providerId: string;
    /** מספר המסמך הרשמי כפי שהונפק */
    documentNumber: string;
    /** מספר הקצאה מרשות המסים - נדרש לעסקאות מעל סף התקנה (ר' רפורמת חשבוניות ישראל) */
    allocationNumber?: string;
    /** קישור להורדה/צפייה במסמך המקורי (PDF חתום) */
    documentUrl: string;
    issuedAt: TDate;
}
