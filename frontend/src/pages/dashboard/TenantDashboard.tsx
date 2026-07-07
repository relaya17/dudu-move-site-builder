import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantApi } from '@/hooks/useTenantApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Truck, LayoutDashboard, Users, Settings, LogOut,
    Menu, X, ClipboardList, TrendingUp, DollarSign,
    Search, ChevronRight, Loader2, Bell, UserCheck,
    Phone, Mail, MapPin, Calendar, RefreshCw
} from 'lucide-react';

// ─── טיפוסים ──────────────────────────────────────────────────────────────────

interface Analytics {
    totalEstimates: number;
    totalCustomers: number;
    totalRevenue: number;
    estimatesByStatus: Array<{ _id: string; count: number }>;
}

interface Estimate {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    stage: string;
    totalPrice: number;
    preferredMoveDate: string;
    currentAddress: string;
    destinationAddress: string;
    createdAt: string;
}

interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    totalMoves: number;
    totalSpent: number;
    lastMoveDate?: string;
    createdAt: string;
}

interface BusinessSettings {
    businessName: string;
    businessId: string;
    businessType: string;
    address: string;
    phone: string;
    email: string;
    vatRate: number;
    invoiceProvider: string;
    greenInvoiceConfigured: boolean;
}

interface Employee {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

// ─── קבועים ───────────────────────────────────────────────────────────────────

const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

const STATUS_LABELS: Record<string, string> = {
    pending: 'ממתין',
    quoted: 'הוצעה מחיר',
    confirmed: 'מאושר',
    in_progress: 'בביצוע',
    completed: 'הושלם',
    cancelled: 'בוטל'
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
};

const NAV = [
    { to: '/dashboard', label: 'סקירה', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/dashboard/estimates', label: 'הזמנות', icon: <ClipboardList className="h-4 w-4" /> },
    { to: '/dashboard/customers', label: 'לקוחות', icon: <UserCheck className="h-4 w-4" /> },
    { to: '/dashboard/team', label: 'צוות', icon: <Users className="h-4 w-4" /> },
    { to: '/dashboard/settings', label: 'הגדרות', icon: <Settings className="h-4 w-4" /> },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
    const { business, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <aside className="flex flex-col h-full bg-gray-900 text-white w-60 p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-8 px-1">
                <Truck className="h-6 w-6 text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight truncate">{business?.businessName || 'Movalo'}</p>
                    <p className="text-xs text-gray-400">
                        {business?.subscriptionStatus === 'trial' ? '⏳ ניסיון חינמי' : '✅ מנוי פעיל'}
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="mr-auto text-gray-400 hover:text-white flex-shrink-0">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-0.5">
                {NAV.map(n => (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        {n.icon}
                        {n.label}
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mt-4"
            >
                <LogOut className="h-4 w-4" />
                יציאה
            </button>
        </aside>
    );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview() {
    const { business } = useAuth();
    const { call } = useTenantApi();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        call<{ success: boolean; data: Analytics }>('/analytics')
            .then(r => { if (r.ok) setAnalytics(r.data.data); })
            .finally(() => setLoading(false));
    }, [call]);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);

    return (
        <div dir="rtl" className="p-6 max-w-5xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                ברוך הבא{business?.businessName ? `, ${business.businessName}` : ''}!
            </h1>
            <p className="text-gray-500 mb-6 text-sm">סקירת פעילות העסק שלך</p>

            {business?.subscriptionStatus === 'trial' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-blue-800">אתה בתקופת ניסיון חינמית של 14 יום</p>
                        <p className="text-sm text-blue-600 mt-0.5">כל התכונות פתוחות. לשדרוג עבור להגדרות.</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : analytics ? (
                <>
                    {/* כרטיסי סטטיסטיקה */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <StatCard icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
                            label="סה״כ הזמנות" value={analytics.totalEstimates.toString()} bg="bg-blue-50" />
                        <StatCard icon={<Users className="h-5 w-5 text-green-600" />}
                            label="לקוחות" value={analytics.totalCustomers.toString()} bg="bg-green-50" />
                        <StatCard icon={<DollarSign className="h-5 w-5 text-purple-600" />}
                            label="הכנסה כוללת" value={analytics.totalRevenue ? formatCurrency(analytics.totalRevenue) : '—'} bg="bg-purple-50" />
                    </div>

                    {/* סטטוסים */}
                    {analytics.estimatesByStatus.length > 0 && (
                        <div className="bg-white rounded-xl border shadow-sm p-5">
                            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-gray-500" />
                                הזמנות לפי סטטוס
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {analytics.estimatesByStatus.map(s => (
                                    <span key={s._id}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[s._id] || 'bg-gray-100 text-gray-700'}`}>
                                        {STATUS_LABELS[s._id] || s._id} · {s.count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-xl border shadow-sm p-6">
                    <h2 className="font-semibold text-gray-800 mb-3">מה הלאה?</h2>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4 text-blue-400" />הגדר פרטי העסק בלשונית <strong>הגדרות</strong></li>
                        <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4 text-blue-400" />הוסף עובדים ונהגים בלשונית <strong>צוות</strong></li>
                        <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4 text-blue-400" />כאשר לקוחות שולחים הזמנות — הן יופיעו כאן</li>
                    </ul>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
    return (
        <div className={`rounded-xl border p-5 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-gray-600">{label}</span></div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    );
}

// ─── Estimates ────────────────────────────────────────────────────────────────

function EstimatesPage() {
    const { call } = useTenantApi();
    const [estimates, setEstimates] = useState<Estimate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState<Estimate | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const path = search.trim()
                ? `/search/estimates?query=${encodeURIComponent(search.trim())}`
                : statusFilter
                    ? `/estimates?status=${statusFilter}&limit=100`
                    : '/estimates?limit=100';
            const r = await call<{ success: boolean; data: Estimate[] }>(path);
            if (r.ok) setEstimates(r.data.data || []);
        } finally {
            setLoading(false);
        }
    }, [call, search, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('he-IL') : '—';
    const formatCurrency = (n: number) => n ? `₪${n.toLocaleString('he-IL')}` : '—';

    if (selected) {
        return (
            <div dir="rtl" className="p-6 max-w-3xl">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline mb-4">
                    ← חזרה לרשימה
                </button>
                <EstimateDetail estimate={selected} onClose={() => { setSelected(null); load(); }} />
            </div>
        );
    }

    return (
        <div dir="rtl" className="p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold text-gray-900">הזמנות</h1>
                <button onClick={load} className="text-gray-400 hover:text-gray-600" title="רענן">
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>

            {/* פילטרים */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="חפש לפי שם, טלפון, כתובת..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pr-9"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 w-full sm:w-40"
                >
                    <option value="">כל הסטטוסים</option>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>
            ) : estimates.length === 0 ? (
                <EmptyState icon={<ClipboardList />} text="אין הזמנות עדיין" />
            ) : (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden md:table-cell">תאריך הובלה</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">מחיר</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {estimates.map(e => (
                                <tr key={e._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(e)}>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{e.name}</p>
                                        <p className="text-xs text-gray-400" dir="ltr">{e.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatDate(e.preferredMoveDate)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">{formatCurrency(e.totalPrice)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_LABELS[e.status] || e.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        <ChevronRight className="h-4 w-4" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 text-xs text-gray-400 border-t">{estimates.length} הזמנות</div>
                </div>
            )}
        </div>
    );
}

function EstimateDetail({ estimate, onClose }: { estimate: Estimate; onClose: () => void }) {
    const { call } = useTenantApi();
    const [newStatus, setNewStatus] = useState(estimate.status);
    const [saving, setSaving] = useState(false);

    const saveStatus = async () => {
        setSaving(true);
        await call(`/estimates/${estimate._id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        setSaving(false);
        onClose();
    };

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('he-IL') : '—';

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{estimate.name}</h2>
                    <p className="text-sm text-gray-500">נשלח ב-{formatDate(estimate.createdAt)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[estimate.status] || 'bg-gray-100'}`}>
                    {STATUS_LABELS[estimate.status] || estimate.status}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <InfoRow icon={<Phone className="h-4 w-4" />} label="טלפון" value={estimate.phone} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="אימייל" value={estimate.email} />
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="תאריך הובלה" value={formatDate(estimate.preferredMoveDate)} />
                <InfoRow icon={<DollarSign className="h-4 w-4" />} label="מחיר" value={estimate.totalPrice ? `₪${estimate.totalPrice.toLocaleString('he-IL')}` : '—'} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="מוצא" value={estimate.currentAddress} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="יעד" value={estimate.destinationAddress} />
            </div>

            <div className="border-t pt-4">
                <Label className="mb-2 block">עדכן סטטוס</Label>
                <div className="flex gap-3">
                    <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white flex-1"
                    >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <Button onClick={saveStatus} disabled={saving || newStatus === estimate.status} className="bg-blue-600 hover:bg-blue-700">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'שמור'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2 text-gray-700">
            <span className="mt-0.5 text-gray-400 flex-shrink-0">{icon}</span>
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p>{value || '—'}</p>
            </div>
        </div>
    );
}

// ─── Customers ────────────────────────────────────────────────────────────────

function CustomersPage() {
    const { call } = useTenantApi();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const path = search.trim()
                ? `/search/customers?query=${encodeURIComponent(search.trim())}`
                : '/customers?limit=200';
            const r = await call<{ success: boolean; data: Customer[] }>(path);
            if (r.ok) setCustomers(r.data.data || []);
        } finally {
            setLoading(false);
        }
    }, [call, search]);

    useEffect(() => { load(); }, [load]);

    return (
        <div dir="rtl" className="p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl font-bold text-gray-900">לקוחות</h1>
                <button onClick={load} className="text-gray-400 hover:text-gray-600" title="רענן">
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="חפש לפי שם, אימייל, טלפון..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pr-9"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>
            ) : customers.length === 0 ? (
                <EmptyState icon={<Users />} text="אין לקוחות עדיין" />
            ) : (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">הובלות</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden md:table-cell">סה״כ הוציא</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {customers.map(c => (
                                <tr key={c._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{c.name}</p>
                                        <p className="text-xs text-gray-400" dir="ltr">{c.email || c.phone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.totalMoves ?? 0}</td>
                                    <td className="px-4 py-3 text-gray-700 font-medium hidden md:table-cell">
                                        {c.totalSpent ? `₪${c.totalSpent.toLocaleString('he-IL')}` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 text-xs text-gray-400 border-t">{customers.length} לקוחות</div>
                </div>
            )}
        </div>
    );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsPage() {
    const { call } = useTenantApi();
    const [form, setForm] = useState<Partial<BusinessSettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        call<{ success: boolean; data: BusinessSettings }>('/settings')
            .then(r => { if (r.ok) setForm(r.data.data); })
            .finally(() => setLoading(false));
    }, [call]);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        const r = await call('/settings', { method: 'PUT', body: JSON.stringify(form) });
        setSaving(false);
        setMsg(r.ok ? '✓ ההגדרות נשמרו בהצלחה' : '✗ שגיאה בשמירה');
    };

    const set = (key: keyof BusinessSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [key]: e.target.value }));

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

    return (
        <div dir="rtl" className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">הגדרות עסק</h1>

            <form onSubmit={handleSave} className="space-y-5">
                <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
                    <h2 className="font-semibold text-gray-800">פרטי העסק</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="שם העסק" value={form.businessName || ''} onChange={set('businessName')} />
                        <Field label='ח.פ / ע.מ' value={form.businessId || ''} onChange={set('businessId')} dir="ltr" />
                        <Field label="כתובת" value={form.address || ''} onChange={set('address')} />
                        <Field label="טלפון" value={form.phone || ''} onChange={set('phone')} dir="ltr" />
                        <Field label="אימייל" value={form.email || ''} onChange={set('email')} type="email" dir="ltr" />
                        <div className="space-y-1">
                            <Label>סוג עסק</Label>
                            <select value={form.businessType || 'exempt'} onChange={set('businessType')}
                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                                <option value="exempt">עוסק פטור</option>
                                <option value="licensed">עוסק מורשה</option>
                                <option value="company">חברה בע"מ</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
                    <h2 className="font-semibold text-gray-800">חשבוניות</h2>
                    <div className="space-y-1">
                        <Label>ספק חשבוניות</Label>
                        <select value={form.invoiceProvider || 'built_in'} onChange={set('invoiceProvider')}
                            className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                            <option value="built_in">מובנה (לעוסקים פטורים / מתחת לסף)</option>
                            <option value="green_invoice">חשבוניות ירוקות (Green Invoice)</option>
                        </select>
                    </div>
                    {form.invoiceProvider === 'green_invoice' && (
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                            {form.greenInvoiceConfigured
                                ? '✓ חשבוניות ירוקות מחוברות. ניתן לשנות מפתחות API בממשק הניהול הישן.'
                                : 'לחיבור חשבוניות ירוקות עבור לממשק הניהול הישן > הגדרות.'}
                        </div>
                    )}
                </div>

                {msg && (
                    <p className={`text-sm px-3 py-2 rounded-lg ${msg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg}
                    </p>
                )}

                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />שומר...</> : 'שמור הגדרות'}
                </Button>
            </form>
        </div>
    );
}

function Field({ label, value, onChange, dir, type }: {
    label: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dir?: string; type?: string;
}) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input value={value} onChange={onChange} dir={dir} type={type} />
        </div>
    );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamPage() {
    const { token } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newEmp, setNewEmp] = useState({ name: '', email: '', password: '', role: 'driver' });
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ROOT}/api/auth/employees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setEmployees(data.data);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async () => {
        if (!newEmp.name || !newEmp.email || !newEmp.password) {
            setAddError('יש למלא את כל השדות');
            return;
        }
        setAddLoading(true);
        setAddError('');
        const res = await fetch(`${API_ROOT}/api/auth/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newEmp)
        });
        const data = await res.json();
        setAddLoading(false);
        if (data.success) {
            setShowAdd(false);
            setNewEmp({ name: '', email: '', password: '', role: 'driver' });
            load();
        } else {
            setAddError(data.message || 'שגיאה');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('האם למחוק את העובד?')) return;
        await fetch(`${API_ROOT}/api/auth/employees/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        load();
    };

    const roleLabel = (r: string) => ({ owner: 'בעלים', manager: 'מנהל', driver: 'נהג' }[r] || r);

    return (
        <div dir="rtl" className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">ניהול צוות</h1>
                <Button onClick={() => setShowAdd(v => !v)} className="bg-blue-600 hover:bg-blue-700">
                    {showAdd ? 'ביטול' : '+ הוסף עובד'}
                </Button>
            </div>

            {showAdd && (
                <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 space-y-3">
                    <h2 className="font-semibold text-gray-800">עובד חדש</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input placeholder="שם מלא" value={newEmp.name}
                            onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))} />
                        <Input placeholder="אימייל" dir="ltr" value={newEmp.email}
                            onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))} />
                        <Input placeholder="סיסמה (לפחות 8 תווים)" type="password" dir="ltr"
                            value={newEmp.password} onChange={e => setNewEmp(p => ({ ...p, password: e.target.value }))} />
                        <select className="border rounded-lg px-3 py-2 text-sm bg-white" value={newEmp.role}
                            onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}>
                            <option value="driver">נהג</option>
                            <option value="manager">מנהל</option>
                        </select>
                    </div>
                    {addError && <p className="text-sm text-red-600">{addError}</p>}
                    <Button onClick={handleAdd} disabled={addLoading} className="bg-green-600 hover:bg-green-700">
                        {addLoading ? <><Loader2 className="h-4 w-4 animate-spin ml-1" />שומר...</> : 'הוסף'}
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-blue-500" /></div>
            ) : employees.length === 0 ? (
                <EmptyState icon={<Users />} text="אין עובדים עדיין" />
            ) : (
                <div className="space-y-3">
                    {employees.map(emp => (
                        <div key={emp._id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-800">{emp.name}</p>
                                <p className="text-sm text-gray-400" dir="ltr">{emp.email}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={emp.role === 'manager' ? 'default' : 'secondary'}>
                                    {roleLabel(emp.role)}
                                </Badge>
                                <button onClick={() => handleDelete(emp._id)}
                                    className="text-red-400 hover:text-red-600 text-xs">
                                    מחק
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="h-12 w-12 mb-3 opacity-25">{icon}</div>
            <p>{text}</p>
        </div>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TenantDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div dir="rtl" className="flex h-screen bg-gray-50">
            {/* Sidebar desktop */}
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Sidebar mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <Sidebar onClose={() => setSidebarOpen(false)} />
                    <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header mobile */}
                <header className="md:hidden flex items-center gap-3 bg-white border-b px-4 py-3">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500" aria-label="פתח תפריט">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-sm">Movalo</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    <Routes>
                        <Route index element={<Overview />} />
                        <Route path="estimates" element={<EstimatesPage />} />
                        <Route path="customers" element={<CustomersPage />} />
                        <Route path="team" element={<TeamPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
