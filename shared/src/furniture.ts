/**
 * פריט ריהוט/ציוד בהזמנת הובלה.
 */
export interface FurnitureItem {
    type: string;
    quantity: number;
    description?: string;
    isFragile?: boolean;
    needsDisassemble?: boolean;
    needsReassemble?: boolean;
    comments?: string;
}
