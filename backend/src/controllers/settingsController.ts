import { Request, Response } from 'express';
import { BusinessSettings } from '../database/models/BusinessSettings';
import { Business } from '../database/models/Business';
import { InvoiceService } from '../services/InvoiceService';
import { BusinessType, DEFAULT_TURBO_SETTINGS, InvoiceProvider, TurboSettings } from 'shared';
import { tenantFilter } from '../lib/tenantFilter';

const BUSINESS_TYPES: BusinessType[] = ['exempt', 'licensed', 'company'];
const INVOICE_PROVIDERS: InvoiceProvider[] = ['built_in', 'green_invoice'];

function normalizeTurbo(turbo?: Partial<TurboSettings> | null): TurboSettings {
    return {
        ...DEFAULT_TURBO_SETTINGS,
        ...(turbo || {}),
    };
}

export class SettingsController {
    // מחזיר את הגדרות העסק - ללא הסודות עצמם (מפתחות ה-API), רק דגל שמציין אם הם מוגדרים.
    // req.tenantId מגיע מ-requireBusinessAuth (דיירים חדשים) או ריק (הזרימה הישנה
    // של דוד הובלות, מוגנת ב-requireAdminKey) - ר' lib/tenantFilter.ts.
    static async getSettings(req: Request, res: Response): Promise<void> {
        try {
            let settings = await BusinessSettings.findOne(tenantFilter(req.tenantId));
            if (!settings) {
                settings = await BusinessSettings.create({ tenantId: req.tenantId || undefined });
            }

            res.status(200).json({
                success: true,
                data: {
                    businessName: settings.businessName,
                    businessId: settings.businessId,
                    businessType: settings.businessType,
                    address: settings.address,
                    phone: settings.phone,
                    email: settings.email,
                    vatRate: settings.vatRate,
                    invoiceProvider: settings.invoiceProvider,
                    greenInvoiceConfigured: await InvoiceService.isGreenInvoiceConfigured(req.tenantId),
                    greenInvoiceEnv: settings.greenInvoiceEnv,
                    nextDocumentNumber: settings.nextDocumentNumber,
                    turbo: normalizeTurbo(settings.turbo),
                }
            });
        } catch (error) {
            console.error('Error getting business settings:', error);
            res.status(500).json({
                success: false,
                message: 'טעינת הגדרות העסק נכשלה',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // מידע ציבורי ובטוח בלבד - בכוונה בלי דרישת admin key, כדי שעמודי הלקוחות
    // עצמם (Navbar/Footer) יוכלו להציג את שם העסק. חושף אך ורק את השם - לא
    // טלפון/אימייל/כתובת/פרטי חיוב, כדי לא לחשוף מידע רגיש בנתיב לא מוגן.
    //
    // מקבל tenantSlug אופציונלי ב-query string (לדוגמה ?tenantSlug=david-move) -
    // זה השלב הראשון לקראת זיהוי דייר לפי subdomain באתר הציבורי. בלי הפרמטר
    // (המצב היום, כל עוד ה-frontend לא שולח אותו) מוצג שם העסק ה"ישן" (הזרימה
    // החד-דיירית המקורית), בדיוק כמו היום - אפס שינוי התנהגות לדוד הובלות.
    static async getPublicInfo(req: Request, res: Response): Promise<void> {
        try {
            const tenantSlug = typeof req.query.tenantSlug === 'string' ? req.query.tenantSlug : undefined;
            let tenantId: string | undefined;

            if (tenantSlug) {
                const business = await Business.findOne({ slug: tenantSlug });
                tenantId = business?.id;
                if (!tenantId) {
                    // slug לא קיים - עדיף להחזיר ברירת מחדל מאשר לחשוף שגיאה/לזלוג לדייר לא נכון.
                    res.status(200).json({ success: true, data: { businessName: 'David Move' } });
                    return;
                }
            }

            const settings = await BusinessSettings.findOne(tenantFilter(tenantId));
            res.status(200).json({
                success: true,
                data: { businessName: settings?.businessName || 'David Move' }
            });
        } catch (error) {
            console.error('Error getting public business info:', error);
            // גם בשגיאה מחזירים ברירת מחדל סבירה - זה שדה תצוגה בלבד, לא שווה
            // להפיל את טעינת האתר הציבורי (Navbar/Footer) בגללו.
            res.status(200).json({ success: true, data: { businessName: 'David Move' } });
        }
    }

    static async updateSettings(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body as Partial<{
                businessName: string; businessId: string; businessType: string;
                address: string; phone: string; email: string; vatRate: number;
                invoiceProvider: string; greenInvoiceApiKey: string; greenInvoiceApiSecret: string;
                greenInvoiceEnv: string; turbo: Partial<TurboSettings>;
            }>;

            if (body.businessType !== undefined && !BUSINESS_TYPES.includes(body.businessType as BusinessType)) {
                res.status(400).json({ success: false, message: 'סוג עסק לא תקין' });
                return;
            }
            if (body.invoiceProvider !== undefined && !INVOICE_PROVIDERS.includes(body.invoiceProvider as InvoiceProvider)) {
                res.status(400).json({ success: false, message: 'ספק חשבוניות לא תקין' });
                return;
            }
            if (body.vatRate !== undefined && (typeof body.vatRate !== 'number' || body.vatRate < 0 || body.vatRate > 100)) {
                res.status(400).json({ success: false, message: 'אחוז מע"מ לא תקין' });
                return;
            }

            let settings = await BusinessSettings.findOne(tenantFilter(req.tenantId));
            if (!settings) {
                settings = new BusinessSettings({ tenantId: req.tenantId || undefined });
            }

            if (body.businessName !== undefined) settings.businessName = body.businessName;
            if (body.businessId !== undefined) settings.businessId = body.businessId;
            if (body.businessType !== undefined) settings.businessType = body.businessType as BusinessType;
            if (body.address !== undefined) settings.address = body.address;
            if (body.phone !== undefined) settings.phone = body.phone;
            if (body.email !== undefined) settings.email = body.email;
            if (body.vatRate !== undefined) settings.vatRate = body.vatRate;
            if (body.invoiceProvider !== undefined) settings.invoiceProvider = body.invoiceProvider as InvoiceProvider;
            // מפתחות הספק החיצוני מוחלפים רק אם נשלח ערך חדש בפועל, כדי לא למחוק בטעות חיבור קיים.
            if (body.greenInvoiceApiKey) settings.greenInvoiceApiKey = body.greenInvoiceApiKey;
            if (body.greenInvoiceApiSecret) settings.greenInvoiceApiSecret = body.greenInvoiceApiSecret;
            if (body.greenInvoiceEnv !== undefined) settings.greenInvoiceEnv = body.greenInvoiceEnv as 'sandbox' | 'production';
            if (body.turbo !== undefined && typeof body.turbo === 'object') {
                settings.turbo = normalizeTurbo({ ...normalizeTurbo(settings.turbo), ...body.turbo });
            }

            await settings.save();
            res.status(200).json({
                success: true,
                message: 'ההגדרות נשמרו בהצלחה',
                data: { turbo: normalizeTurbo(settings.turbo) },
            });
        } catch (error) {
            console.error('Error updating business settings:', error);
            res.status(500).json({
                success: false,
                message: 'שמירת הגדרות העסק נכשלה',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // בדיקת חיבור ל-Green Invoice - שימושי לכפתור "בדוק חיבור" במסך ההגדרות, גם לפני השמירה.
    static async testGreenInvoiceConnection(req: Request, res: Response): Promise<void> {
        try {
            const { apiKey, apiSecret, env } = req.body as { apiKey?: string; apiSecret?: string; env?: string };

            if (!apiKey || !apiSecret) {
                res.status(400).json({ success: false, message: 'יש להזין מפתח API וסוד API לבדיקה' });
                return;
            }

            const result = await InvoiceService.testGreenInvoiceConnection({
                apiKey,
                apiSecret,
                env: env === 'production' ? 'production' : 'sandbox'
            });

            if (result.success) {
                res.status(200).json({ success: true, message: 'החיבור תקין!' });
            } else {
                res.status(400).json({ success: false, message: result.error || 'החיבור נכשל' });
            }
        } catch (error) {
            console.error('Error testing Green Invoice connection:', error);
            res.status(500).json({
                success: false,
                message: 'בדיקת החיבור נכשלה',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
