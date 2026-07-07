import type { BusinessSettingsDTO, PaymentMethod } from 'shared';
import { PAYMENT_METHOD_LABELS } from 'shared';

interface PrintableInvoiceData {
  documentNumber: string;
  issuedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fromAddress: string;
  toAddress: string;
  moveDate?: string;
  totalPrice: number;
  paymentMethod?: PaymentMethod;
  customerIdNumber?: string;
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/**
 * מפיק ומדפיס (בחלון דפדפן נפרד) חשבונית/קבלה שהופקה במצב 'built_in' - ללא ספק
 * חיצוני. עוקב אחרי אותו דפוס שימוש בו כמו PrintableTerms.tsx: כתיבת HTML לחלון
 * הדפסה נפרד, ולחיצה על print() - התדפיס/שמירה כ-PDF נעשה בדפדפן של המשתמש.
 *
 * עיצוב "letterhead" מקצועי + הצגת אמצעי תשלום ות.ז/ח.פ הלקוח על גבי המסמך עצמו,
 * כנדרש לפי הוראות ניהול ספרים וחוק צמצום השימוש במזומן (ר' InvoiceService.ts לאכיפה).
 */
export function printBuiltInInvoice(business: BusinessSettingsDTO, invoice: PrintableInvoiceData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const showVat = business.businessType !== 'exempt';
  const vatRate = business.vatRate || 0;
  const totalBeforeVat = showVat ? invoice.totalPrice / (1 + vatRate / 100) : invoice.totalPrice;
  const vatAmount = showVat ? invoice.totalPrice - totalBeforeVat : 0;

  const fmt = (n: number) => `₪${n.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const title = showVat ? 'חשבונית מס / קבלה' : 'חשבונית / קבלה (עוסק פטור)';
  const paymentLabel = invoice.paymentMethod ? PAYMENT_METHOD_LABELS[invoice.paymentMethod] : null;
  const businessName = escapeHtml(business.businessName);
  const customerName = escapeHtml(invoice.customerName);
  const customerPhone = escapeHtml(invoice.customerPhone);
  const customerEmail = invoice.customerEmail ? escapeHtml(invoice.customerEmail) : '';
  const fromAddress = escapeHtml(invoice.fromAddress);
  const toAddress = escapeHtml(invoice.toAddress);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="utf-8" />
      <title>${title} #${invoice.documentNumber}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
          color: #1f2937;
          padding: 42px 46px;
          max-width: 820px;
          margin: 0 auto;
          font-size: 14px;
          line-height: 1.5;
        }
        .origin-mark {
          position: fixed;
          top: 28px;
          left: 46px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #9ca3af;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          padding: 3px 12px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          margin-bottom: 26px;
          border-bottom: 3px solid #1e40af;
        }
        .business-name { font-size: 24px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.3px; }
        .business-details { font-size: 12.5px; color: #6b7280; margin-top: 6px; line-height: 1.6; }
        .doc-title { text-align: left; min-width: 210px; }
        .doc-title h1 { font-size: 19px; margin: 0 0 8px; color: #111827; }
        .doc-title .doc-meta-row { display: flex; justify-content: space-between; gap: 14px; font-size: 12.5px; color: #4b5563; padding: 3px 0; }
        .doc-title .doc-meta-row strong { color: #111827; }
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
        th, td { text-align: right; padding: 10px 12px; font-size: 13.5px; }
        th { background: #eff6ff; color: #1e3a8a; font-weight: 700; border-bottom: 2px solid #dbeafe; }
        td { border-bottom: 1px solid #f0f1f3; }
        .totals { margin-top: 18px; width: 100%; max-width: 320px; margin-right: 0; margin-left: auto; }
        .totals td { border: none; padding: 5px 12px; font-size: 13.5px; }
        .totals .grand-total td { font-size: 18px; font-weight: 800; color: #1e3a8a; border-top: 2px solid #1e40af; padding-top: 10px; }
        .payment-box {
          margin-top: 22px; display: flex; gap: 24px; flex-wrap: wrap;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;
        }
        .payment-box .item { font-size: 13.5px; }
        .payment-box .item .label { color: #6b7280; font-size: 11.5px; display: block; margin-bottom: 2px; }
        .payment-box .item .value { color: #111827; font-weight: 700; }
        .exempt-note {
          font-size: 12px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a;
          padding: 10px 14px; border-radius: 8px; margin-top: 14px;
        }
        .footer {
          margin-top: 48px; font-size: 11px; color: #9ca3af; text-align: center;
          border-top: 1px solid #e5e7eb; padding-top: 14px;
        }
        @media print {
          body { padding: 14px 20px; }
          .origin-mark { position: absolute; }
        }
      </style>
    </head>
    <body>
      <div class="origin-mark">מקור</div>
      <div class="header">
        <div>
          <div class="business-name">${businessName}</div>
          <div class="business-details">
            ${business.businessId ? `מספר עוסק/ח.פ: ${escapeHtml(business.businessId)}<br/>` : ''}
            ${business.address ? `${escapeHtml(business.address)}<br/>` : ''}
            ${business.phone ? `טלפון: ${escapeHtml(business.phone)}` : ''}${business.phone && business.email ? ' &nbsp;|&nbsp; ' : ''}${business.email ? escapeHtml(business.email) : ''}
          </div>
        </div>
        <div class="doc-title">
          <h1>${title}</h1>
          <div class="doc-meta-row"><span>מספר מסמך</span><strong>${invoice.documentNumber}</strong></div>
          <div class="doc-meta-row"><span>תאריך הפקה</span><strong>${new Date(invoice.issuedAt).toLocaleDateString('he-IL')}</strong></div>
        </div>
      </div>

      <div class="section">
        <h2>פרטי לקוח</h2>
        <div class="info-grid">
          <div class="item"><span class="label">שם</span><span class="value">${customerName}</span></div>
          <div class="item"><span class="label">טלפון</span><span class="value">${customerPhone}</span></div>
          ${customerEmail ? `<div class="item"><span class="label">אימייל</span><span class="value">${customerEmail}</span></div>` : ''}
          ${invoice.customerIdNumber ? `<div class="item"><span class="label">ת.ז. / ח.פ</span><span class="value">${escapeHtml(invoice.customerIdNumber)}</span></div>` : ''}
        </div>
      </div>

      <div class="section">
        <h2>פרטי השירות</h2>
        <table>
          <thead>
            <tr><th>תיאור</th><th>מכתובת</th><th>לכתובת</th><th>מועד הובלה</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>שירותי הובלה</td>
              <td>${fromAddress}</td>
              <td>${toAddress}</td>
              <td>${invoice.moveDate ? new Date(invoice.moveDate).toLocaleDateString('he-IL') : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table class="totals">
        ${showVat ? `
          <tr><td>סכום לפני מע"מ</td><td>${fmt(totalBeforeVat)}</td></tr>
          <tr><td>מע"מ (${vatRate}%)</td><td>${fmt(vatAmount)}</td></tr>
        ` : ''}
        <tr class="grand-total"><td>סה"כ לתשלום</td><td>${fmt(invoice.totalPrice)}</td></tr>
      </table>

      ${paymentLabel ? `
        <div class="payment-box">
          <div class="item"><span class="label">אמצעי תשלום</span><span class="value">${paymentLabel}</span></div>
          <div class="item"><span class="label">סטטוס</span><span class="value">שולם במלואו</span></div>
        </div>
      ` : ''}

      ${!showVat ? `<div class="exempt-note">העוסק פטור ממע"מ על פי חוק מס ערך מוסף - אין לגבות מע"מ בגין עסקה זו.</div>` : ''}

      <div class="footer">
        מסמך זה הופק באופן ממוחשב ומהווה קבלה/חשבונית על תשלום ששולם בפועל.<br/>
        ${businessName} © ${new Date().getFullYear()}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
