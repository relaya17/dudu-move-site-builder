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
      originHasCrane: boolean;
      destinationHasCrane: boolean;
    },
    inventory: FurnitureItem[]
  ): Promise<MovingEstimateRequest> {
    const requestData = {
      customerData: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.startsWith('05') ? formData.phone : `05${formData.phone}`,
      },
      moveData: {
        apartment_type: formData.apartmentType || '',
        preferred_move_date: formData.preferredMoveDate,
        current_address: formData.currentAddress,
        destination_address: formData.destinationAddress,
        additional_notes: formData.additionalNotes,
        origin_floor: formData.originFloor,
        destination_floor: formData.destinationFloor,
        origin_has_elevator: formData.originHasElevator,
        destination_has_elevator: formData.destinationHasElevator,
        origin_has_crane: formData.originHasCrane,
        destination_has_crane: formData.destinationHasCrane,
      },
      furnitureItems: inventory.map(item => ({
        name: item.type,
        quantity: item.quantity,
        description: item.description,
        isFragile: item.type === 'tv' || item.type === 'computer' || item.type === 'refrigerator' || item.type === 'washing_machine' || item.type === 'dishwasher' || item.type === 'microwave' || item.type === 'toaster' || item.type === 'coffee_machine' || item.type === 'mirror' || item.type === 'lamp' || item.type === 'mattress',
        needsDisassemble: item.type === 'bed' || item.type === 'table' || item.type === 'desk' || item.type === 'dining_table' || item.type === 'sofa' || item.type === 'wardrobe' || item.type === 'cabinet' || item.type === 'bookshelf' || item.type === 'bed_single' || item.type === 'bed_double' || item.type === 'dining_corner_small' || item.type === 'dining_corner_medium' || item.type === 'dining_corner_large',
        needsReassemble: item.type === 'bed' || item.type === 'table' || item.type === 'desk' || item.type === 'dining_table' || item.type === 'sofa' || item.type === 'wardrobe' || item.type === 'cabinet' || item.type === 'bookshelf' || item.type === 'bed_single' || item.type === 'bed_double' || item.type === 'dining_corner_small' || item.type === 'dining_corner_medium' || item.type === 'dining_corner_large',
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
