// src/services/movingEstimateService.ts
import { MovingEstimateRequest, EstimateStatus, TrackingStage } from '../types/movingEstimate';
import { adminHeaders } from '../lib/adminApi';

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

class MovingEstimateService {
  private static readonly API_URL = `${API_ROOT}/api/mongo/estimates`;
  private static readonly TRACKING_URL = `${API_ROOT}/api/tracking`;

  static async getAllEstimates(): Promise<MovingEstimateRequest[]> {
    const response = await fetch(this.API_URL, { headers: adminHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בשליפת הערכות מחיר: ${errorText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  static async getEstimateById(id: string): Promise<MovingEstimateRequest> {
    const response = await fetch(`${this.API_URL}/${id}`, { headers: adminHeaders() });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בשליפת הערכת מחיר: ${errorText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  static async updateEstimateStatus(id: string, status: EstimateStatus): Promise<void> {
    const response = await fetch(`${this.API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בעדכון סטטוס הערכת מחיר: ${errorText}`);
    }
  }

  static async updateTrackingStage(trackingToken: string, stage: TrackingStage, note?: string): Promise<void> {
    const response = await fetch(`${this.TRACKING_URL}/${trackingToken}/stage`, {
      method: 'PATCH',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ stage, note })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בעדכון שלב מעקב: ${errorText}`);
    }
  }

  static async updateTrackingLocation(trackingToken: string, lat: number, lng: number, address?: string): Promise<void> {
    const response = await fetch(`${this.TRACKING_URL}/${trackingToken}/location`, {
      method: 'PATCH',
      headers: adminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ lat, lng, address })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בעדכון מיקום: ${errorText}`);
    }
  }

  /**
   * מנפיק (או מחזיר, אם כבר קיים) מספר הצעת מחיר - מסמך לא-פיסקלי.
   * ה-PDF עצמו מופק ומודפס בצד הלקוח דרך חלון הדפסה (ר' quotePrint.ts).
   */
  static async issueQuote(id: string): Promise<MovingEstimateRequest> {
    const response = await fetch(`${this.API_URL}/${id}/quote`, {
      method: 'POST',
      headers: adminHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בהפקת הצעת מחיר: ${errorText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * מפיק חשבונית מס קבלה (מסמך מס) דרך ספק חשבוניות מורשה חיצוני (Green Invoice).
   * ייכשל עם הודעה ברורה אם השירות טרם הוגדר (ר' backend/src/services/InvoiceService.ts).
   */
  static async issueInvoice(id: string): Promise<MovingEstimateRequest> {
    const response = await fetch(`${this.API_URL}/${id}/invoice`, {
      method: 'POST',
      headers: adminHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בהפקת חשבונית: ${errorText}`);
    }

    const result = await response.json();
    return result.data || result;
  }
}

export default MovingEstimateService;
