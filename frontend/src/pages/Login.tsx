import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string })?.from || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await login(email, password);
        setLoading(false);
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message || 'שגיאה בהתחברות');
        }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Truck className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-900">Movalo</span>
                    </div>
                    <p className="text-gray-500 text-sm">פלטפורמת ניהול לחברות הובלות</p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl text-center">התחברות</CardTitle>
                        <CardDescription className="text-center">הכנס לחשבון העסק שלך</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-1">
                                <Label htmlFor="email">אימייל</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    required
                                    autoComplete="email"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password">סיסמה</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(''); }}
                                        required
                                        autoComplete="current-password"
                                        dir="ltr"
                                        className="pl-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-base font-semibold"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        מתחבר...
                                    </span>
                                ) : 'התחבר'}
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                אין לך חשבון עדיין?{' '}
                                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                                    הרשם בחינם
                                </Link>
                            </p>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs text-gray-400">
                                    <span className="bg-white px-2">או</span>
                                </div>
                            </div>

                            <p className="text-center text-xs text-gray-500">
                                כניסה לניהול ישן (מפתח מנהל)?{' '}
                                <Link to="/admin" className="text-gray-600 hover:underline">
                                    לחץ כאן
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
