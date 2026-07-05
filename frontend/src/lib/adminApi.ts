// מפתח ניהול יחיד המשמש גם כסיסמת הכניסה למסך הניהול (AdminGuard) וגם
// ככותרת x-admin-key שנשלחת לנתיבי ה-API המוגנים בשרת (ראה backend/src/middleware/adminAuth.ts).
export const ADMIN_API_KEY: string = import.meta.env.VITE_ADMIN_API_KEY || '';

export function adminHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
        ...(extra || {}),
        ...(ADMIN_API_KEY ? { 'x-admin-key': ADMIN_API_KEY } : {})
    };
}
