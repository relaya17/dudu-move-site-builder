export interface Customer {
    id?: number;
    phone: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export interface MoveItem {
    id?: number;
    name: string;
    added_price: number;
    created_at?: string;
    updated_at?: string;
}

export interface MoveType {
    id?: number;
    name: string;
    added_price: number;
    created_at?: string;
    updated_at?: string;
}

export interface Move {
    id?: number;
    customer_id: number;
    move_type_id: number;
    origin_address: string;
    destination_address: string;
    date: string; // YYYY-MM-DD format
    origin_floor: number;
    destination_floor: number;
    origin_has_elevator: boolean;
    destination_has_elevator: boolean;
    comments?: string;
    created_at?: string;
    updated_at?: string;

    // Populated from joins
    customer?: Customer;
    move_type?: MoveType;
    items?: ItemInMove[];
}

export interface ItemInMove {
    id?: number;
    move_id: number;
    move_item_id: number;
    isFragile: boolean;
    needsDisassemble: boolean;
    needsReassemble: boolean;
    comments?: string;
    addedPrice: number;
    created_at?: string;
    updated_at?: string;

    // Populated from joins
    move_item?: MoveItem;
}

// Request/Response DTOs
export interface CreateCustomerRequest {
    phone: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface CreateMoveRequest {
    customer_id?: number; // If not provided, customer will be created
    customer?: CreateCustomerRequest; // Customer data if creating new customer
    move_type_id: number;
    origin_address: string;
    destination_address: string;
    date: string;
    origin_floor: number;
    destination_floor: number;
    origin_has_elevator: boolean;
    destination_has_elevator: boolean;
    comments?: string;
    items: CreateItemInMoveRequest[];
}

export interface CreateItemInMoveRequest {
    move_item_id: number;
    isFragile: boolean;
    needsDisassemble: boolean;
    needsReassemble: boolean;
    comments?: string;
    addedPrice?: number;
}

export interface MoveWithDetails extends Move {
    customer: Customer;
    move_type: MoveType;
    items: (ItemInMove & { move_item: MoveItem })[];
    total_price: number;
}

export interface MovePriceCalculation {
    base_price: number; // from move_type
    items_price: number; // sum of item prices + addedPrice
    total_price: number;
    breakdown: {
        move_type: string;
        move_type_price: number;
        items: Array<{
            name: string;
            base_price: number;
            added_price: number;
            total_price: number;
        }>;
    };
} 