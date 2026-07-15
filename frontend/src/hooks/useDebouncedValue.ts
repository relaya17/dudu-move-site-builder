import { useEffect, useState } from 'react';

/** מחזיר ערך מעוכב - לחיפוש בטורבו (פחות בקשות לשרת). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        if (delayMs <= 0) {
            setDebounced(value);
            return;
        }
        const timer = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
