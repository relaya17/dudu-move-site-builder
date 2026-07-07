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
import {
  Mail, ChevronRight, ChevronLeft, Users, Calendar, BarChart2, FileText, Receipt, Plus, Trash2, Wallet,
  Settings as SettingsIcon, Link2, CheckCircle2, Loader2,
} from 'lucide-react';
import type { BusinessSettingsDTO } from 'shared';
import { printBuiltInInvoice } from '@/lib/printInvoice';

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
  quote?: { quoteNumber: string; issuedAt: string };
  invoice?: { documentNumber: string; documentUrl?: string; issuedAt: string; providerId?: string };
  currentAddress?: string;
  destinationAddress?: string;
}

interface CalendarNote {
  _id: string;
  date: string; // YYYY-MM-DD
  text: string;
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
interface MiniCalendarProps {
  moves: MoveRecord[];
  notes: CalendarNote[];
  onAddNote: (date: string, text: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

const MiniCalendar = ({ moves, notes, onAddNote, onDeleteNote }: MiniCalendarProps) => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [saving, setSaving] = useState(false);
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

  const notesByDate = useMemo(() => {
    const map: Record<string, CalendarNote[]> = {};
    notes.forEach(n => {
      if (!map[n.date]) map[n.date] = [];
      map[n.date].push(n);
    });
    return map;
  }, [notes]);

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toLocaleDateString('sv');

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => { setViewDate(new Date(year, month - 1)); setSelectedDay(null); };
  const nextMonth = () => { setViewDate(new Date(year, month + 1)); setSelectedDay(null); };

  const selectedNotes = selectedDay ? (notesByDate[selectedDay] || []) : [];

  const handleAddNote = async () => {
    if (!selectedDay || !newNoteText.trim()) return;
    setSaving(true);
    try {
      await onAddNote(selectedDay, newNoteText.trim());
      setNewNoteText('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar size={16} /> לוח שנה — הובלות והערות
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
            const noteCount = notesByDate[key]?.length || 0;
            const isToday = key === todayKey;
            const isSelected = key === selectedDay;
            return (
              <button
                key={key}
                onClick={() => { setSelectedDay(key); setNewNoteText(''); }}
                className={`relative flex flex-col items-center justify-center h-9 rounded text-xs transition-colors
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isToday ? 'bg-blue-600 text-white font-bold' : count > 0 ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                title={count > 0 ? `${count} הובלות ב-${day}/${month + 1}` : 'לחץ להוספת הערה'}
              >
                {day}
                {count > 0 && (
                  <span className={`text-[9px] leading-none ${isToday ? 'text-blue-200' : 'text-blue-600'}`}>
                    {count}
                  </span>
                )}
                {noteCount > 0 && (
                  <span className={`absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-yellow-300' : 'bg-amber-500'}`} />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">נקודה כתומה = יש הערה ביום זה. לחץ על יום כדי לצפות/להוסיף הערה.</p>

        {selectedDay && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              הערות ל-{new Date(selectedDay).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="space-y-2 mb-3">
              {selectedNotes.length === 0 && (
                <p className="text-xs text-gray-400">אין הערות ליום זה עדיין.</p>
              )}
              {selectedNotes.map(n => (
                <div key={n._id} className="flex items-start justify-between gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 text-sm">
                  <span className="text-gray-800 whitespace-pre-wrap">{n.text}</span>
                  <button
                    onClick={() => onDeleteNote(n._id)}
                    className="text-gray-400 hover:text-red-600 shrink-0"
                    aria-label="מחק הערה"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2">
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="הוסף הערה או תזכורת ליום זה..."
                rows={2}
                className="flex-1 text-sm border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" onClick={handleAddNote} disabled={saving || !newNoteText.trim()} className="flex items-center gap-1 h-9">
                <Plus size={14} /> הוסף
              </Button>
            </div>
          </div>
        )}
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

// ─── הנהלת חשבונות ───────────────────────────────────────────────────────────
interface BillingPanelProps {
  moves: MoveRecord[];
  issuingInvoiceId: string | null;
  onIssueInvoice: (move: MoveRecord) => void;
  onReprintInvoice: (move: MoveRecord) => void;
}

const BillingPanel = ({ moves, issuingInvoiceId, onIssueInvoice, onReprintInvoice }: BillingPanelProps) => {
  const invoicedMoves = moves.filter(m => m.invoice?.documentNumber);
  const quotedOnlyMoves = moves.filter(m => m.quote?.quoteNumber && !m.invoice?.documentNumber);
  const noDocumentMoves = moves.filter(m => !m.quote?.quoteNumber && !m.invoice?.documentNumber);
  const totalInvoiced = invoicedMoves.reduce((s, m) => s + m.totalPrice, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-r-4 border-r-green-500 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">סה"כ הופקו חשבוניות</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">₪{totalInvoiced.toLocaleString('he-IL')}</p>
            <p className="text-xs text-gray-400 mt-1">{invoicedMoves.length} חשבוניות</p>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-blue-500 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">הצעות מחיר בלבד</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{quotedOnlyMoves.length}</p>
            <p className="text-xs text-gray-400 mt-1">נשלחה הצעה, טרם הופקה חשבונית</p>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-yellow-500 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">ללא מסמך</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{noDocumentMoves.length}</p>
            <p className="text-xs text-gray-400 mt-1">מתוך {moves.length} הובלות</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Wallet size={16} /> מסמכים חשבונאיים</CardTitle>
          <p className="text-xs text-gray-500 mt-1">כל החשבוניות והצעות המחיר שהופקו במערכת עבור לקוחות, במקום אחד</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-3 py-3 font-medium text-gray-600">לקוח</th>
                  <th className="text-right px-3 py-3 font-medium text-gray-600">מחיר</th>
                  <th className="text-right px-3 py-3 font-medium text-gray-600">הצעת מחיר</th>
                  <th className="text-right px-3 py-3 font-medium text-gray-600">חשבונית</th>
                  <th className="text-right px-3 py-3 font-medium text-gray-600">פעולה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {moves.map(move => (
                  <tr key={move.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 font-medium text-gray-900">{move.customer?.name}</td>
                    <td className="px-3 py-3 font-semibold text-gray-900">₪{move.totalPrice.toLocaleString('he-IL')}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {move.quote?.quoteNumber
                        ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">#{move.quote.quoteNumber}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {move.invoice?.documentNumber
                        ? (
                          move.invoice.documentUrl
                            ? <a href={move.invoice.documentUrl} target="_blank" rel="noreferrer" className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 hover:underline">#{move.invoice.documentNumber}</a>
                            : <button onClick={() => onReprintInvoice(move)} className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 hover:underline">#{move.invoice.documentNumber}</button>
                        )
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      {!move.invoice?.documentNumber && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={issuingInvoiceId === move.id}
                          onClick={() => onIssueInvoice(move)}
                          className="flex items-center gap-1 text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Receipt size={12} aria-hidden="true" />
                          {issuingInvoiceId === move.id ? 'מפיק...' : 'הפק חשבונית'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {moves.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">אין הובלות להצגה</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── הגדרות עסק וחשבונות ─────────────────────────────────────────────────────
interface SettingsForm {
  businessName: string;
  businessId: string;
  businessType: 'exempt' | 'licensed' | 'company';
  address: string;
  phone: string;
  email: string;
  vatRate: number;
  invoiceProvider: 'built_in' | 'green_invoice';
  greenInvoiceApiKey: string;
  greenInvoiceApiSecret: string;
  greenInvoiceEnv: 'sandbox' | 'production';
}

const EMPTY_SETTINGS_FORM: SettingsForm = {
  businessName: '', businessId: '', businessType: 'licensed', address: '', phone: '', email: '',
  vatRate: 18, invoiceProvider: 'built_in', greenInvoiceApiKey: '', greenInvoiceApiSecret: '', greenInvoiceEnv: 'sandbox',
};

const BusinessSettingsPanel = ({ onSaved }: { onSaved: (settings: BusinessSettingsDTO) => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<SettingsForm>(EMPTY_SETTINGS_FORM);
  const [greenInvoiceConfigured, setGreenInvoiceConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/settings`, { headers: adminHeaders() });
      const result = await res.json();
      if (result.success) {
        const s: BusinessSettingsDTO = result.data;
        setForm(prev => ({
          ...prev,
          businessName: s.businessName, businessId: s.businessId, businessType: s.businessType,
          address: s.address, phone: s.phone, email: s.email, vatRate: s.vatRate,
          invoiceProvider: s.invoiceProvider, greenInvoiceEnv: s.greenInvoiceEnv || 'sandbox',
        }));
        setGreenInvoiceConfigured(s.greenInvoiceConfigured);
        onSaved(s);
      }
    } catch {
      toast({ title: 'שגיאה', description: 'טעינת הגדרות העסק נכשלה', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        businessName: form.businessName, businessId: form.businessId, businessType: form.businessType,
        address: form.address, phone: form.phone, email: form.email, vatRate: form.vatRate,
        invoiceProvider: form.invoiceProvider, greenInvoiceEnv: form.greenInvoiceEnv,
      };
      if (form.greenInvoiceApiKey) body.greenInvoiceApiKey = form.greenInvoiceApiKey;
      if (form.greenInvoiceApiSecret) body.greenInvoiceApiSecret = form.greenInvoiceApiSecret;

      const res = await fetch(`${API_ROOT}/api/mongo/settings`, {
        method: 'PUT',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: 'ההגדרות נשמרו בהצלחה' });
        setForm(prev => ({ ...prev, greenInvoiceApiKey: '', greenInvoiceApiSecret: '' }));
        await fetchSettings();
      } else {
        toast({ title: 'שגיאה', description: result.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'שגיאה', description: 'שמירת ההגדרות נכשלה', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!form.greenInvoiceApiKey || !form.greenInvoiceApiSecret) {
      toast({ title: 'שגיאה', description: 'יש להזין מפתח API וסוד API', variant: 'destructive' });
      return;
    }
    setTesting(true);
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/settings/test-green-invoice`, {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ apiKey: form.greenInvoiceApiKey, apiSecret: form.greenInvoiceApiSecret, env: form.greenInvoiceEnv }),
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: '✅ החיבור תקין!', description: 'ניתן לשמור את ההגדרות' });
      } else {
        toast({ title: 'החיבור נכשל', description: result.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'שגיאה', description: 'בדיקת החיבור נכשלה', variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const inputClass = "w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) {
    return <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="animate-spin" size={20} /></div>;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><SettingsIcon size={16} /> פרטי העסק</CardTitle>
          <p className="text-xs text-gray-500 mt-1">מוצגים על גבי חשבוניות/קבלות שיופקו במצב "הפקה עצמאית"</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">שם העסק</label>
            <input className={inputClass} value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">מספר עוסק מורשה / ח.פ</label>
            <input className={inputClass} value={form.businessId} onChange={e => setForm({ ...form, businessId: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">סוג העסק</label>
            <select className={inputClass} value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value as SettingsForm['businessType'] })}>
              <option value="licensed">עוסק מורשה</option>
              <option value="exempt">עוסק פטור (ללא מע"מ)</option>
              <option value="company">חברה בע"מ</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">אחוז מע"מ</label>
            <input type="number" min={0} max={100} className={inputClass} value={form.vatRate}
              disabled={form.businessType === 'exempt'}
              onChange={e => setForm({ ...form, vatRate: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">כתובת</label>
            <input className={inputClass} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">טלפון</label>
            <input className={inputClass} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 block mb-1">אימייל</label>
            <input className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Receipt size={16} /> אופן הפקת חשבוניות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setForm({ ...form, invoiceProvider: 'built_in' })}
              className={`text-right p-4 rounded-lg border-2 transition-colors ${form.invoiceProvider === 'built_in' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <p className="font-semibold text-gray-900">הפקה עצמאית (מובנית באפליקציה)</p>
              <p className="text-xs text-gray-500 mt-1">חינמית, ללא ספק חיצוני. מתאימה לרוב הובלות מול לקוחות פרטיים.</p>
            </button>
            <button
              onClick={() => setForm({ ...form, invoiceProvider: 'green_invoice' })}
              className={`text-right p-4 rounded-lg border-2 transition-colors ${form.invoiceProvider === 'green_invoice' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Link2 size={14} /> חיבור לספק חיצוני (Green Invoice)
                {greenInvoiceConfigured && <span className="inline-flex items-center gap-0.5 text-green-600 text-xs"><CheckCircle2 size={12} /> מחובר</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">שירות SaaS מלא, מתאים גם ללקוחות עוסקים מורשים בסכומים גבוהים.</p>
            </button>
          </div>

          {form.invoiceProvider === 'built_in' && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 leading-relaxed">
              שימו לב: זו אינה יעוץ משפטי/מיסויי. הפקה עצמאית מתאימה בעיקר לעסקאות מול לקוחות פרטיים
              (B2C) - עבורן כרגע לא חלה חובת "מספר הקצאה" ברפורמת "חשבוניות ישראל". אם מונפקות
              חשבוניות ללקוחות עוסקים מורשים בסכומים גבוהים (מעל 5,000 ₪ לפני מע"מ), מומלץ להתחבר
              לספק חיצוני, ובכל מקרה מומלץ לאמת עם רואה חשבון/יועץ מס בהתאם לאופי העסק.
            </div>
          )}

          {form.invoiceProvider === 'green_invoice' && (
            <div className="space-y-3 border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">API Key</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder={greenInvoiceConfigured ? '•••••••• (מוגדר)' : 'הדבק כאן את מפתח ה-API'}
                    value={form.greenInvoiceApiKey}
                    onChange={e => setForm({ ...form, greenInvoiceApiKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">API Secret</label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder={greenInvoiceConfigured ? '•••••••• (מוגדר)' : 'הדבק כאן את הסוד'}
                    value={form.greenInvoiceApiSecret}
                    onChange={e => setForm({ ...form, greenInvoiceApiSecret: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">סביבה</label>
                <select className={`${inputClass} max-w-xs`} value={form.greenInvoiceEnv} onChange={e => setForm({ ...form, greenInvoiceEnv: e.target.value as 'sandbox' | 'production' })}>
                  <option value="sandbox">בדיקה (sandbox)</option>
                  <option value="production">אמת (production)</option>
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testing} className="flex items-center gap-1.5">
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                {testing ? 'בודק חיבור...' : 'בדוק חיבור'}
              </Button>
              <p className="text-xs text-gray-400">
                הרשמה לשירות: <a href="https://www.greeninvoice.co.il" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">greeninvoice.co.il</a>
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'שומר...' : 'שמור הגדרות'}
            </Button>
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
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettingsDTO | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null);
  const [issuingInvoiceId, setIssuingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchMoves();
    fetchCustomers();
    fetchCalendarNotes();
    fetchBusinessSettings();
    setupNotifications();
    return () => { NotificationService.unsubscribeAll(); };
  }, []);

  const fetchBusinessSettings = async () => {
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/settings`, { headers: adminHeaders() });
      const result = await res.json();
      if (result.success) setBusinessSettings(result.data);
    } catch (err) {
      console.error('שגיאה בטעינת הגדרות העסק:', err);
    }
  };

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
        currentAddress?: string; destinationAddress?: string;
        quote?: { quoteNumber: string; issuedAt: string };
        invoice?: { documentNumber: string; documentUrl?: string; issuedAt: string; providerId?: string };
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
          quote: e.quote,
          invoice: e.invoice,
          currentAddress: e.currentAddress,
          destinationAddress: e.destinationAddress,
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

  const fetchCalendarNotes = async () => {
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/calendar-notes`, { headers: adminHeaders() });
      const result = await res.json();
      setNotes(result.data || []);
    } catch (err) {
      console.error('שגיאה בטעינת הערות לוח השנה:', err);
    }
  };

  const handleAddNote = async (date: string, text: string) => {
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/calendar-notes`, {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ date, text }),
      });
      const result = await res.json();
      if (result.success) {
        setNotes(prev => [...prev, result.data]);
      } else {
        toast({ title: 'שגיאה', description: result.message || 'הוספת ההערה נכשלה', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'שגיאה', description: 'הוספת ההערה נכשלה', variant: 'destructive' });
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`${API_ROOT}/api/mongo/calendar-notes/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      const result = await res.json();
      if (result.success) {
        setNotes(prev => prev.filter(n => n._id !== id));
      } else {
        toast({ title: 'שגיאה', description: result.message || 'מחיקת ההערה נכשלה', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'שגיאה', description: 'מחיקת ההערה נכשלה', variant: 'destructive' });
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

  const printInvoiceForMove = (move: MoveRecord, inv: { documentNumber: string; issuedAt: string }) => {
    if (!businessSettings) return;
    printBuiltInInvoice(businessSettings, {
      documentNumber: inv.documentNumber,
      issuedAt: inv.issuedAt,
      customerName: move.customer?.name || '',
      customerPhone: move.customer?.phone || '',
      customerEmail: move.email,
      fromAddress: move.currentAddress || '—',
      toAddress: move.destinationAddress || '—',
      moveDate: move.preferred_move_date,
      totalPrice: move.totalPrice,
    });
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
          description: `מספר מסמך: ${inv?.documentNumber ?? '—'}`,
        });
        setMoves(prev => prev.map(m => m.id === move.id ? { ...m, invoice: inv } : m));
        if (inv?.documentUrl) {
          window.open(inv.documentUrl, '_blank');
        } else if (inv?.providerId === 'built_in') {
          printInvoiceForMove(move, inv);
        }
      } else {
        toast({
          title: 'לא ניתן להפיק חשבונית',
          description: data.error || data.message || 'שגיאה בהפקת החשבונית',
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
            <TabsTrigger value="billing" className="flex-1 sm:flex-none flex items-center gap-1"><Wallet size={13} />הנהלת חשבונות</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 sm:flex-none flex items-center gap-1"><BarChart2 size={13} />סטטיסטיקות</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 sm:flex-none">🤖 לאה AI</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 sm:flex-none flex items-center gap-1"><FileText size={13} />דוחות</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 sm:flex-none flex items-center gap-1"><SettingsIcon size={13} />הגדרות</TabsTrigger>
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
                              onClick={() => {
                                if (move.invoice?.documentUrl) window.open(move.invoice.documentUrl, '_blank');
                                else if (move.invoice?.documentNumber) printInvoiceForMove(move, move.invoice as { documentNumber: string; issuedAt: string });
                                else handleIssueInvoice(move);
                              }}
                              className="flex items-center gap-1 text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                              title={move.invoice?.documentNumber ? 'הצג/הדפס חשבונית שהופקה' : 'הפק חשבונית מס/קבלה'}
                            >
                              <Receipt size={12} aria-hidden="true" />
                              {issuingInvoiceId === move.id ? 'מפיק...' : move.invoice?.documentNumber ? 'הדפס חשבונית' : 'הפק חשבונית'}
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
            <MiniCalendar moves={moves} notes={notes} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
          </TabsContent>

          {/* ─── הנהלת חשבונות ─── */}
          <TabsContent value="billing">
            <BillingPanel
              moves={moves}
              issuingInvoiceId={issuingInvoiceId}
              onIssueInvoice={handleIssueInvoice}
              onReprintInvoice={(move) => move.invoice?.documentNumber && printInvoiceForMove(move, move.invoice as { documentNumber: string; issuedAt: string })}
            />
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

          {/* ─── הגדרות עסק וחשבונות ─── */}
          <TabsContent value="settings">
            <BusinessSettingsPanel onSaved={setBusinessSettings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
