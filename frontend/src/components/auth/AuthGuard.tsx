import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

/**
 * מגן על נתיבים שדורשים JWT (חשבון עסק ב-Movalo).
 * שונה מ-AdminGuard שמגן על /admin הישן (מפתח x-admin-key).
 */
export function AuthGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
}
