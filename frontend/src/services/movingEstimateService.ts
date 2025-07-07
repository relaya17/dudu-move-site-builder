// src/services/movingEstimateService.ts
import { FurnitureItem, MovingEstimateRequest } from '../types/movingEstimate';

class MovingEstimateService {
  private static readonly API_URL = 'http://localhost:3001/api/move-requests';

  static async submitEstimateRequest(
    formData: {
      name: string;
      email: string;
      phone: string;
      apartmentType: string;
      preferredMoveDate: string;
      currentAddress: string;
      destinationAddress: string;
      additionalNotes: string;
      hasElevator?: boolean;
      floor?: number;
      parkingAvailable?: boolean;
    },
    inventory: FurnitureItem[]
  ): Promise<MovingEstimateRequest> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerData: {
          first_name: formData.name.split(' ')[0] || formData.name,
          last_name: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          phone: formData.phone,
        },
        moveData: {
          apartment_type: formData.apartmentType,
          preferred_move_date: formData.preferredMoveDate,
          current_address: formData.currentAddress,
          destination_address: formData.destinationAddress,
          additional_notes: formData.additionalNotes,
        },
        furnitureItems: inventory,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בשליחת בקשת הערכת מחיר: ${errorText}`);
    }

    return await response.json();
  }

  static async getAllEstimates(): Promise<MovingEstimateRequest[]> {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`שגיאה בשליפת הערכות מחיר: ${errorText}`);
    }

    return await response.json();
  }
}

export default MovingEstimateService;
