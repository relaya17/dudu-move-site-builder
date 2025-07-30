export interface CreateCustomerRequest {
    name: string;
    email: string;
    phone: string;
}

export interface MoveType {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    created_at: Date;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    created_at: Date;
}

export interface Move {
    id: string;
    customer_id: string;
    move_type: string;
    origin_address: string;
    destination_address: string;
    date: string;
    origin_floor: number;
    destination_floor: number;
    origin_has_elevator: boolean;
    destination_has_elevator: boolean;
    comments?: string;
    items?: ItemInMove[];
    status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
    created_at: Date;
    updated_at?: Date;
}

export interface ItemInMove {
    name: string;
    quantity: number;
    isFragile?: boolean;
    needsDisassemble?: boolean;
    needsReassemble?: boolean;
    comments?: string;
    addedPrice?: number;
}

export interface CreateMoveRequest {
    customer_id?: string;
    customer?: CreateCustomerRequest;
    move_type_id: string;
    origin_address: string;
    destination_address: string;
    date: string;
    origin_floor: number;
    destination_floor: number;
    origin_has_elevator: boolean;
    destination_has_elevator: boolean;
    comments?: string;
    items?: ItemInMove[];
}

export interface MoveWithDetails extends Move {
    customer: Customer;
}

export interface MoveItem {
    id: number;
    name: string;
    added_price: number;
    created_at?: Date;
}