import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

/**
 * Hook נוח לקריאות API של הטנאנט — מוסיף Authorization header אוטומטית.
 * כל הנתיבים ב-/api/tenant/* מוגנים ב-requireBusinessAuth ומסוננים לפי tenantId.
 */
export function useTenantApi() {
    const { token } = useAuth();

    const call = useCallback(async <T = unknown>(
        path: string,
        options?: RequestInit
    ): Promise<{ ok: boolean; data: T }> => {
        const res = await fetch(`${API_ROOT}/api/tenant${path}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options?.headers
            },
            ...options
        });
        const data = await res.json() as T;
        return { ok: res.ok, data };
    }, [token]);

    return { call };
}
