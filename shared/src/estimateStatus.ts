/**
 * סטטוסים אפשריים של בקשת הערכת מחיר להובלה.
 * מקור אמת יחיד - נצרך הן ב-backend (ולידציה, מודל Mongoose) והן ב-frontend (טיפוסים, UI).
 */
export const ESTIMATE_STATUSES = ['pending', 'approved', 'rejected', 'completed'] as const;

export type EstimateStatus = typeof ESTIMATE_STATUSES[number];

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
    pending: 'ממתין',
    approved: 'אושר',
    rejected: 'נדחה',
    completed: 'הושלם'
};
