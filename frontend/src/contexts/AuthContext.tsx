import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

export interface BusinessInfo {
    id: string;
    businessName: string;
    slug: string;
    subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled';
    ownerEmail?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
    role: string | null;
    business: BusinessInfo | null;
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    refreshMe: () => Promise<void>;
}

export interface RegisterData {
    businessName: string;
    ownerName: string;
    email: string;
    password: string;
}

const TOKEN_KEY = 'movalo_token';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        token: null,
        role: null,
        business: null
    });

    const apiFetch = useCallback(async (path: string, options?: RequestInit) => {
        const res = await fetch(`${API_ROOT}${path}`, {
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            ...options
        });
        const json = await res.json();
        return { ok: res.ok, status: res.status, data: json };
    }, []);

    const refreshMe = useCallback(async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            setState(s => ({ ...s, isLoading: false }));
            return;
        }
        try {
            const { ok, data } = await apiFetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (ok && data.success) {
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    token,
                    role: 'owner',
                    business: data.business
                });
            } else {
                localStorage.removeItem(TOKEN_KEY);
                setState({ isAuthenticated: false, isLoading: false, token: null, role: null, business: null });
            }
        } catch {
            setState(s => ({ ...s, isLoading: false }));
        }
    }, [apiFetch]);

    useEffect(() => {
        refreshMe();
    }, [refreshMe]);

    const login = useCallback(async (email: string, password: string) => {
        const { ok, data } = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (ok && data.success) {
            localStorage.setItem(TOKEN_KEY, data.token);
            setState({
                isAuthenticated: true,
                isLoading: false,
                token: data.token,
                role: data.role || 'owner',
                business: data.business
            });
            return { success: true };
        }
        return { success: false, message: data.message || 'שגיאה בהתחברות' };
    }, [apiFetch]);

    const register = useCallback(async (payload: RegisterData) => {
        const { ok, data } = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (ok && data.success) {
            localStorage.setItem(TOKEN_KEY, data.token);
            setState({
                isAuthenticated: true,
                isLoading: false,
                token: data.token,
                role: 'owner',
                business: data.business
            });
            return { success: true };
        }
        return { success: false, message: data.message || 'שגיאה בהרשמה' };
    }, [apiFetch]);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ isAuthenticated: false, isLoading: false, token: null, role: null, business: null });
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, refreshMe }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
