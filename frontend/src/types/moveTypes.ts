export interface Move {
    id: string;
    customer?: {
        name: string;
        phone: string;
        email?: string;
    };
    customer_id?: string;
    preferred_move_date?: string;
    created_at?: Date | string;
    status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
    price_estimate?: {
        totalPrice: number;
    };
    furniture_items?: Array<{
        name: string;
        quantity: number;
        isFragile?: boolean;
        needsDisassemble?: boolean;
        needsReassemble?: boolean;
    }>;
    current_address?: string;
    destination_address?: string;
    origin_floor?: number;
    destination_floor?: number;
    origin_has_elevator?: boolean;
    destination_has_elevator?: boolean;
    additional_notes?: string;
    apartment_type?: string;
}