// ✅ 1. QuoteService.ts - שירות שמדבר עם השרת
import { QuoteRequest, FurnitureItem } from '@/types/quote';

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
        status: 'pending',
      }),
    });

    if (!response.ok) throw new Error('Error saving quote');

    return await response.json();
  }

  static async getAllQuotes(): Promise<QuoteRequest[]> {
    const response = await fetch(this.API_URL);
    if (!response.ok) throw new Error('Error fetching quotes');
    return await response.json();
  }
}

export default QuoteService;

// (QuotesAdminPage component removed. This file should only contain service logic.)
