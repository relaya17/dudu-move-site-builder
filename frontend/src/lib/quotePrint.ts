import { MovingEstimateRequest } from '@/types/movingEstimate';

// פרטי הקשר של העסק - תואמים לאלו שמופיעים בפוטר/בדף הבית (מקור האמת התוכני).
const COMPANY_NAME = 'דוד הובלות';
const COMPANY_PHONE = '0547777623';
const COMPANY_EMAIL = 'davidgueta3232@gmail.com';
const COMPANY_ADDRESS = 'אילת, ישראל';

/**
 * פותח חלון הדפסה עם הצעת מחיר מעוצבת ללקוח, ומפעיל את דיאלוג ההדפסה של הדפדפן
 * (מאפשר "שמירה כ-PDF"). אותו דפוס בדיוק כמו PrintableTerms.tsx לתנאי שימוש/פרטיות.
 *
 * הערה חשובה: זהו מסמך שיווקי/מסחרי בלבד ("הצעת מחיר") ואינו מסמך מס -
 * אין לבלבל אותו עם חשבונית/קבלה, שמופקת דרך שירות חשבוניות מורשה (ר' InvoiceService).
 */
export function printQuote(estimate: MovingEstimateRequest): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

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
      <title>הצעת מחיר ${quoteNumber} - ${COMPANY_NAME}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #111; padding: 24px; }
        h1 { text-align: center; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 24px; font-size: 18px; }
        .meta { display: flex; justify-content: space-between; font-size: 14px; color: #444; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: right; font-size: 14px; }
        th { background: #f1f5f9; }
        .total { font-size: 20px; font-weight: bold; text-align: left; margin-top: 16px; }
        .disclaimer { margin-top: 32px; padding: 12px; background: #fef9c3; border: 1px solid #eab308; border-radius: 6px; font-size: 13px; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <h1>הצעת מחיר להובלה</h1>
      <div class="meta">
        <span>מס' הצעה: ${quoteNumber}</span>
        <span>תאריך הפקה: ${issuedDate}</span>
        <span>בתוקף עד: ${validUntil.toLocaleDateString('he-IL')}</span>
      </div>

      <h2>פרטי לקוח</h2>
      <p>שם: ${escapeHtml(estimate.name)}<br>
      טלפון: ${escapeHtml(estimate.phone)}<br>
      אימייל: ${escapeHtml(estimate.email)}</p>

      <h2>פרטי ההובלה</h2>
      <p>
        סוג דירה: ${escapeHtml(estimate.apartmentType)}<br>
        תאריך מועדף: ${escapeHtml(estimate.preferredMoveDate)}<br>
        מ: ${escapeHtml(estimate.currentAddress)}<br>
        אל: ${escapeHtml(estimate.destinationAddress)}
      </p>

      <h2>פירוט פריטים</h2>
      <table>
        <thead>
          <tr><th>פריט</th><th>כמות</th><th>הערות מיוחדות</th><th>הערות נוספות</th></tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <p class="total">סה"כ הערכת מחיר: ₪${estimate.totalPrice.toLocaleString()}</p>

      <div class="disclaimer">
        מסמך זה הינו <strong>הצעת מחיר בלבד</strong> ואינו מהווה חשבונית מס או קבלה.
        המחיר הסופי ייקבע לאחר תיאום ואישור מולכם, ועשוי להשתנות בהתאם לתנאים בפועל ביום ההובלה.
        ההצעה בתוקף ל-14 יום ממועד ההפקה.
      </div>

      <div class="footer">
        ${COMPANY_NAME} · ${COMPANY_ADDRESS} · ${COMPANY_PHONE} · ${COMPANY_EMAIL}<br>
        © ${new Date().getFullYear()} ${COMPANY_NAME} - כל הזכויות שמורות
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
