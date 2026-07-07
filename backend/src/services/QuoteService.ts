import { MoveEstimate, IMoveEstimate } from '../database/models/MoveEstimate';
import { tenantFilter } from '../lib/tenantFilter';

/**
 * הצעת מחיר (quote) - מסמך שיווקי/מסחרי, לא מסמך מס.
 * ניתן להפיק ולהדפיס אותה עצמאית (ה-PDF עצמו נוצר בצד הלקוח דרך חלון הדפסה,
 * באותו אופן שבו מופקים תנאי השימוש/מדיניות הפרטיות - ר' PrintableTerms.tsx).
 * כאן אנחנו רק מנפיקים ושומרים מספר הצעה סידורי לצורך מעקב אצל בעל העסק.
 *
 * חשוב: אין לבלבל בין הצעת מחיר לבין חשבונית/קבלה (מסמך מס) - ר' InvoiceService.ts.
 *
 * tenantId אופציונלי מסנן איזו הזמנה מותר לגעת בה - הגנה כפולה (defense in
 * depth) מעבר לבדיקת הבעלות שכבר קיימת ב-mongoController, כדי שקריאה עתידית
 * ישירה לשירות הזה (בלי לעבור דרך אותו controller) לא תוכל "לגלוש" לדייר אחר.
 */
export class QuoteService {
    static async issueQuote(estimateId: string, tenantId?: string): Promise<IMoveEstimate | null> {
        const estimate = await MoveEstimate.findOne({ _id: estimateId, ...tenantFilter(tenantId) });
        if (!estimate) {
            return null;
        }

        // אם כבר הופקה הצעת מחיר בעבר - מחזירים את אותו מספר (לא מנפיקים כפול).
        if (!estimate.quote?.quoteNumber) {
            const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const idPart = estimate.id.toString().slice(-6).toUpperCase();
            estimate.quote = {
                quoteNumber: `Q-${datePart}-${idPart}`,
                generatedAt: new Date()
            };
            await estimate.save();
        }

        return estimate;
    }
}
