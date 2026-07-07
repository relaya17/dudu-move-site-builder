import { MovingEstimateRequest } from '@/types/movingEstimate';
import type { BusinessSettingsDTO } from 'shared';

// שם/פרטי קשר גיבוי בלבד - למקרה שהגדרות העסק עדיין לא נטענו/לא הוגדרו.
// אין להסתמך על זה כמקור אמת: כל מוביל בפלטפורמה מציג את פרטי העסק שלו עצמו,
// שמגיעים דרך BusinessSettingsDTO (ר' MovingEstimateService.getBusinessSettings).
const FALLBACK_BUSINESS: Pick<BusinessSettingsDTO, 'businessName'> & { phone?: string; email?: string; address?: string } = {
  businessName: 'המוביל שלך',
};

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/**
 * פותח חלון הדפסה עם הצעת מחיר מעוצבת ללקוח, ומפעיל את דיאלוג ההדפסה של הדפדפן
 * (מאפשר "שמירה כ-PDF"). אותו דפוס בדיוק כמו PrintableTerms.tsx לתנאי שימוש/פרטיות.
 *
 * הערה חשובה: זהו מסמך שיווקי/מסחרי בלבד ("הצעת מחיר") ואינו מסמך מס -
 * אין לבלבל אותו עם חשבונית/קבלה, שמופקת דרך שירות חשבוניות מורשה (ר' InvoiceService).
 *
 * business מתקבל דינמית (ולא קבוע קשיח) כי בפלטפורמה מרובת-דיירים (multi-tenant)
 * לכל מוביל יש שם/פרטי קשר משלו - ר' printInvoice.ts לאותה גישה בחשבונית.
 */
export function printQuote(estimate: MovingEstimateRequest, business?: BusinessSettingsDTO | null): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const biz = business || FALLBACK_BUSINESS;
  const businessName = escapeHtml(biz.businessName);
  const contactLine = [
    biz.address ? escapeHtml(biz.address) : '',
    biz.phone ? escapeHtml(biz.phone) : '',
    biz.email ? escapeHtml(biz.email) : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  const quoteNumber = estimate.quote?.quoteNumber || 'טיוטה';
  const issuedDate = estimate.quote?.generatedAt
    ? new Date(estimate.quote.generatedAt).toLocaleDateString('he-IL')
    : new Date().toLocaleDateString('he-IL');

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);

  const itemsRows = estimate.inventory.map(item => `
    <tr>
      <td>${escapeHtml(item.type)}</td>
      <td>${item.quantity}</td>
      <td>${[
        item.isFragile ? 'שביר' : '',
        item.needsDisassemble ? 'פירוק' : '',
        item.needsReassemble ? 'הרכבה' : ''
      ].filter(Boolean).join(', ') || '-'}</td>
      <td>${escapeHtml(item.comments || item.description || '-')}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8" />
      <title>הצעת מחיר ${quoteNumber} - ${businessName}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
          color: #1f2937;
          padding: 42px 46px;
          max-width: 820px;
          margin: 0 auto;
          font-size: 14px;
          line-height: 1.55;
        }
        .header {
          display: flex; justify-content: space-between; align-items: flex-start;
          border-bottom: 3px solid #1e40af; padding-bottom: 18px; margin-bottom: 24px;
        }
        .business-name { font-size: 22px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.3px; }
        .business-contact { font-size: 12px; color: #6b7280; margin-top: 6px; }
        .doc-title { text-align: left; min-width: 200px; }
        .doc-title h1 { font-size: 18px; margin: 0 0 8px; color: #111827; }
        .doc-meta-row { display: flex; justify-content: space-between; gap: 14px; font-size: 12.5px; color: #4b5563; padding: 2px 0; }
        .doc-meta-row strong { color: #111827; }
        .section { margin: 22px 0; }
        .section h2 {
          font-size: 12px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase;
          color: #1e40af; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb;
        }
        .info-grid { display: flex; flex-wrap: wrap; gap: 4px 28px; font-size: 13.5px; }
        .info-grid .item { min-width: 200px; }
        .info-grid .item .label { color: #6b7280; font-size: 11.5px; display: block; margin-bottom: 1px; }
        .info-grid .item .value { color: #111827; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { text-align: right; padding: 9px 12px; font-size: 13.5px; }
        th { background: #eff6ff; color: #1e3a8a; font-weight: 700; border-bottom: 2px solid #dbeafe; }
        td { border-bottom: 1px solid #f0f1f3; }
        .total-row {
          display: flex; justify-content: flex-end; margin-top: 16px;
        }
        .total-row .box {
          font-size: 18px; font-weight: 800; color: #1e3a8a;
          border-top: 2px solid #1e40af; padding-top: 10px; min-width: 220px; text-align: left;
        }
        .disclaimer {
          margin-top: 30px; padding: 12px 16px; background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 8px; font-size: 12.5px; color: #92400e;
        }
        .footer {
          margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af;
          border-top: 1px solid #e5e7eb; padding-top: 14px;
        }
        @media print { body { padding: 14px 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="business-name">${businessName}</div>
          ${contactLine ? `<div class="business-contact">${contactLine}</div>` : ''}
        </div>
        <div class="doc-title">
          <h1>הצעת מחיר להובלה</h1>
          <div class="doc-meta-row"><span>מס' הצעה</span><strong>${escapeHtml(quoteNumber)}</strong></div>
          <div class="doc-meta-row"><span>תאריך הפקה</span><strong>${issuedDate}</strong></div>
          <div class="doc-meta-row"><span>בתוקף עד</span><strong>${validUntil.toLocaleDateString('he-IL')}</strong></div>
        </div>
      </div>

      <div class="section">
        <h2>פרטי לקוח</h2>
        <div class="info-grid">
          <div class="item"><span class="label">שם</span><span class="value">${escapeHtml(estimate.name)}</span></div>
          <div class="item"><span class="label">טלפון</span><span class="value">${escapeHtml(estimate.phone)}</span></div>
          <div class="item"><span class="label">אימייל</span><span class="value">${escapeHtml(estimate.email)}</span></div>
        </div>
      </div>

      <div class="section">
        <h2>פרטי ההובלה</h2>
        <div class="info-grid">
          <div class="item"><span class="label">סוג דירה</span><span class="value">${escapeHtml(estimate.apartmentType)}</span></div>
          <div class="item"><span class="label">תאריך מועדף</span><span class="value">${escapeHtml(estimate.preferredMoveDate)}</span></div>
          <div class="item"><span class="label">מכתובת</span><span class="value">${escapeHtml(estimate.currentAddress)}</span></div>
          <div class="item"><span class="label">לכתובת</span><span class="value">${escapeHtml(estimate.destinationAddress)}</span></div>
        </div>
      </div>

      <div class="section">
        <h2>פירוט פריטים</h2>
        <table>
          <thead>
            <tr><th>פריט</th><th>כמות</th><th>הערות מיוחדות</th><th>הערות נוספות</th></tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <div class="total-row">
        <div class="box">סה"כ הערכת מחיר: ₪${estimate.totalPrice.toLocaleString('he-IL')}</div>
      </div>

      <div class="disclaimer">
        מסמך זה הינו <strong>הצעת מחיר בלבד</strong> ואינו מהווה חשבונית מס או קבלה.
        המחיר הסופי ייקבע לאחר תיאום ואישור מולכם, ועשוי להשתנות בהתאם לתנאים בפועל ביום ההובלה.
        ההצעה בתוקף ל-14 יום ממועד ההפקה.
      </div>

      <div class="footer">
        ${businessName}${contactLine ? ` · ${contactLine}` : ''}<br>
        © ${new Date().getFullYear()} ${businessName} - כל הזכויות שמורות
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}
