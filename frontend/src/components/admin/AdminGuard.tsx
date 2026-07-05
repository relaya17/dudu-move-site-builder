import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ADMIN_API_KEY } from '@/lib/adminApi';

// אותו מפתח משמש הן כסיסמת כניסה למסך הניהול והן ככותרת האימות שנשלחת ל-API (ראה adminApi.ts).
const ADMIN_PASSWORD = ADMIN_API_KEY || 'admin123';
const SESSION_KEY = 'admin_authenticated';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const [authenticated, setAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('סיסמה שגויה');
      setPassword('');
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">כניסה לניהול</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                סיסמה
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
            <Button type="submit" className="w-full">
              כניסה
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
