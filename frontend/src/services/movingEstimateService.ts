// src/services/movingEstimateService.ts
import { FurnitureItem, MovingEstimateRequest } from '../types/movingEstimate';

class MovingEstimateService {
  private static readonly API_URL = 'http://localhost:3001/api/moving-estimates';

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
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        apartmentDetails: {
          apartmentType: formData.apartmentType,
          preferredMoveDate: formData.preferredMoveDate,
          currentAddress: formData.currentAddress,
          destinationAddress: formData.destinationAddress,
          additionalNotes: formData.additionalNotes,
          hasElevator: formData.hasElevator,
          floor: formData.floor,
          parkingAvailable: formData.parkingAvailable,
        },
        inventory,
        status: 'pending',
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
