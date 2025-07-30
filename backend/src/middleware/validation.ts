import { z } from 'zod';

// סכמת ולידציה לפרטי לקוח
export const customerSchema = z.object({
    name: z.string()
        .min(2, 'שם חייב להכיל לפחות 2 תווים')
        .max(50, 'שם ארוך מדי'),
    email: z.string()
        .email('כתובת אימייל לא תקינה'),
    phone: z.string()
        .regex(/^05\d{8}$/, 'מספר טלפון לא תקין - חייב להתחיל ב-05 ולהכיל 10 ספרות')
});

// סכמת ולידציה לפרטי מעבר
export const moveDetailsSchema = z.object({
    apartment_type: z.enum([
        'דירת סטודיו',
        'דירת 1 חדר',
        'דירת 2 חדרים',
        'דירת 3 חדרים',
        'דירת 4 חדרים',
        'דירת 5+ חדרים',
        'בית פרטי',
        'משרד קטן',
        'משרד גדול'
    ], {
        errorMap: () => ({ message: 'יש לבחור סוג דירה מהרשימה' })
    }),
    preferred_move_date: z.string()
        .refine(date => new Date(date) > new Date(), 'תאריך המעבר חייב להיות בעתיד'),
    current_address: z.string()
        .min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
    destination_address: z.string()
        .min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
    additional_notes: z.string().optional()
});

// סכמת ולידציה לפריט ריהוט
export const furnitureItemSchema = z.object({
    name: z.string().min(2, 'שם הפריט חייב להכיל לפחות 2 תווים'),
    quantity: z.number()
        .min(1, 'כמות חייבת להיות לפחות 1')
        .max(50, 'כמות גדולה מדי'),
    isFragile: z.boolean().optional(),
    needsDisassemble: z.boolean().optional(),
    needsReassemble: z.boolean().optional(),
    comments: z.string().optional()
});