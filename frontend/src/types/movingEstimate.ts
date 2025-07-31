export interface FurnitureItem {
  id?: number; // Added for frontend mapping consistency
  type: string;
  quantity: number;
  description?: string;
  fragile?: boolean; // Changed from isFragile
  disassemble?: boolean; // Changed from needsDisassemble
  assemble?: boolean; // Changed from needsReassemble
  note?: string; // Changed from comments
  img?: File | null; // New field for image
}

export interface MovingEstimateRequest {
  id?: string; // Optional for new requests
  timestamp?: string; // Optional for new requests
  customerInfo: {
    fullName: string; // Changed from name
    email: string;
    phone: string;
  };
  apartmentDetails: {
    apartmentType: string;
    rooms: string; // New field
    moveDate: string; // Changed from preferredMoveDate
    fromAddress: string; // Changed from currentAddress
    toAddress: string; // Changed from destinationAddress
    notes: string; // Changed from additionalNotes
    fromFloor?: number; // Changed from originFloor
    fromElevator?: boolean; // Changed from originHasElevator
    fromLift?: boolean; // Changed from originHasCrane
    toFloor?: number; // Changed from destinationFloor
    toElevator?: boolean; // Changed from destinationHasElevator
    toLift?: boolean; // Changed from destinationHasCrane
  };
  inventory: FurnitureItem[]; // Using the updated FurnitureItem
  status: EstimateStatus;
}

export type EstimateStatus = 'pending' | 'estimated' | 'accepted' | 'rejected';
