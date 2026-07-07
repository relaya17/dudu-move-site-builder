import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { usePageMeta, SITE_ORIGIN } from '@/hooks/usePageMeta';

const BENEFITS = [
    'אתר ניהול מלא לחברת ההובלות שלך',
    'ניהול לקוחות, הזמנות והצעות מחיר',
    'חשבוניות וקבלות — הכל במקום אחד',
    '14 ימי ניסיון ללא כרטיס אשראי',
];

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    // דף הרשמה כן שווה לאנדקס (זו דף המרה - "הרשמה למובילים" יכול להגיע מחיפוש).
    usePageMeta({
        title: 'הרשמה למובילים | Movalo',
        description: 'הרשמה לפלטפורמת Movalo - אתר, ניהול לקוחות, הצעות מחיר וחשבוניות לחברת ההובלות שלך. 14 יום ניסיון ללא כרטיס אשראי.',
        canonical: `${SITE_ORIGIN}/register`,
    });

    const [form, setForm] = useState({
        businessName: '',
        ownerName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }
        setLoading(true);
        setError('');
        const result = await register({
            businessName: form.businessName,
            ownerName: form.ownerName,
            email: form.email,
            password: form.password
        });
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message || 'שגיאה בהרשמה');
        }
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">

                {/* צד שמאל — יתרונות */}
                <div className="hidden md:block space-y-6">
                    <div className="flex items-center gap-3">
                        <Truck className="h-10 w-10 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Movalo</h1>
                    </div>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        הפלטפורמה המקצועית לניהול חברות הובלות בישראל
                    </p>
                    <ul className="space-y-3">
                        {BENEFITS.map((b, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* כרטיס הרשמה */}
                <Card className="shadow-xl border-0">
                    <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-center gap-2 mb-2 md:hidden">
                            <Truck className="h-7 w-7 text-blue-600" />
                            <span className="text-xl font-bold">Movalo</span>
                        </div>
                        <CardTitle className="text-2xl">הרשמה חינמית</CardTitle>
                        <CardDescription>צור את חשבון העסק שלך תוך דקות</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-1">
                                <Label htmlFor="businessName">שם העסק</Label>
                                <Input
                                    id="businessName"
                                    placeholder="לדוגמה: כהן הובלות"
                                    value={form.businessName}
                                    onChange={handleChange('businessName')}
                                    required
                                    autoComplete="organization"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="ownerName">שם מלא</Label>
                                <Input
                                    id="ownerName"
                                    placeholder="שמך המלא"
                                    value={form.ownerName}
                                    onChange={handleChange('ownerName')}
                                    required
                                    autoComplete="name"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="email">אימייל</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={handleChange('email')}
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
                                        placeholder="לפחות 8 תווים"
                                        value={form.password}
                                        onChange={handleChange('password')}
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
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

                            <div className="space-y-1">
                                <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="הקלד שוב את הסיסמה"
                                    value={form.confirmPassword}
                                    onChange={handleChange('confirmPassword')}
                                    required
                                    autoComplete="new-password"
                                    dir="ltr"
                                />
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
                                        יוצר חשבון...
                                    </span>
                                ) : 'צור חשבון חינם'}
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                כבר יש לך חשבון?{' '}
                                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                                    התחבר כאן
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
