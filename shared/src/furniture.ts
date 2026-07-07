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
    /** הסרת דלתות בלבד (ללא פירוק מלא) - שירות נפרד וזול יותר, בעיקר לארונות. */
    needsDoorRemoval?: boolean;
    comments?: string;
}
