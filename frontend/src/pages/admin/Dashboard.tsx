import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { NotificationService } from "@/services/NotificationService";
import { ReportService } from "@/services/ReportService";
import { AiAssistant } from "@/components/admin/AiAssistant";
import { useToast } from "@/components/ui/use-toast";
import { adminHeaders } from "@/lib/adminApi";
import { Mail, ChevronRight, ChevronLeft, Users, Calendar, BarChart2, FileText, Receipt } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

interface MoveRecord {
  id: string;
  email?: string;
  created_at: string;
  preferred_move_date?: string;
  totalPrice: number;
  status: string;
  customer: { name: string; phone: string };
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

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין', confirmed: 'מאושר', approved: 'אושר',
  in_progress: 'בביצוע', completed: 'הושלם', cancelled: 'בוטל', rejected: 'נדחה',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
};

// ─── לוח שנה מיני ────────────────────────────────────────────────────────────
const MiniCalendar = ({ moves }: { moves: MoveRecord[] }) => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const moveDates = useMemo(() => {
    const map: Record<string, number> = {};
    moves.forEach(m => {
      const d = m.preferred_move_date || m.created_at;
      if (!d) return;
      const key = new Date(d).toLocaleDateString('sv'); // YYYY-MM-DD
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [moves]);

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toLocaleDateString('sv');

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1));

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar size={16} /> לוח שנה — הובלות מתוכננות
          </CardTitle>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded" aria-label="חודש קודם"><ChevronRight size={16} /></button>
            <span className="text-sm font-medium w-28 text-center">
              {viewDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded" aria-label="חודש הבא"><ChevronLeft size={16} /></button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(d => <div key={d} className="py-1 font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = moveDates[key] || 0;
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`relative flex flex-col items-center justify-center h-9 rounded text-xs cursor-default
                  ${isToday ? 'bg-blue-600 text-white font-bold' : count > 0 ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                title={count > 0 ? `${count} הובלות ב-${day}/${month + 1}` : ''}
              >
                {day}
                {count > 0 && (
                  <span className={`text-[9px] leading-none ${isToday ? 'text-blue-200' : 'text-blue-600'}`}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">מספרים קטנים = מספר הובלות מתוכננות באותו יום</p>
      </CardContent>
    </Card>
  );
};

// ─── טבלת סטטיסטיקות חודשיות/שנתיות ─────────────────────────────────────────
const StatsTable = ({ moves }: { moves: MoveRecord[] }) => {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());

  const allYears = useMemo(() => {
    const ys = new Set(moves.map(m => new Date(m.created_at).getFullYear()));
    return Array.from(ys).sort((a, b) => b - a);
  }, [moves]);

  const monthlyStats = useMemo(() => {
    const stats: { month: string; count: number; revenue: number; avg: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const monthMoves = moves.filter(mv =>
        new Date(mv.created_at).getFullYear() === viewYear &&
        new Date(mv.created_at).getMonth() === m
      );
      const revenue = monthMoves.reduce((s, mv) => s + mv.totalPrice, 0);
      stats.push({
        month: new Date(viewYear, m).toLocaleDateString('he-IL', { month: 'long' }),
        count: monthMoves.length,
        revenue,
        avg: monthMoves.length > 0 ? Math.round(revenue / monthMoves.length) : 0,
      });
    }
    return stats;
  }, [moves, viewYear]);

  const yearTotal = monthlyStats.reduce((s, m) => s + m.revenue, 0);
  const yearCount = monthlyStats.reduce((s, m) => s + m.count, 0);

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 size={16} /> סטטיסטיקות לפי חודש
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">שנה:</span>
              {allYears.length > 0 ? allYears.map(y => (
                <button
                  key={y}
                  onClick={() => setViewYear(y)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${viewYear === y ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {y}
                </button>
              )) : <span className="text-sm text-gray-400">{new Date().getFullYear()}</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">חודש</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">מספר הובלות</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">הכנסות</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600 hidden sm:table-cell">ממוצע להובלה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthlyStats.map(row => (
                  <tr key={row.month} className={`${row.count > 0 ? 'hover:bg-blue-50/50' : 'text-gray-300'}`}>
                    <td className="px-4 py-2.5 font-medium">{row.month}</td>
                    <td className="px-4 py-2.5">
                      {row.count > 0
                        ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{row.count}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">
                      {row.revenue > 0 ? `₪${row.revenue.toLocaleString('he-IL')}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell text-gray-500">
                      {row.avg > 0 ? `₪${row.avg.toLocaleString('he-IL')}` : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                  <td className="px-4 py-3">סה"כ {viewYear}</td>
                  <td className="px-4 py-3">{yearCount}</td>
                  <td className="px-4 py-3 text-blue-700">₪{yearTotal.toLocaleString('he-IL')}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">
                    {yearCount > 0 ? `₪${Math.round(yearTotal / yearCount).toLocaleString('he-IL')}` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* גרף עמודות */}
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">גרף הכנסות {viewYear}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats.filter(m => m.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₪${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`₪${v.toLocaleString('he-IL')}`, 'הכנסות']} />
                <Bar dataKey="revenue" name="הכנסות" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Dashboard ראשי ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { toast } = useToast();
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null);
  const [issuingInvoiceId, setIssuingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchMoves();
    fetchCustomers();
    setupNotifications();
    return () => { NotificationService.unsubscribeAll(); };
  }, []);

  const setupNotifications = () => {
    NotificationService.subscribeToNewMoves((move) => {
      toast({ title: 'הובלה חדשה!', description: `התקבלה בקשת הובלה חדשה מ${move.customer?.name}` });
    });
    NotificationService.subscribeToUrgentMoves((move) => {
      toast({
        title: 'הובלה דחופה!',
        description: `הובלה ב-${new Date(move.preferred_move_date ?? move.created_at ?? Date.now()).toLocaleDateString('he-IL')} ממתינה לאישור`,
        variant: 'destructive',
      });
    });
    NotificationService.subscribeToHighValueMoves((move) => {
      toast({ title: 'הובלה בסכום גבוה!', description: `הזמנה בסך ${move.price_estimate?.totalPrice ?? 0}₪` });
    });
  };

  const fetchMoves = async () => {
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/estimates?limit=500`, { headers: adminHeaders() });
      const result = await res.json();
      const raw: Array<{
        _id: string; name: string; phone: string; email?: string;
        createdAt: string; preferredMoveDate?: string; totalPrice: number; status: string;
      }> = result.data || [];

      let total = 0;
      const monthly: Record<string, number> = {};
      const movesData: MoveRecord[] = raw.map(e => {
        const move: MoveRecord = {
          id: e._id,
          email: e.email,
          created_at: new Date(e.createdAt).toISOString(),
          preferred_move_date: e.preferredMoveDate,
          totalPrice: e.totalPrice ?? 0,
          status: e.status ?? 'pending',
          customer: { name: e.name, phone: e.phone },
        };
        total += move.totalPrice;
        const key = new Date(move.created_at).toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
        monthly[key] = (monthly[key] || 0) + move.totalPrice;
        return move;
      });

      setMoves(movesData);
      setTotalRevenue(total);
      setMonthlyData(Object.entries(monthly).map(([month, amount]) => ({ month, amount })));
    } catch (err) {
      console.error('שגיאה בטעינת הובלות:', err);
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בטעינת הנתונים', variant: 'destructive' });
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/customers?limit=500`, { headers: adminHeaders() });
      const result = await res.json();
      setCustomers(result.data || []);
    } catch (err) {
      console.error('שגיאה בטעינת לקוחות:', err);
    }
  };

  const handleSendQuoteEmail = async (move: MoveRecord) => {
    if (!move.email) {
      toast({ title: 'שגיאה', description: 'אין כתובת מייל ללקוח זה', variant: 'destructive' });
      return;
    }
    setSendingQuoteId(move.id);
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/estimates/${move.id}/send-quote-email`, {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'הצעת המחיר נשלחה!', description: `מספר הצעה: ${data.quoteNumber}` });
      } else {
        toast({ title: 'שגיאה', description: data.message || 'שליחה נכשלה', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'שגיאה', description: 'שליחת המייל נכשלה', variant: 'destructive' });
    } finally {
      setSendingQuoteId(null);
    }
  };

  const handleIssueInvoice = async (move: MoveRecord) => {
    setIssuingInvoiceId(move.id);
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/estimates/${move.id}/invoice`, {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
      });
      const data = await res.json();
      if (data.success) {
        const inv = data.data?.invoice;
        toast({
          title: '✅ חשבונית הופקה בהצלחה!',
          description: inv?.documentUrl
            ? `מספר מסמך: ${inv.documentNumber} — `
            : `מספר מסמך: ${inv?.documentNumber ?? '—'}`,
        });
        if (inv?.documentUrl) {
          window.open(inv.documentUrl, '_blank');
        }
      } else {
        toast({
          title: 'לא ניתן להפיק חשבונית',
          description: data.error || 'יש להגדיר GREEN_INVOICE_API_KEY ב-Render',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'שגיאה', description: 'הפקת החשבונית נכשלה', variant: 'destructive' });
    } finally {
      setIssuingInvoiceId(null);
    }
  };

  const handleExportReport = async () => {
    try {
      const today = new Date();
      const report = await ReportService.generateMonthlyReport(today.getFullYear(), today.getMonth());
      await ReportService.exportToExcel(report.moves, `דוח_הובלות_${report.month}`);
      toast({ title: 'הדוח הורד בהצלחה' });
    } catch {
      toast({ title: 'שגיאה', description: 'אירעה שגיאה בייצוא הדוח', variant: 'destructive' });
    }
  };

  const thisMonthMoves = moves.filter(m =>
    new Date(m.created_at).getMonth() === new Date().getMonth() &&
    new Date(m.created_at).getFullYear() === new Date().getFullYear()
  );
  const pendingMoves = moves.filter(m => m.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* כותרת */}
      <header className="bg-gradient-to-l from-blue-700 to-indigo-800 text-white px-4 sm:px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">🚛 דוד הובלות — מרכז ניהול</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button onClick={handleExportReport} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            ייצא דוח חודשי
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6 bg-white shadow-sm border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">סקירה</TabsTrigger>
            <TabsTrigger value="moves" className="flex-1 sm:flex-none">הובלות</TabsTrigger>
            <TabsTrigger value="clients" className="flex-1 sm:flex-none flex items-center gap-1"><Users size={13} />לקוחות</TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1 sm:flex-none flex items-center gap-1"><Calendar size={13} />לוח שנה</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 sm:flex-none flex items-center gap-1"><BarChart2 size={13} />סטטיסטיקות</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 sm:flex-none">🤖 לאה AI</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 sm:flex-none flex items-center gap-1"><FileText size={13} />דוחות</TabsTrigger>
          </TabsList>

          {/* ─── סקירה ─── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="border-r-4 border-r-green-500 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">סה"כ הכנסות</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">₪{totalRevenue.toLocaleString('he-IL')}</p>
                  <p className="text-xs text-gray-400 mt-1">מ-{moves.length} הובלות</p>
                </CardContent>
              </Card>
              <Card className="border-r-4 border-r-blue-500 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">הובלות החודש</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{thisMonthMoves.length}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    ממוצע ₪{thisMonthMoves.length > 0
                      ? Math.round(thisMonthMoves.reduce((s, m) => s + m.totalPrice, 0) / thisMonthMoves.length).toLocaleString('he-IL')
                      : 0} לכל הובלה
                  </p>
                </CardContent>
              </Card>
              <Card className="border-r-4 border-r-yellow-500 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">ממתינות לאישור</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{pendingMoves.length}</p>
                  <p className="text-xs text-gray-400 mt-1">מתוך {moves.length} סה"כ</p>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">הכנסות חודשיות</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₪${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`₪${v.toLocaleString('he-IL')}`, 'הכנסות']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" name="הכנסות" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── הובלות ─── */}
          <TabsContent value="moves">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">רשימת הובלות ({moves.length})</CardTitle>
                <p className="text-xs text-gray-500 mt-1">לחץ "שלח הצעת מחיר" לשלוח מייל עם פרטים ומחיר ללקוח</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right px-3 py-3 font-medium text-gray-600">תאריך</th>
                        <th className="text-right px-3 py-3 font-medium text-gray-600">לקוח</th>
                        <th className="text-right px-3 py-3 font-medium text-gray-600 hidden md:table-cell">טלפון</th>
                        <th className="text-right px-3 py-3 font-medium text-gray-600 hidden lg:table-cell">מועד הובלה</th>
                        <th className="text-right px-3 py-3 font-medium text-gray-600">סטטוס</th>
                        <th className="text-right px-3 py-3 font-medium text-gray-600">מחיר</th>
                        <th className="text-right px-3 py-3 font-medium text-gray-600" colSpan={2}>פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {moves.map(move => (
                        <tr key={move.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3 text-gray-500 text-xs">{new Date(move.created_at).toLocaleDateString('he-IL')}</td>
                          <td className="px-3 py-3 font-medium text-gray-900">{move.customer?.name}</td>
                          <td className="px-3 py-3 text-gray-500 hidden md:table-cell">{move.customer?.phone}</td>
                          <td className="px-3 py-3 text-gray-500 hidden lg:table-cell">
                            {move.preferred_move_date ? new Date(move.preferred_move_date).toLocaleDateString('he-IL') : '—'}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[move.status] ?? 'bg-gray-100 text-gray-700'}`}>
                              {STATUS_LABELS[move.status] ?? move.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-semibold text-gray-900">₪{move.totalPrice.toLocaleString('he-IL')}</td>
                          <td className="px-3 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={sendingQuoteId === move.id || !move.email}
                              onClick={() => handleSendQuoteEmail(move)}
                              className="flex items-center gap-1 text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                              title={!move.email ? 'אין מייל ללקוח' : 'שלח הצעת מחיר במייל'}
                            >
                              <Mail size={12} aria-hidden="true" />
                              {sendingQuoteId === move.id ? 'שולח...' : 'הצעת מחיר'}
                            </Button>
                          </td>
                          <td className="px-3 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={issuingInvoiceId === move.id}
                              onClick={() => handleIssueInvoice(move)}
                              className="flex items-center gap-1 text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                              title="הפק חשבונית מס קבלה דרך Green Invoice"
                            >
                              <Receipt size={12} aria-hidden="true" />
                              {issuingInvoiceId === move.id ? 'מפיק...' : 'חשבונית'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {moves.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">אין הובלות להצגה</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── לקוחות ─── */}
          <TabsContent value="clients">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Users size={16} /> לקוחות ({customers.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">שם</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">אימייל</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">טלפון</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">הובלות</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">סה"כ שולם</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">הצטרף</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {customers.map(c => (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                          <td className="px-4 py-3 text-gray-500">
                            <a href={`mailto:${c.email}`} className="hover:text-blue-600">{c.email}</a>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                            <a href={`tel:${c.phone}`} className="hover:text-blue-600">{c.phone}</a>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              {c.totalMoves}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">₪{(c.totalSpent || 0).toLocaleString('he-IL')}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                            {new Date(c.createdAt).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">אין לקוחות להצגה</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── לוח שנה ─── */}
          <TabsContent value="calendar">
            <MiniCalendar moves={moves} />
          </TabsContent>

          {/* ─── סטטיסטיקות ─── */}
          <TabsContent value="stats">
            <StatsTable moves={moves} />
          </TabsContent>

          {/* ─── מזכירה AI ─── */}
          <TabsContent value="ai">
            <AiAssistant />
          </TabsContent>

          {/* ─── דוחות ─── */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base">דוח יומי</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">הורד סיכום הובלות להיום</p>
                  <Button variant="outline" onClick={() => ReportService.generateDailyReport(new Date())} className="w-full">הורד דוח יומי</Button>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-base">דוח חודשי</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">ייצא Excel עם כל הובלות החודש</p>
                  <Button onClick={handleExportReport} className="w-full">ייצא לאקסל</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
