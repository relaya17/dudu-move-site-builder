import mongoose, { Document, Schema } from 'mongoose';
import { BusinessType, InvoiceProvider } from 'shared';

/**
 * הגדרות עסק - מסמך יחיד (singleton) שמחזיק את פרטי העסק ואת אופן הפקת
 * החשבוניות (עצמאי בתוך האפליקציה, או חיבור לספק חיצוני). ר' shared/src/businessSettings.ts
 * להסבר המלא על שני המצבים, ו-InvoiceService.ts למימוש.
 */
export interface IBusinessSettings extends Document {
    // חשבון העסק (tenant) - ר' MoveEstimate.ts להסבר מלא. שים לב: זה שדה שונה
    // לגמרי מ-businessId למטה (מספר עוסק מורשה/ח.פ) - אין קשר בין השניים.
    tenantId?: mongoose.Types.ObjectId;
    businessName: string;
    businessId: string;
    businessType: BusinessType;
    address: string;
    phone: string;
    email: string;
    vatRate: number;
    invoiceProvider: InvoiceProvider;
    // מפתחות ה-API של הספק החיצוני - לא נבחרים כברירת מחדל בשליפות (select: false),
    // כדי שלא "יזלגו" בטעות בתשובת ה-API לפרונט.
    greenInvoiceApiKey?: string;
    greenInvoiceApiSecret?: string;
    greenInvoiceEnv?: 'sandbox' | 'production';
    // מספר המסמך הסידורי הבא שיינתן במצב 'built_in' - חייב לעלות ברצף ולא לחזור על עצמו.
    nextDocumentNumber: number;
    createdAt: Date;
    updatedAt: Date;
}

const BusinessSettingsSchema = new Schema<IBusinessSettings>({
    // index: true הוסר בכוונה מכאן - האינדקס האמיתי מוגדר למטה כ-unique+sparse,
    // כדי שלא יהיו בטעות שני מסמכי הגדרות לאותו tenant (מרוץ בין שתי בקשות
    // "get-or-create" ראשונות במקביל). sparse מדלג על מסמכים בלי tenantId
    // בכלל (הסינגלטון הישן של דוד הובלות), כך שזה לא משפיע על הזרימה הישנה.
    tenantId: { type: Schema.Types.ObjectId, ref: 'Business' },
    businessName: { type: String, default: 'דוד הובלות', trim: true },
    businessId: { type: String, default: '', trim: true },
    businessType: { type: String, enum: ['exempt', 'licensed', 'company'], default: 'licensed' },
    address: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    vatRate: { type: Number, default: 18, min: 0, max: 100 },
    invoiceProvider: { type: String, enum: ['built_in', 'green_invoice'], default: 'built_in' },
    greenInvoiceApiKey: { type: String, select: false },
    greenInvoiceApiSecret: { type: String, select: false },
    greenInvoiceEnv: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
    nextDocumentNumber: { type: Number, default: 1000, min: 1 }
}, {
    timestamps: true
});

BusinessSettingsSchema.index({ tenantId: 1 }, { unique: true, sparse: true });

export const BusinessSettings = mongoose.model<IBusinessSettings>('BusinessSettings', BusinessSettingsSchema);
