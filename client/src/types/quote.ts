export interface FurnitureItem {
  id: string;
  type: string;
  quantity: number;
  needsDisassembly: boolean;
}

export interface QuoteRequest {
  id: string;
  timestamp: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  moveDetails: {
    moveType: string;
    moveDate: string;
    fromAddress: string;
    toAddress: string;
    details: string;
  };
  furnitureInventory: FurnitureItem[];
  status: 'pending' | 'processed' | 'sent';
}
