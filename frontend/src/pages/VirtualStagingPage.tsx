/**
 * Virtual Staging — עיצוב חלל ריק (AI / מצב הדגמה)
 */

import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { usePageMeta, SITE_ORIGIN } from '@/hooks/usePageMeta';

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

type StagingResult = {
  mode: string;
  title: string;
  description: string;
  previewGradient: string;
  promptHe?: string;
};

export default function VirtualStagingPage() {
  const [style, setStyle] = useState('modern');
  const [roomType, setRoomType] = useState('living');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StagingResult | null>(null);
  const [error, setError] = useState('');

  usePageMeta({
    title: 'Virtual Staging | דוד הובלות',
    description: 'עיצוב מדומה לחללים ריקים לפני ואחרי הובלה',
    canonical: `${SITE_ORIGIN}/demo/staging`,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_ROOT}/api/public/staging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, roomType, notes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'שגיאה');
        return;
      }
      setResult(json.data);
    } catch {
      setError('שגיאת תקשורת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <p className="text-sm text-blue-600 mb-2"><Link to="/demo" className="hover:underline">← חזרה לאתר</Link></p>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-violet-600" />
          Virtual Staging
        </h1>
        <p className="text-gray-600 mt-2 mb-8">
          דמיינו איך דירה ריקה תיראה אחרי עיצוב — כלי עזר לתכנון הובלה והצגה ללקוח.
        </p>

        <form onSubmit={submit} className="rounded-xl border bg-white p-5 space-y-4 shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>סוג חדר</Label>
              <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="living">סלון</option>
                <option value="bedroom">חדר שינה</option>
                <option value="kitchen">מטבח</option>
                <option value="office">משרד</option>
                <option value="empty">חלל ריק</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>סגנון</Label>
              <select value={style} onChange={e => setStyle(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="modern">מודרני</option>
                <option value="scandinavian">סקנדינבי</option>
                <option value="mediterranean">ים-תיכוני</option>
                <option value="industrial">תעשייתי</option>
                <option value="minimal">מינימליסטי</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>הערות (אופציונלי)</Label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="למשל: ספה אפורה, שטיח בהיר..." />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />מייצר...</> : 'צור הצעת עיצוב'}
          </Button>
        </form>

        {result && (
          <div className={`rounded-xl border shadow-sm overflow-hidden`}>
            <div className={`h-40 bg-gradient-to-br ${result.previewGradient}`} />
            <div className="p-5 bg-white space-y-2">
              <p className="text-xs text-violet-600 font-medium">{result.mode === 'demo' ? 'מצב הדגמה' : 'AI פעיל'}</p>
              <h2 className="text-xl font-bold text-gray-900">{result.title}</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result.description}</p>
              {result.promptHe && <p className="text-sm text-gray-500">{result.promptHe}</p>}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
