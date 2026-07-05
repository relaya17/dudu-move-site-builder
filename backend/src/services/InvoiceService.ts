// שירות הפקת חשבונית/קבלה (מסמך מס) דרך Green Invoice (מורנינג) - ספק חשבוניות מורשה.
//
// חשוב מאוד: זהו מסמך מס המוסדר בחוק (לא כמו "הצעת מחיר" ב-QuoteService.ts).
// אין וממש אסור להפיק "חשבונית" מקומית בקוד הזה עצמו - אנחנו רק שולחים בקשה
// לספק מורשה (Green Invoice) שמבצע בפועל את ההנפקה, כולל הקצאת מספר מרשות המסים
// (נדרש בישראל מעל סף מסוים - ר' https://www.gov.il/he/service/request-assignment-number-for-tax-invoice)
// וחתימה דיגיטלית לפי תקנות מס הכנסה (ניהול פנקסי חשבונות).
//
// לפני שימוש בפרודקשן:
// 1. יש להירשם לחשבון Green Invoice (https://www.greeninvoice.co.il) ולבחור מסלול.
// 2. להפיק מפתחות API (key + secret) מהגדרות החשבון, ולהגדיר אותם כמשתני סביבה:
//    GREEN_INVOICE_API_KEY, GREEN_INVOICE_API_SECRET, GREEN_INVOICE_ENV=sandbox|production
// 3. לבדוק תחילה מול סביבת ה-sandbox, ולוודא שהשמות/שדות המדויקים תואמים את
//    התיעוד הרשמי העדכני (https://greeninvoice.docs.apiary.io/) - ייתכנו שינויים
//    בתיעוד שלא נבדקו כאן ידנית מול הסביבה החיה.

import { MoveEstimate, IMoveEstimate } from '../database/models/MoveEstimate';

const SANDBOX_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';
const PRODUCTION_BASE_URL = 'https://api.greeninvoice.co.il/api/v1';

// קוד סוג מסמך של Green Invoice: 320 = "חשבונית מס קבלה" (Invoice-Receipt) - המסמך הנפוץ ביותר
// לעסק קטן שמקבל תשלום מיידי. יש לוודא מול התיעוד הרשמי אם נדרש קוד אחר (חשבונית מס בלבד / קבלה בלבד).
const DOCUMENT_TYPE_INVOICE_RECEIPT = 320;

interface TokenCache {
    token: string;
    expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function isConfigured(): boolean {
    return Boolean(process.env.GREEN_INVOICE_API_KEY && process.env.GREEN_INVOICE_API_SECRET);
}

function getBaseUrl(): string {
    return process.env.GREEN_INVOICE_ENV === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;
}

async function getToken(): Promise<string> {
    if (tokenCache && tokenCache.expiresAt > Date.now()) {
        return tokenCache.token;
    }

    const response = await fetch(`${getBaseUrl()}/account/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: process.env.GREEN_INVOICE_API_KEY,
            secret: process.env.GREEN_INVOICE_API_SECRET
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`אימות מול Green Invoice נכשל: ${errorText}`);
    }

    const data = await response.json() as { token: string; expires?: number };
    tokenCache = {
        token: data.token,
        // מרווח ביטחון של דקה לפני תפוגה בפועל
        expiresAt: Date.now() + ((data.expires || 3600) * 1000) - 60_000
    };

    return tokenCache.token;
}

export class InvoiceService {
    static isConfigured = isConfigured;

    /**
     * מפיק חשבונית מס קבלה עבור הזמנת הובלה, דרך Green Invoice, ושומר את פרטי
     * המסמך שהתקבל (מספר, קישור PDF, מספר הקצאה אם קיים) על ה-estimate במונגו.
     */
    static async issueInvoiceReceipt(estimateId: string): Promise<IMoveEstimate | null> {
        if (!isConfigured()) {
            throw new Error(
                'הפקת חשבונית לא זמינה: לא הוגדרו GREEN_INVOICE_API_KEY / GREEN_INVOICE_API_SECRET. ' +
                'יש להירשם לשירות Green Invoice (או ספק חשבוניות מורשה אחר) ולהגדיר את המפתחות לפני הפקת חשבוניות אמיתיות.'
            );
        }

        const estimate = await MoveEstimate.findById(estimateId);
        if (!estimate) {
            return null;
        }

        // אם כבר הופקה חשבונית בעבר - לא מפיקים כפולה, מחזירים את הקיימת.
        if (estimate.invoice?.providerId) {
            return estimate;
        }

        const token = await getToken();

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
                    vatType: 1 // חייב במע"מ - יש לוודא מול התיעוד הרשמי
                }
            ],
            remarks: `הזמנת הובלה מס' ${estimate.id}`,
            lang: 'he',
            currency: 'ILS'
        };

        const response = await fetch(`${getBaseUrl()}/documents`, {
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
