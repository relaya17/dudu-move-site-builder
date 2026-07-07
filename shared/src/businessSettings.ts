/**
 * הגדרות העסק - פרטי החברה ואופן הפקת חשבוניות/קבלות.
 *
 * שני מצבי הפקה נתמכים (ר' backend/src/services/InvoiceService.ts להסבר המשפטי המלא):
 * - 'built_in': הפקה עצמאית בתוך האפליקציה, ללא תלות/תשלום לספק חיצוני. מתאים לרוב
 *   עסקאות ההובלה מול לקוחות פרטיים (B2C), שעבורן לא חלה חובת "מספר הקצאה".
 * - 'green_invoice': התחברות לספק חשבוניות מורשה חיצוני (Green Invoice), מומלץ לעסקים
 *   שמנפיקים חשבוניות ללקוחות עוסקים מורשים בסכומים גבוהים (מעל סף "מספר ההקצאה").
 */
export type InvoiceProvider = 'built_in' | 'green_invoice';

/** עוסק פטור (לא גובה מע"מ) / עוסק מורשה / חברה בע"מ - קובע אם מוצג מע"מ במסמך. */
export type BusinessType = 'exempt' | 'licensed' | 'company';

export interface BusinessSettingsDTO {
    businessName: string;
    businessId: string;
    businessType: BusinessType;
    address: string;
    phone: string;
    email: string;
    /** אחוז מע"מ (למשל 18). לא רלוונטי לעוסק פטור. */
    vatRate: number;
    invoiceProvider: InvoiceProvider;
    /** האם מוגדרים מפתחות Green Invoice (בהגדרות או במשתני סביבה) - לא חוזר הסוד עצמו. */
    greenInvoiceConfigured: boolean;
    greenInvoiceEnv?: 'sandbox' | 'production';
    /** המספר הסידורי הבא שיינתן למסמך שיופק במצב built_in. */
    nextDocumentNumber: number;
}

export interface BusinessSettingsUpdateInput {
    businessName?: string;
    businessId?: string;
    businessType?: BusinessType;
    address?: string;
    phone?: string;
    email?: string;
    vatRate?: number;
    invoiceProvider?: InvoiceProvider;
    /** נשלח רק כשרוצים להחליף/להגדיר מפתח חדש - לא חוזר לעולם מהשרת. */
    greenInvoiceApiKey?: string;
    greenInvoiceApiSecret?: string;
    greenInvoiceEnv?: 'sandbox' | 'production';
}
