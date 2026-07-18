/**
 * דף יצירת קשר — אתר הדמו של דוד הובלות (/demo/contact)
 */

import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import { fetchBusinessContact, type PublicBusinessContact } from '@/services/businessInfoService';
import { usePageMeta, SITE_ORIGIN } from '@/hooks/usePageMeta';

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

function toWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `972${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

export default function ContactPage() {
  const [biz, setBiz] = useState<PublicBusinessContact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  usePageMeta({
    title: `יצירת קשר | ${biz?.businessName || 'דוד הובלות'}`,
    description: 'צרו קשר עם צוות ההובלות — טלפון, WhatsApp או טופס פנייה.',
    canonical: `${SITE_ORIGIN}/demo/contact`,
  });

  useEffect(() => {
    fetchBusinessContact().then(setBiz);
  }, []);

  const phoneNumber = biz?.phone || '0547777623';
  const emailAddress = biz?.email || 'davidgueta3232@gmail.com';
  const address = biz?.address || 'אילת, ישראל';
  const businessName = biz?.businessName || 'דוד הובלות';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    try {
      const res = await fetch(`${API_ROOT}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus('err');
        setStatusMsg(data.message || 'שליחה נכשלה');
      } else {
        setStatus('ok');
        setStatusMsg(data.message || 'נשלח בהצלחה');
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setStatus('err');
      setStatusMsg('שגיאת תקשורת. נסו שוב או התקשרו אלינו.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-blue-600 mb-1">
            <Link to="/demo" className="hover:underline">← חזרה לאתר</Link>
          </p>
          <h1 className="text-3xl font-bold text-gray-900">יצירת קשר</h1>
          <p className="text-gray-600 mt-2">נשמח לעזור — השאירו פרטים או דברו איתנו ישירות.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-5 space-y-4 shadow-sm">
              <h2 className="font-semibold text-gray-800">שיחה ישירה עם {businessName}</h2>
              <a href={`tel:${phoneNumber}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-700">
                <Phone className="h-5 w-5 text-blue-600" />
                <span dir="ltr">{phoneNumber}</span>
              </a>
              <a href={`mailto:${emailAddress}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-700">
                <Mail className="h-5 w-5 text-blue-600" />
                <span dir="ltr" className="break-all">{emailAddress}</span>
              </a>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>{address}</span>
              </div>
              <a
                href={toWhatsAppLink(phoneNumber, `שלום ${businessName}, אשמח לקבל פרטים על הובלה.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 text-sm font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp עם המוביל
              </a>
            </div>
            <p className="text-sm text-gray-500">
              רוצים הצעת מחיר מפורטת?{' '}
              <Link to="/demo#estimate-form" className="text-blue-600 hover:underline">מלאו את טופס ההצעה</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5 space-y-4 shadow-sm">
            <h2 className="font-semibold text-gray-800">טופס פנייה</h2>
            <div className="space-y-1">
              <Label htmlFor="contact-name">שם מלא</Label>
              <Input id="contact-name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-phone">טלפון</Label>
              <Input id="contact-phone" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" placeholder="05xxxxxxxx" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-email">אימייל (אופציונלי)</Label>
              <Input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contact-message">הודעה</Label>
              <textarea
                id="contact-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {status !== 'idle' && (
              <p className={`text-sm rounded-lg px-3 py-2 ${status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {statusMsg}
              </p>
            )}
            <Button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700">
              {sending ? <><Loader2 className="h-4 w-4 animate-spin ml-2" />שולח...</> : 'שלח פנייה'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
