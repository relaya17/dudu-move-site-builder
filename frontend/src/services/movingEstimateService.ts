// src/services/movingEstimateService.ts
import { FurnitureItem, MovingEstimateRequest } from '../types/movingEstimate';

class MovingEstimateService {
  private static readonly API_URL = 'http://localhost:3001/api/mongo/estimates';

  static async submitEstimateRequest(
    formData: {
      fullName: string;
      email: string;
      phone: string;
      apartmentType: string;
      rooms: string;
      moveDate: string;
      fromAddress: string;
      fromFloor: number;
      fromElevator: boolean;
      fromLift: boolean;
      toAddress: string;
      toFloor: number;
      toElevator: boolean;
      toLift: boolean;
      notes: string;
    },
    items: FurnitureItem[]
  ): Promise<MovingEstimateRequest> {
    const requestData: MovingEstimateRequest = {
      customerInfo: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone.startsWith('05') ? formData.phone : `05${formData.phone}`,
      },
      apartmentDetails: {
        apartmentType: formData.apartmentType,
        rooms: formData.rooms,
        moveDate: formData.moveDate,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        notes: formData.notes,
        fromFloor: formData.fromFloor,
        fromElevator: formData.fromElevator,
        fromLift: formData.fromLift,
        toFloor: formData.toFloor,
        toElevator: formData.toElevator,
        toLift: formData.toLift,
      },
      inventory: items.map(item => ({
        type: item.type,
        quantity: item.quantity,
        description: item.description || '',
        fragile: item.fragile || false,
        disassemble: item.disassemble || false,
        assemble: item.assemble || false,
        note: item.note || '',
        // Note: Image handling (File object) would require special backend logic (e.g., FormData) for actual upload.
        // For now, it's excluded from the JSON payload.
      })),
      status: 'pending',
      timestamp: new Date().toISOString() // Add timestamp when sending
    };

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      console.error('Request data sent:', JSON.stringify(requestData, null, 2));
      throw new Error(`שגיאה בשליחת בקשת הערכת מחיר: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  }

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

  static async updateEstimateStatus(id: string, status: 'pending' | 'estimated' | 'accepted' | 'rejected'): Promise<void> {
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
}

export default MovingEstimateService;
