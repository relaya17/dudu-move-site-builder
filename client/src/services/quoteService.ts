// src/services/quoteService.ts
import { FurnitureItem, QuoteRequest } from '@/types/quote';

class QuoteService {
  private static readonly API_URL = 'http://localhost:3001/api/quotes';

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
        status: 'pending', // סטטוס ברירת מחדל
      }),
    });

    if (!response.ok) throw new Error('שגיאה בשליחת הנתונים לשרת');
    return await response.json();
  }

  static async getAllQuotes(): Promise<QuoteRequest[]> {
    const response = await fetch(this.API_URL);
    if (!response.ok) throw new Error('שגיאה בשליפת הצעות מחיר');
    return await response.json();
  }
}

export default QuoteService;
export { QuoteService };