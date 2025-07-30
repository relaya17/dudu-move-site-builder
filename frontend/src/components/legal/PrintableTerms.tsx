import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { legalConfig } from '@/config/legal';

interface PrintableTermsProps {
  type: 'terms' | 'privacy' | 'accessibility';
}

export const PrintableTerms: React.FC<PrintableTermsProps> = ({ type }) => {
  const handlePrint = () => {
    // יצירת חלון הדפסה נפרד עם עיצוב מותאם
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let content = '';
    let title = '';

    switch (type) {
      case 'terms':
        title = 'תנאי שימוש והגבלת אחריות';
        content = generateTermsContent();
        break;
      case 'privacy':
        title = 'מדיניות פרטיות';
        content = generatePrivacyContent();
        break;
      case 'accessibility':
        title = 'הצהרת נגישות';
        content = generateAccessibilityContent();
        break;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <title>${title}</title>
        <style>
          @media print {
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              padding: 20px;
            }
            h1 {
              text-align: center;
              color: #333;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            h2 {
              color: #444;
              margin-top: 20px;
            }
            .section {
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .date {
              text-align: left;
              font-size: 12px;
              color: #666;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 100px;
              color: rgba(0,0,0,0.1);
              z-index: -1;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">דודו הובלות</div>
        <div class="date">תאריך הדפסה: ${new Date().toLocaleDateString('he-IL')}</div>
        <h1>${title}</h1>
        ${content}
        <div class="footer">
          © ${new Date().getFullYear()} דודו הובלות - כל הזכויות שמורות<br>
          מסמך זה הודפס מאתר דודו הובלות ומהווה העתק של התנאים המקוונים
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const generateTermsContent = () => {
    return `
      <div class="section">
        <h2>כללי</h2>
        ${legalConfig.termsOfService.sections.map(section => `
          <div class="section">
            <h3>${section.title}</h3>
            <p>${section.content}</p>
          </div>
        `).join('')}
      </div>
      <div class="section">
        <h2>הגבלת אחריות</h2>
        <p>סכום אחריות מקסימלי: ${legalConfig.liability.maxAmount.toLocaleString()} ₪</p>
        <h3>פריטים שאינם מכוסים:</h3>
        <ul>
          ${legalConfig.liability.excludedItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  const generatePrivacyContent = () => {
    return `
      <div class="section">
        ${legalConfig.privacyPolicy.sections.map(section => `
          <div class="section">
            <h2>${section.title}</h2>
            <p>${section.content}</p>
          </div>
        `).join('')}
      </div>
    `;
  };

  const generateAccessibilityContent = () => {
    return `
      <div class="section">
        <p>${legalConfig.accessibility.statement}</p>
        <h2>תכונות נגישות</h2>
        <ul>
          ${legalConfig.accessibility.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <h2>פרטי קשר</h2>
        <p>רכז נגישות: ${legalConfig.accessibility.contact.name}</p>
        <p>דוא"ל: ${legalConfig.accessibility.contact.email}</p>
        <p>טלפון: ${legalConfig.accessibility.contact.phone}</p>
      </div>
    `;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handlePrint}
    >
      <Printer className="h-4 w-4" />
      הדפסה
    </Button>
  );
};