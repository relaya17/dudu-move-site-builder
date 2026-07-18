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

/**
 * אמצעי תשלום - חובה לציין על גבי קבלה/חשבונית לפי הוראות ניהול ספרים ("חוק המזומן"),
 * ר' InvoiceService.ts להסבר המלא ולאכיפה בפועל.
 */
export type PaymentMethod = 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'check', 'credit_card', 'bank_transfer', 'other'];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'מזומן',
    check: "צ'ק",
    credit_card: 'כרטיס אשראי',
    bank_transfer: 'העברה בנקאית',
    other: 'אחר'
};

/** סטטוס תשלום אונליין / העברה בנקאית להזמנה. */
export type OnlinePaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type OnlinePaymentChannel = 'card_demo' | 'card_provider' | 'bank_transfer' | 'open_banking';

export type OpenBankingLinkStatus = 'none' | 'pending' | 'linked' | 'revoked';

export interface OnlinePaymentInfo<TDate extends DateLike = string> {
    status: OnlinePaymentStatus;
    channel?: OnlinePaymentChannel;
    /** סכום ששולם / לתשלום בשקלים. */
    amount: number;
    currency: 'ILS';
    /** אסמכתא להעברה בנקאית / סליקה. */
    reference: string;
    providerPaymentId?: string;
    paidAt?: TDate;
    lastUpdatedAt?: TDate;
    openBankingStatus?: OpenBankingLinkStatus;
    bankTransfer?: {
        bankName: string;
        accountName: string;
        accountNumber: string;
        branch?: string;
        iban?: string;
        instructionsHe: string;
    };
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
    /** אמצעי התשלום - שדה חובה על קבלה לפי הוראות ניהול ספרים */
    paymentMethod?: PaymentMethod;
    /**
     * ת.ז./ח.פ של הלקוח - חובה לרשום על הקבלה כשסכום התשלום עולה על 5,000 ₪
     * (ר' InvoiceService.CUSTOMER_ID_REQUIRED_THRESHOLD).
     */
    customerIdNumber?: string;
}
