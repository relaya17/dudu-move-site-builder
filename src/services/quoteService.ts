
import { QuoteRequest, FurnitureItem } from '@/types/quote';

class QuoteService {
  private static readonly STORAGE_KEY = 'davidMoving_quotes';

  // שמירת הצעת מחיר חדשה
  static saveQuoteRequest(
    formData: {
      name: string;
      email: string;
      phone: string;
      moveType: string;
      moveDate: string;
      fromAddress: string;
      toAddress: string;
      details: string;
    },
    furnitureInventory: FurnitureItem[]
  ): QuoteRequest {
    const quote: QuoteRequest = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      customerInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
      moveDetails: {
        moveType: formData.moveType,
        moveDate: formData.moveDate,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        details: formData.details,
      },
      furnitureInventory,
      status: 'pending'
    };

    // שמירה ב-localStorage
    const existingQuotes = this.getAllQuotes();
    existingQuotes.push(quote);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingQuotes));

    // הדפסה לקונסול למעקב
    console.log('🎯 הצעת מחיר חדשה נשמרה:', quote);
    this.logQuoteDetails(quote);

    return quote;
  }

  // קבלת כל הצעות המחיר
  static getAllQuotes(): QuoteRequest[] {
    try {
      const quotes = localStorage.getItem(this.STORAGE_KEY);
      return quotes ? JSON.parse(quotes) : [];
    } catch (error) {
      console.error('שגיאה בקריאת הצעות מחיר:', error);
      return [];
    }
  }

  // קבלת הצעת מחיר לפי ID
  static getQuoteById(id: string): QuoteRequest | null {
    const quotes = this.getAllQuotes();
    return quotes.find(quote => quote.id === id) || null;
  }

  // עדכון סטטוס הצעת מחיר
  static updateQuoteStatus(id: string, status: QuoteRequest['status']): boolean {
    const quotes = this.getAllQuotes();
    const quoteIndex = quotes.findIndex(quote => quote.id === id);
    
    if (quoteIndex !== -1) {
      quotes[quoteIndex].status = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quotes));
      return true;
    }
    return false;
  }

  // הדפסת פרטי הצעת מחיר בצורה מסודרת
  private static logQuoteDetails(quote: QuoteRequest): void {
    console.log(`
📋 פרטי הצעת מחיר מסודרים:
══════════════════════════════
🆔 מזהה: ${quote.id}
📅 תאריך: ${new Date(quote.timestamp).toLocaleString('he-IL')}

👤 פרטי לקוח:
  שם: ${quote.customerInfo.name}
  אימייל: ${quote.customerInfo.email}
  טלפון: ${quote.customerInfo.phone}

🚚 פרטי הובלה:
  סוג הובלה: ${quote.moveDetails.moveType}
  תאריך מעבר: ${quote.moveDetails.moveDate || 'לא צוין'}
  מכתובת: ${quote.moveDetails.fromAddress}
  לכתובת: ${quote.moveDetails.toAddress}
  פרטים נוספים: ${quote.moveDetails.details || 'אין'}

🪑 רשימת רהיטים:
${quote.furnitureInventory.map(item => 
  `  • ${item.type}: ${item.quantity} יחידות ${item.needsDisassembly ? '(דורש פירוק/הרכבה)' : '(ללא פירוק)'}`
).join('\n')}

📊 סטטוס: ${quote.status}
══════════════════════════════
    `);
  }

  // יצירת ID ייחודי
  private static generateId(): string {
    return 'quote_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // יצוא נתונים לקובץ JSON
  static exportQuotesToJson(): string {
    const quotes = this.getAllQuotes();
    return JSON.stringify(quotes, null, 2);
  }

  // הדפסת סיכום כל הצעות המחיר
  static logAllQuotesSummary(): void {
    const quotes = this.getAllQuotes();
    console.log(`
📊 סיכום הצעות מחיר:
════════════════════
📈 סה"כ הצעות: ${quotes.length}
⏳ ממתינות: ${quotes.filter(q => q.status === 'pending').length}
✅ עובדו: ${quotes.filter(q => q.status === 'processed').length}
📤 נשלחו: ${quotes.filter(q => q.status === 'sent').length}
════════════════════
    `);
    
    quotes.forEach(quote => {
      console.log(`${quote.id} | ${quote.customerInfo.name} | ${quote.moveDetails.moveType} | ${quote.status}`);
    });
  }
}

export default QuoteService;
