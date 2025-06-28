import React, { useEffect, useState } from 'react';
import QuoteService from '@/services/quoteService';
import { QuoteRequest } from '@/types/quote';

const QuotesAdminPage = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await QuoteService.getAllQuotes();
        setQuotes(data);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">ניהול הצעות מחיר</h1>
      {quotes.length === 0 && <p>אין הצעות כרגע</p>}
      {quotes.map((quote) => (
        <div key={quote.id} className="border p-4 mb-4 rounded shadow-md bg-white">
          <p><strong>שם:</strong> {quote.customerInfo.name}</p>
          <p><strong>טלפון:</strong> {quote.customerInfo.phone}</p>
          <p><strong>אימייל:</strong> {quote.customerInfo.email}</p>
          <p><strong>סוג מעבר:</strong> {quote.moveDetails.moveType}</p>
          <p><strong>כתובת מ:</strong> {quote.moveDetails.fromAddress}</p>
          <p><strong>כתובת ל:</strong> {quote.moveDetails.toAddress}</p>
          <p><strong>רהיטים:</strong> {quote.furnitureInventory.length} פריטים</p>
          <p><strong>סטטוס:</strong> {quote.status}</p>
        </div>
      ))}
    </div>
  );
};

export default QuotesAdminPage;
