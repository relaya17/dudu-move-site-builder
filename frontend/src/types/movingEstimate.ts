export interface FurnitureItem {
  type: string;
  quantity: number;
  description?: string;
  isFragile?: boolean;
  needsDisassemble?: boolean;
  needsReassemble?: boolean;
  comments?: string;
}

export interface MovingEstimateRequest {
  id: string;
  timestamp: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  apartmentDetails: {
    apartmentType: string; // e.g., "2 rooms", "3 rooms", etc.
    preferredMoveDate: string;
    currentAddress: string;
    destinationAddress: string;
    additionalNotes: string;
    hasElevator?: boolean;
    floor?: number;
    parkingAvailable?: boolean;
  };
  inventory: FurnitureItem[];
  status: EstimateStatus;
}

export type EstimateStatus = 'pending' | 'estimated' | 'accepted' | 'rejected';
