// שירות הפקת חשבונית/קבלה עבור הזמנת הובלה. תומך בשני מצבים (ר' BusinessSettingsDTO
// ב-shared/src/businessSettings.ts, וההסבר המלא ב-shared/src/billing.ts):
//
// 1. 'built_in' (ברירת מחדל) - הפקה עצמאית בתוך האפליקציה, ללא תלות בספק חיצוני
//    וללא כל תשלום. המסמך מקבל מספר סידורי רץ (ולא "מספר הקצאה" מרשות המסים).
//    זה מתאים לרוב עסקאות ההובלה, שהן עסקאות B2C מול לקוחות פרטיים - עבורן לא
//    חלה חובת "מספר הקצאה" ברפורמת "חשבוניות ישראל" (החובה חלה רק אם הלקוח הוא
//    עוסק מורשה שדרש בעצמו מספר הקצאה, ומעל סכום סף - 5,000 ₪ לפני מע"מ מיוני 2026).
//    ה-PDF/התדפיס עצמו מופק בצד הלקוח (frontend) בדפדפן, בדיוק כמו הצעת המחיר.
//
// 2. 'green_invoice' - התחברות לספק חשבוניות מורשה חיצוני (Green Invoice/מורנינג),
//    לעסקים שמעדיפים שירות SaaS מלא או שמנפיקים לעוסקים מורשים בסכומים גבוהים.
//    ניתן להגדיר את המפתחות דרך מסך ההגדרות באפליקציה (BusinessSettings) או
//    כמשתני סביבה (GREEN_INVOICE_API_KEY/SECRET/ENV) כגיבוי.
//
// הערה: זו אינה יעוץ משפטי/מיסויי - מומלץ לאמת עם רואה חשבון/יועץ מס בהתאם לאופי
// ולהיקף העסק, בפרט אם מונפקות חשבוניות בסכומים גבוהים ללקוחות עוסקים מורשים.

import { MoveEstimate, IMoveEstimate } from '../database/models/MoveEstimate';
import { BusinessSettings, IBusinessSettings } from '../database/models/BusinessSettings';

const SANDBOX_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';
const PRODUCTION_BASE_URL = 'https://api.greeninvoice.co.il/api/v1';

// קוד סוג מסמך של Green Invoice: 320 = "חשבונית מס קבלה" (Invoice-Receipt)
const DOCUMENT_TYPE_INVOICE_RECEIPT = 320;

interface GreenInvoiceCredentials {
    apiKey: string;
    apiSecret: string;
    env: 'sandbox' | 'production';
}

interface TokenCache {
    token: string;
    expiresAt: number;
    apiKey: string; // מאפשר להשקיע cache שונה אם המפתח מוחלף
}

let tokenCache: TokenCache | null = null;

function getBaseUrl(env: 'sandbox' | 'production'): string {
    return env === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

async function getToken(creds: GreenInvoiceCredentials): Promise<string> {
    if (tokenCache && tokenCache.apiKey === creds.apiKey && tokenCache.expiresAt > Date.now()) {
        return tokenCache.token;
    }

    const response = await fetch(`${getBaseUrl(creds.env)}/account/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: creds.apiKey, secret: creds.apiSecret })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`אימות מול Green Invoice נכשל: ${errorText}`);
    }

    const data = await response.json() as { token: string; expires?: number };
    tokenCache = {
        token: data.token,
        apiKey: creds.apiKey,
        expiresAt: Date.now() + ((data.expires || 3600) * 1000) - 60_000
    };

    return tokenCache.token;
}

async function getSettings(withSecrets = false): Promise<IBusinessSettings> {
    const settings = withSecrets
        ? await BusinessSettings.findOne().select('+greenInvoiceApiKey +greenInvoiceApiSecret')
        : await BusinessSettings.findOne();

    if (!settings) {
        return await BusinessSettings.create({});
    }
    return settings;
}

/** שולף את מפתחות Green Invoice - מעדיף את ההגדרות שנשמרו דרך מסך ההגדרות, ונופל למשתני סביבה כגיבוי. */
async function resolveGreenInvoiceCredentials(): Promise<GreenInvoiceCredentials | null> {
    const settings = await getSettings(true);
    const apiKey = settings.greenInvoiceApiKey || process.env.GREEN_INVOICE_API_KEY;
    const apiSecret = settings.greenInvoiceApiSecret || process.env.GREEN_INVOICE_API_SECRET;
    const env = (settings.greenInvoiceEnv || process.env.GREEN_INVOICE_ENV || 'sandbox') as 'sandbox' | 'production';

    if (!apiKey || !apiSecret) {
        return null;
    }
    return { apiKey, apiSecret, env };
}

export class InvoiceService {
    /** האם קיימת התחברות תקינה (מפתחות) לספק החיצוני, בהגדרות או במשתני סביבה. */
    static async isGreenInvoiceConfigured(): Promise<boolean> {
        const creds = await resolveGreenInvoiceCredentials();
        return creds !== null;
    }

    /** בודק חיבור לספק החיצוני עם מפתחות נתונים (למשל לפני שמירה, מכפתור "בדוק חיבור" בהגדרות). */
    static async testGreenInvoiceConnection(creds: GreenInvoiceCredentials): Promise<{ success: boolean; error?: string }> {
        try {
            await getToken(creds);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'החיבור נכשל' };
        }
    }

    /**
     * מפיק חשבונית מס/קבלה עבור הזמנת הובלה. בוחר אוטומטית בין הפקה עצמאית (built_in)
     * לבין הספק החיצוני, לפי ההגדרה השמורה ב-BusinessSettings.
     */
    static async issueInvoiceReceipt(estimateId: string): Promise<IMoveEstimate | null> {
        const estimate = await MoveEstimate.findById(estimateId);
        if (!estimate) {
            return null;
        }

        // אם כבר הופקה חשבונית בעבר - לא מפיקים כפולה, מחזירים את הקיימת.
        if (estimate.invoice?.documentNumber) {
            return estimate;
        }

        const settings = await getSettings();
        const creds = settings.invoiceProvider === 'green_invoice' ? await resolveGreenInvoiceCredentials() : null;

        if (settings.invoiceProvider === 'green_invoice' && creds) {
            return this.issueViaGreenInvoice(estimate, creds);
        }

        // ברירת מחדל / נפילה חזרה: הפקה עצמאית (built_in) - חינמית וללא ספק חיצוני.
        return this.issueBuiltIn(estimate, settings);
    }

    private static async issueBuiltIn(estimate: IMoveEstimate, settings: IBusinessSettings): Promise<IMoveEstimate> {
        // הקצאת מספר סידורי רץ באופן אטומי, כדי שלא יהיו כפילויות/דילוגים בין הפקות מקבילות.
        const updated = await BusinessSettings.findOneAndUpdate(
            { _id: settings._id },
            { $inc: { nextDocumentNumber: 1 } },
            { new: false }
        );
        const sequenceNumber = updated?.nextDocumentNumber ?? settings.nextDocumentNumber;
        const documentNumber = `${new Date().getFullYear()}-${String(sequenceNumber).padStart(6, '0')}`;

        estimate.invoice = {
            docType: 'invoice_receipt',
            providerId: 'built_in',
            documentNumber,
            documentUrl: '',
            issuedAt: new Date()
        };

        await estimate.save();
        return estimate;
    }

    private static async issueViaGreenInvoice(estimate: IMoveEstimate, creds: GreenInvoiceCredentials): Promise<IMoveEstimate> {
        const token = await getToken(creds);

        const payload = {
            type: DOCUMENT_TYPE_INVOICE_RECEIPT,
            client: {
                name: estimate.name,
                emails: [estimate.email],
                phone: estimate.phone
            },
            income: [
                {
                    description: `שירותי הובלה - ${estimate.currentAddress} אל ${estimate.destinationAddress}`,
                    quantity: 1,
                    price: estimate.totalPrice,
                    currency: 'ILS',
                    vatType: 1
                }
            ],
            remarks: `הזמנת הובלה מס' ${estimate.id}`,
            lang: 'he',
            currency: 'ILS'
        };

        const response = await fetch(`${getBaseUrl(creds.env)}/documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`הפקת חשבונית ב-Green Invoice נכשלה: ${errorText}`);
        }

        const doc = await response.json() as {
            id: string;
            number: string;
            allocationNumber?: string;
            url?: { he?: string; origin?: string };
        };

        estimate.invoice = {
            docType: 'invoice_receipt',
            providerId: doc.id,
            documentNumber: doc.number,
            allocationNumber: doc.allocationNumber,
            documentUrl: doc.url?.he || doc.url?.origin || '',
            issuedAt: new Date()
        };

        await estimate.save();
        return estimate;
    }
}
