// src/services/movingEstimateService.ts
import { MovingEstimateRequest, EstimateStatus, TrackingStage } from '../types/movingEstimate';

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || '';

class MovingEstimateService {
  private static readonly API_URL = `${API_ROOT}/api/mongo/estimates`;
  private static readonly TRACKING_URL = `${API_ROOT}/api/tracking`;

  static async getAllEstimates(): Promise<MovingEstimateRequest[]> {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בשליפת הערכות מחיר: ${errorText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  static async getEstimateById(id: string): Promise<MovingEstimateRequest> {
    const response = await fetch(`${this.API_URL}/${id}`);
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: {
        'Content-Type': 'application/json',
        ...(ADMIN_KEY ? { 'x-admin-key': ADMIN_KEY } : {})
      },
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
      headers: {
        'Content-Type': 'application/json',
        ...(ADMIN_KEY ? { 'x-admin-key': ADMIN_KEY } : {})
      },
      body: JSON.stringify({ lat, lng, address })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בעדכון מיקום: ${errorText}`);
    }
  }
}

export default MovingEstimateService;
