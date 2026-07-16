/**
 * מרכז פרטיות — GDPR / חוק הגנת הפרטיות: מחיקה, ייצוא, הסרת הסכמה
 */

import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { usePageMeta, SITE_ORIGIN } from '@/hooks/usePageMeta';

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

export default function PrivacyCenterPage() {
  const [type, setType] = useState<'deletion' | 'export' | 'consent_withdraw'>('deletion');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [exportJson, setExportJson] = useState('');

  usePageMeta({
    title: 'מרכז פרטיות | דוד הובלות',
    description: 'מימוש זכויות פרטיות — מחיקה, ייצוא והסרת הסכמה',
    canonical: `${SITE_ORIGIN}/demo/privacy`,
  });

  const submitRequest = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setExportJson('');
    try {
      if (type === 'export') {
        const res = await fetch(`${API_ROOT}/api/public/privacy/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, email }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setMsg(json.message || 'שגיאה בייצוא');
        } else {
          setMsg('הייצוא מוכן — ניתן להוריד/להעתיק.');
          setExportJson(JSON.stringify(json.data, null, 2));
        }
      } else {
        const res = await fetch(`${API_ROOT}/api/public/privacy/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, name, phone, email, details }),
        });
        const json = await res.json();
        setMsg(json.message || (res.ok ? 'נשלח' : 'שגיאה'));
      }
    } catch {
      setMsg('שגיאת תקשורת');
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = () => {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <p className="text-sm text-blue-600 mb-2"><Link to="/demo" className="hover:underline">← חזרה לאתר</Link></p>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-7 w-7 text-blue-600" />
          מרכז פרטיות
        </h1>
        <p className="text-gray-600 mt-2 mb-8 text-sm leading-relaxed">
          לפי חוק הגנת הפרטיות ותקנות GDPR — ניתן לבקש מחיקת מידע, ייצוא נתונים או הסרת הסכמה לשיווק.
        </p>

        <form onSubmit={submitRequest} className="rounded-xl border bg-white p-5 space-y-4 shadow-sm">
          <div className="space-y-1">
            <Label>סוג בקשה</Label>
            <select value={type} onChange={e => setType(e.target.value as typeof type)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="deletion">מחיקת מידע</option>
              <option value="export">ייצוא הנתונים שלי</option>
              <option value="consent_withdraw">הסרת הסכמה לשיווק</option>
            </select>
          </div>
          {type !== 'export' && (
            <div className="space-y-1">
              <Label>שם מלא</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-1">
            <Label>טלפון</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" placeholder="05xxxxxxxx" required />
          </div>
          <div className="space-y-1">
            <Label>אימייל (אופציונלי)</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
          </div>
          {type !== 'export' && (
            <div className="space-y-1">
              <Label>פרטים נוספים</Label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
          {msg && <p className="text-sm text-gray-700 bg-gray-50 border rounded-lg px-3 py-2">{msg}</p>}
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />מעבד...</> : 'שלח בקשה'}
          </Button>
        </form>

        {exportJson && (
          <div className="mt-6 space-y-2">
            <Button type="button" variant="outline" onClick={downloadExport}>הורד JSON</Button>
            <pre className="text-xs bg-gray-900 text-green-200 p-4 rounded-xl overflow-auto max-h-80" dir="ltr">{exportJson}</pre>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
