import { z } from 'zod';

// סכמת ולידציה לפרטי לקוח
export const customerSchema = z.object({
    name: z.string()
        .min(2, 'שם חייב להכיל לפחות 2 תווים')
        .max(50, 'שם ארוך מדי'),
    email: z.string()
        .email('כתובת אימייל לא תקינה')
        .optional(),
    phone: z.string()
        .regex(/^05\d{8}$/, 'מספר טלפון לא תקין - חייב להתחיל ב-05 ולהכיל 10 ספרות')
});

// סכמת ולידציה לפרטי מעבר
export const moveDetailsSchema = z.object({
    apartment_type: z.enum([
        '1.5',
        '2',
        '2.5',
        '3',
        '3.5',
        '4',
        '4.5',
        '5+'
    ], {
        errorMap: () => ({ message: 'יש לבחור סוג דירה מהרשימה' })
    }),
    preferred_move_date: z.string()
        .optional(),
    current_address: z.string()
        .min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
    destination_address: z.string()
        .min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
    additional_notes: z.string().optional(),
    origin_floor: z.number()
        .min(0, 'קומה לא יכולה להיות שלילית')
        .max(100, 'קומה לא יכולה להיות מעל 100'),
    destination_floor: z.number()
        .min(0, 'קומה לא יכולה להיות שלילית')
        .max(100, 'קומה לא יכולה להיות מעל 100'),
    origin_has_elevator: z.boolean().default(false),
    destination_has_elevator: z.boolean().default(false),
    origin_has_crane: z.boolean().default(false),
    destination_has_crane: z.boolean().default(false)
});

// סכמת ולידציה לפריט ריהוט
export const furnitureItemSchema = z.object({
    name: z.string().min(2, 'שם הפריט חייב להכיל לפחות 2 תווים'),
    quantity: z.number()
        .min(1, 'כמות חייבת להיות לפחות 1')
        .max(50, 'כמות גדולה מדי'),
    description: z.string().optional(),
    isFragile: z.boolean().optional(),
    needsDisassemble: z.boolean().optional(),
    needsReassemble: z.boolean().optional(),
    comments: z.string().optional()
});

// סכמת ולידציה לבקשת הערכת מחיר מלאה
export const estimateRequestSchema = z.object({
    customerData: customerSchema,
    moveData: moveDetailsSchema,
    furnitureItems: z.array(furnitureItemSchema)
        .min(1, 'חובה לכלול לפחות פריט אחד')
        .max(50, 'יותר מדי פריטים')
});