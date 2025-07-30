export interface Move {
    id: string;
    customer: {
        name: string;
        phone: string;
        email: string;
    };
    date: string;
    status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
    price_estimate: {
        totalPrice: number;
        basePrice: number;
        additionalFee: number;
    };
    created_at: Date;
    furniture_items: Array<{
        name: string;
        quantity: number;
        isFragile: boolean;
        needsDisassemble: boolean;
        needsReassemble: boolean;
    }>;
    origin_address: string;
    destination_address: string;
    origin_floor: number;
    destination_floor: number;
    origin_has_elevator: boolean;
    destination_has_elevator: boolean;
    additional_notes?: string;
}