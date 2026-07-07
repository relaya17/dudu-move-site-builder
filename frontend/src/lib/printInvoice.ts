import type { BusinessSettingsDTO } from 'shared';

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
}

/**
 * מפיק ומדפיס (בחלון דפדפן נפרד) חשבונית/קבלה שהופקה במצב 'built_in' - ללא ספק
 * חיצוני. עוקב אחרי אותו דפוס שימוש בו כמו PrintableTerms.tsx: כתיבת HTML לחלון
 * הדפסה נפרד, ולחיצה על print() - התדפיס/שמירה כ-PDF נעשה בדפדפן של המשתמש.
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

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="utf-8" />
      <title>${title} #${invoice.documentNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
        .business-name { font-size: 22px; font-weight: bold; color: #2563eb; }
        .business-details { font-size: 13px; color: #555; margin-top: 4px; line-height: 1.5; }
        .doc-title { text-align: left; }
        .doc-title h1 { font-size: 20px; margin: 0; }
        .doc-title p { font-size: 13px; color: #555; margin: 2px 0; }
        .section { margin: 20px 0; }
        .section h2 { font-size: 14px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: right; padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
        th { background: #f3f4f6; font-weight: 600; }
        .totals { margin-top: 16px; width: 100%; max-width: 320px; margin-right: 0; margin-left: auto; }
        .totals td { border: none; padding: 4px 10px; }
        .totals .grand-total { font-size: 17px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 8px; }
        .footer { margin-top: 40px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
        .exempt-note { font-size: 12px; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 6px; margin-top: 12px; }
        @media print { body { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="business-name">${business.businessName}</div>
          <div class="business-details">
            ${business.businessId ? `מספר עוסק/ח.פ: ${business.businessId}<br/>` : ''}
            ${business.address || ''}<br/>
            ${business.phone ? `טלפון: ${business.phone}` : ''} ${business.email ? `| ${business.email}` : ''}
          </div>
        </div>
        <div class="doc-title">
          <h1>${title}</h1>
          <p>מספר מסמך: <strong>${invoice.documentNumber}</strong></p>
          <p>תאריך: ${new Date(invoice.issuedAt).toLocaleDateString('he-IL')}</p>
        </div>
      </div>

      <div class="section">
        <h2>פרטי לקוח</h2>
        <p>${invoice.customerName} | ${invoice.customerPhone}${invoice.customerEmail ? ` | ${invoice.customerEmail}` : ''}</p>
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
              <td>${invoice.fromAddress}</td>
              <td>${invoice.toAddress}</td>
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

      ${!showVat ? `<div class="exempt-note">העוסק פטור ממע"מ על פי חוק מס ערך מוסף - אין לגבות מע"מ בגין עסקה זו.</div>` : ''}

      <div class="footer">
        מסמך זה הופק באופן ממוחשב ומהווה קבלה/חשבונית על תשלום ששולם בפועל.<br/>
        ${business.businessName} © ${new Date().getFullYear()}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
