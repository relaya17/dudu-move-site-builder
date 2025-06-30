export interface FurnitureItem {
    id: string;
    type: string;
    quantity: number;
    needsDisassembly: boolean;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
}

export interface MoveDetails {
    moveType: string;
    moveDate: string;
    fromAddress: string;
    toAddress: string;
    details: string;
}

export type QuoteStatus = 'pending' | 'processed' | 'sent';

export interface QuoteRequest {
    id: string; // לדוגמה: "quote_12"
    timestamp: string;
    customerInfo: CustomerInfo;
    moveDetails: MoveDetails;
    furnitureInventory: FurnitureItem[];
    status: QuoteStatus;
}
