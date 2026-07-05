/**
 * מעטפת תגובה אחידה לכל נתיבי ה-API בפרויקט.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    count?: number;
    error?: unknown;
}
