/**
 * שלבי המעקב אחרי ההובלה, לפי סדר כרונולוגי.
 * מקור אמת יחיד - נצרך הן ב-backend (מודל Mongoose, שירות המעקב) והן ב-frontend (UI המעקב/הניהול).
 */
export const TRACKING_STAGES = [
    'order_placed', // ההזמנה התקבלה
    'confirmed', // ההזמנה אושרה
    'packing_disassembly', // פירוק ואריזה
    'in_transit', // בדרך ליעד
    'unloading_assembly', // פריקה והרכבה
    'completed' // ההובלה הושלמה
] as const;

export type TrackingStage = typeof TRACKING_STAGES[number];

export const TRACKING_STAGE_LABELS: Record<TrackingStage, string> = {
    order_placed: 'ההזמנה התקבלה',
    confirmed: 'ההזמנה אושרה',
    packing_disassembly: 'פירוק ואריזה',
    in_transit: 'בדרך ליעד',
    unloading_assembly: 'פריקה והרכבה',
    completed: 'ההובלה הושלמה'
};

/**
 * ערך גנרי לתאריך/שעה כפי שהוא מיוצג בפועל בכל שכבה:
 * - במסד הנתונים (Mongoose): אובייקט Date.
 * - במעטפת ה-API / ב-frontend: מחרוזת ISO (כפי שמגיעה מ-JSON.stringify).
 */
export type DateLike = Date | string;

export interface StageHistoryEntry<TDate extends DateLike = string> {
    stage: TrackingStage;
    at: TDate;
    note?: string;
}

export interface TrackingLocation<TDate extends DateLike = string> {
    lat: number;
    lng: number;
    address?: string;
    updatedAt: TDate;
}

/**
 * תצוגה ציבורית ומצומצמת של מעקב הובלה - מוחזרת מ-GET /api/tracking/:token,
 * ללא חשיפת מזהי מסד הנתונים הפנימיים או פרטי לקוח רגישים מעבר לנדרש.
 */
export interface TrackingDocumentSummary {
    quote: {
        quoteNumber: string;
        generatedAt: string;
    } | null;
    invoice: {
        documentNumber: string;
        documentUrl: string;
        issuedAt: string;
        docType: string;
        /** true כשהמסמך מובנה באפליקציה (ניתן להדפסה דרך /documents). */
        printable: boolean;
    } | null;
    totalPrice: number | null;
}

export interface TrackingBusinessContact {
    businessName: string;
    phone: string;
    email: string;
    address?: string;
}

export interface TrackingViewDTO {
    trackingToken: string;
    name: string;
    apartmentType: string;
    preferredMoveDate: string;
    currentAddress: string;
    destinationAddress: string;
    status: string;
    stage: TrackingStage;
    stages: readonly TrackingStage[];
    stageHistory: StageHistoryEntry[];
    location: TrackingLocation | null;
    reminderEmailSentAt: string | null;
    reminderSmsSentAt: string | null;
    createdAt: string;
    /** מסמכים זמינים ללקוח (הצעה / חשבונית). */
    documents: TrackingDocumentSummary;
    /** פרטי יצירת קשר עם המוביל לשיחה ישירה. */
    businessContact: TrackingBusinessContact;
    /** מצב תשלום אונליין / העברה / Open Banking (תצוגה ציבורית). */
    payment: {
        status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
        channel?: string;
        amount: number;
        currency: 'ILS';
        reference: string;
        paidAt?: string;
        openBankingStatus?: 'none' | 'pending' | 'linked' | 'revoked';
        bankTransfer?: {
            bankName: string;
            accountName: string;
            accountNumber: string;
            branch?: string;
            iban?: string;
            instructionsHe: string;
        };
    } | null;
}
