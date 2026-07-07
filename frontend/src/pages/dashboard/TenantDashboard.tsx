import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Truck, LayoutDashboard, Users, Settings, LogOut,
    Menu, X, ClipboardList, Bell
} from 'lucide-react';

// --- ניווט צד ---
const NAV = [
    { to: '/dashboard', label: 'סקירה כללית', icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/dashboard/estimates', label: 'הזמנות', icon: <ClipboardList className="h-4 w-4" /> },
    { to: '/dashboard/customers', label: 'לקוחות', icon: <Users className="h-4 w-4" /> },
    { to: '/dashboard/team', label: 'צוות', icon: <Users className="h-4 w-4" /> },
    { to: '/dashboard/settings', label: 'הגדרות', icon: <Settings className="h-4 w-4" /> },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
    const { business, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="flex flex-col h-full bg-gray-900 text-white w-64 p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
                <Truck className="h-6 w-6 text-blue-400" />
                <div>
                    <p className="font-bold text-sm leading-tight">{business?.businessName || 'Movalo'}</p>
                    <p className="text-xs text-gray-400">{business?.subscriptionStatus === 'trial' ? 'תקופת ניסיון' : 'מנוי פעיל'}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="mr-auto text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-1">
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
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mt-4"
            >
                <LogOut className="h-4 w-4" />
                יציאה
            </button>
        </aside>
    );
}

// --- דפי תוכן ---
function Overview() {
    const { business } = useAuth();
    return (
        <div dir="rtl" className="p-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ברוך הבא, {business?.businessName}!
            </h1>
            <p className="text-gray-500 mb-6">
                הדשבורד שלך — כאן תנהל את כל פעילות העסק
            </p>

            {business?.subscriptionStatus === 'trial' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-blue-800">אתה בתקופת ניסיון חינמית</p>
                        <p className="text-sm text-blue-600 mt-1">
                            תוכל להשתמש בכל התכונות ללא תשלום. לשדרוג לאחר מכן — עבור להגדרות.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'הזמנות החודש', value: '—', color: 'blue' },
                    { label: 'לקוחות פעילים', value: '—', color: 'green' },
                    { label: 'הכנסה החודש', value: '—', color: 'purple' }
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border shadow-sm p-5">
                        <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white rounded-xl border shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 mb-3">מה הלאה?</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li>• הגדר את פרטי העסק שלך בלשונית <strong>הגדרות</strong></li>
                    <li>• הוסף עובדים ונהגים בלשונית <strong>צוות</strong></li>
                    <li>• עקוב אחר הזמנות ולקוחות בלשוניות המתאימות</li>
                </ul>
            </div>
        </div>
    );
}

function ComingSoon({ title }: { title: string }) {
    return (
        <div dir="rtl" className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
            <p className="text-gray-400 text-sm">בקרוב — אנחנו עובדים על זה</p>
        </div>
    );
}

// --- Layout ראשי ---
export default function TenantDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div dir="rtl" className="flex h-screen bg-gray-50">
            {/* Sidebar — desktop */}
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Sidebar — mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="flex-shrink-0">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                    <div
                        className="flex-1 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                </div>
            )}

            {/* תוכן ראשי */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header mobile */}
                <header className="md:hidden flex items-center gap-3 bg-white border-b px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-800"
                        aria-label="פתח תפריט"
                    >
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
                        <Route path="estimates" element={<ComingSoon title="ניהול הזמנות" />} />
                        <Route path="customers" element={<ComingSoon title="ניהול לקוחות" />} />
                        <Route path="team" element={<TeamPage />} />
                        <Route path="settings" element={<ComingSoon title="הגדרות עסק" />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

// --- דף צוות ---
const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://dudu-move-backend.onrender.com');

interface Employee {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
}

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
                        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="שם מלא" value={newEmp.name}
                            onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))} />
                        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="אימייל" dir="ltr"
                            value={newEmp.email} onChange={e => setNewEmp(p => ({ ...p, email: e.target.value }))} />
                        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="סיסמה (לפחות 8 תווים)"
                            type="password" dir="ltr" value={newEmp.password}
                            onChange={e => setNewEmp(p => ({ ...p, password: e.target.value }))} />
                        <select className="border rounded-lg px-3 py-2 text-sm bg-white" value={newEmp.role}
                            onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}>
                            <option value="driver">נהג</option>
                            <option value="manager">מנהל</option>
                        </select>
                    </div>
                    {addError && <p className="text-sm text-red-600">{addError}</p>}
                    <Button onClick={handleAdd} disabled={addLoading} className="bg-green-600 hover:bg-green-700">
                        {addLoading ? 'שומר...' : 'הוסף'}
                    </Button>
                </div>
            )}

            {loading ? (
                <p className="text-gray-400 text-center py-8">טוען...</p>
            ) : employees.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>אין עובדים עדיין. הוסף את הצוות שלך.</p>
                </div>
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
                                <button
                                    onClick={() => handleDelete(emp._id)}
                                    className="text-red-400 hover:text-red-600 text-xs"
                                    aria-label="מחק עובד"
                                >
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
