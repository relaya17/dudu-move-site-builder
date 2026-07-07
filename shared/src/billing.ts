import { DateLike } from './tracking';

/**
 * טיפוסים למסמכי חשבונאות הקשורים להזמנת הובלה.
 *
 * "הצעת מחיר" (QuoteDocumentInfo) היא מסמך שיווקי/מסחרי בלבד ואינה מסמך מס -
 * ניתן להפיק אותה עצמאית באפליקציה ללא כל חיבור חיצוני.
 *
 * "חשבונית/קבלה" (InvoiceDocumentInfo) היא מסמך מס המוסדר לפי הוראות ניהול פנקסי
 * חשבונות. ניתן להפיק אותה בשתי דרכים (ר' BusinessSettingsDTO.invoiceProvider):
 * - 'built_in': הפקה עצמאית בתוך האפליקציה (providerId==='built_in') - חינמית, ללא
 *   ספק חיצוני. מתאימה לרוב עסקאות הובלה מול לקוחות פרטיים (B2C), שעבורן לא חלה
 *   חובת "מספר הקצאה" ברפורמת "חשבוניות ישראל" (החובה חלה רק כשהלקוח הוא עוסק מורשה
 *   שדרש מספר הקצאה, ומעל סכום סף - 5,000 ₪ לפני מע"מ מיוני 2026).
 * - 'green_invoice': הפקה דרך ספק חשבוניות מורשה חיצוני (Green Invoice / Morning),
 *   שמטפל אוטומטית בהקצאת מספרים מרשות המסים - מומלץ ללקוחות עוסקים מורשים בסכומים
 *   גבוהים, או למי שמעדיף שירות SaaS מלא (התאמת מע"מ, ריבוי משתמשים וכו').
 * חשוב: זו אינה יעוץ משפטי/מיסויי - יש לאמת עם רואה חשבון/יועץ מס בהתאם לאופי העסק.
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
