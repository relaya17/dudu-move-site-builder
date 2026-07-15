/**
 * Turbo Mode (Ultimate Performance) - הקשר משותף לדשבורד הטנאנט.
 * נטען מ-GET /settings ומתעדכן אחרי שמירה בהגדרות.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { DEFAULT_TURBO_SETTINGS, type TurboSettings } from 'shared';
import { useTenantApi } from '@/hooks/useTenantApi';

interface TurboModeContextValue {
    turbo: TurboSettings;
    loading: boolean;
    /** האם האופטימיזציה הספציפית פעילה (turboMode && דגל משני). */
    isActive: (flag: keyof Omit<TurboSettings, 'turboMode'>) => boolean;
    refresh: () => Promise<void>;
    setTurboLocal: (next: TurboSettings) => void;
}

const TurboModeContext = createContext<TurboModeContextValue | null>(null);

export function TurboModeProvider({ children }: { children: ReactNode }) {
    const { call } = useTenantApi();
    const [turbo, setTurbo] = useState<TurboSettings>(DEFAULT_TURBO_SETTINGS);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const r = await call<{ success: boolean; data: { turbo?: TurboSettings } }>('/settings');
            if (r.ok && r.data.data?.turbo) {
                setTurbo({ ...DEFAULT_TURBO_SETTINGS, ...r.data.data.turbo });
            }
        } finally {
            setLoading(false);
        }
    }, [call]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const isActive = useCallback(
        (flag: keyof Omit<TurboSettings, 'turboMode'>) => turbo.turboMode && turbo[flag],
        [turbo]
    );

    const value = useMemo(
        () => ({
            turbo,
            loading,
            isActive,
            refresh,
            setTurboLocal: setTurbo,
        }),
        [turbo, loading, isActive, refresh]
    );

    return <TurboModeContext.Provider value={value}>{children}</TurboModeContext.Provider>;
}

export function useTurboMode(): TurboModeContextValue {
    const ctx = useContext(TurboModeContext);
    if (!ctx) {
        // Fallback בטוח מחוץ ל-provider (למשל בדיקות) - הכל כבוי.
        return {
            turbo: DEFAULT_TURBO_SETTINGS,
            loading: false,
            isActive: () => false,
            refresh: async () => {},
            setTurboLocal: () => {},
        };
    }
    return ctx;
}
