import { QuoteRequest, FurnitureItem } from '@/types/quote';

class QuoteService {
  private static readonly API_URL = 'http://localhost:3001/api/quotes';

  // שמירת הצעת מחיר חדשה בשרת (POST)
  static async saveQuoteRequest(
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
  ): Promise<QuoteRequest> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        furnitureInventory,
      }),
    });

    if (!response.ok) {
      throw new Error('Error saving quote');
    }

    const savedQuote = await response.json();

    // הדפסה לקונסול למעקב
    console.log('🎯 הצעת מחיר חדשה נשמרה בשרת:', savedQuote);

    return savedQuote;
  }
  // ב-quoteService.ts
  static async getAllQuotes(): Promise<QuoteRequest[]> {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      throw new Error('Error fetching quotes');
    }
    return await response.json();
  }

  // שאר הפונקציות יכולות להשאר כמו שהיו, אם ברצונך לנהל נתונים ב-localStorage או להפוך אותן לאסינכרוניות + API
  // לדוגמה, אפשר להוסיף getAllQuotes() שתקבל מהשרת וכו'

  // ... שאר המתודות כפי שהיו בגרסה שלך ...
}

export default QuoteService;
