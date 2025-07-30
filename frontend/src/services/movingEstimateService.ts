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
      originFloor: number;
      destinationFloor: number;
      originHasElevator: boolean;
      destinationHasElevator: boolean;
    },
    inventory: FurnitureItem[]
  ): Promise<MovingEstimateRequest> {
    // Split name into first and last name
    const nameParts = formData.name.split(' ');
    const firstName = nameParts[0] || formData.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    const requestData = {
      customerData: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
      moveData: {
        apartment_type: formData.apartmentType,
        preferred_move_date: formData.preferredMoveDate,
        current_address: formData.currentAddress,
        destination_address: formData.destinationAddress,
        additional_notes: formData.additionalNotes,
        origin_floor: formData.originFloor,
        destination_floor: formData.destinationFloor,
        origin_has_elevator: formData.originHasElevator,
        destination_has_elevator: formData.destinationHasElevator,
      },
      furnitureItems: inventory.map(item => ({
        name: item.type,
        quantity: item.quantity,
        description: item.description,
        isFragile: item.type === 'tv' || item.type === 'computer',
        needsDisassemble: item.type === 'bed' || item.type === 'table',
        needsReassemble: item.type === 'bed' || item.type === 'table',
        comments: item.description
      }))
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
