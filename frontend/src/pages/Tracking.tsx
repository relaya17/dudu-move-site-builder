import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, Circle, MapPin, ArrowLeft, Mail, RefreshCw,
  FileText, Download, Phone, MessageCircle, Loader2
} from 'lucide-react';
import { TRACKING_STAGE_LABELS, TrackingViewDTO, type BusinessSettingsDTO, type PaymentMethod } from 'shared';
import { CustomerAiChat } from '@/components/CustomerAiChat';
import { printBuiltInInvoice } from '@/lib/printInvoice';
import { printQuote } from '@/lib/quotePrint';
import type { MovingEstimateRequest } from '@/types/movingEstimate';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

function toWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `972${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

export const Tracking = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TrackingViewDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState<'quote' | 'invoice' | null>(null);

  const fetchTracking = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/tracking/${token}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message || 'לא ניתן היה למצוא את פרטי ההובלה');
        return;
      }
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('שגיאה בשליפת נתוני מעקב:', err);
      setError('אירעה שגיאה בטעינת נתוני המעקב. נסה/י לרענן את הדף.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  const openDocument = async (kind: 'quote' | 'invoice') => {
    if (!token || !data) return;
    const invoiceMeta = data.documents?.invoice;

    // קישור חיצוני (Green Invoice) — פתיחה ישירה
    if (kind === 'invoice' && invoiceMeta?.documentUrl && !invoiceMeta.printable) {
      window.open(invoiceMeta.documentUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setDocLoading(kind);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tracking/${token}/documents`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || 'לא ניתן לטעון את המסמך');
        return;
      }

      const { business, estimate } = json.data as {
        business: BusinessSettingsDTO;
        estimate: {
          name: string;
          phone: string;
          email?: string;
          currentAddress: string;
          destinationAddress: string;
          preferredMoveDate: string;
          totalPrice: number;
          apartmentType: string;
          quote?: { quoteNumber: string; generatedAt: string };
          invoice?: {
            documentNumber: string;
            issuedAt: string;
            paymentMethod?: PaymentMethod;
            customerIdNumber?: string;
            documentUrl?: string;
            providerId?: string;
          };
          inventory?: Array<{ type: string; quantity: number; description?: string }>;
        };
      };

      if (kind === 'invoice') {
        if (!estimate.invoice) {
          alert('עדיין לא הופקה חשבונית להזמנה זו');
          return;
        }
        if (estimate.invoice.documentUrl && estimate.invoice.providerId !== 'built_in') {
          window.open(estimate.invoice.documentUrl, '_blank', 'noopener,noreferrer');
          return;
        }
        printBuiltInInvoice(business, {
          documentNumber: estimate.invoice.documentNumber,
          issuedAt: estimate.invoice.issuedAt,
          customerName: estimate.name,
          customerPhone: estimate.phone,
          customerEmail: estimate.email,
          fromAddress: estimate.currentAddress,
          toAddress: estimate.destinationAddress,
          moveDate: estimate.preferredMoveDate,
          totalPrice: estimate.totalPrice || 0,
          paymentMethod: estimate.invoice.paymentMethod,
          customerIdNumber: estimate.invoice.customerIdNumber,
        });
      } else {
        if (!estimate.quote) {
          alert('עדיין לא הופקה הצעת מחיר להזמנה זו');
          return;
        }
        const forPrint = {
          name: estimate.name,
          phone: estimate.phone,
          email: estimate.email,
          currentAddress: estimate.currentAddress,
          destinationAddress: estimate.destinationAddress,
          preferredMoveDate: estimate.preferredMoveDate,
          totalPrice: estimate.totalPrice,
          apartmentType: estimate.apartmentType,
          quote: estimate.quote,
          inventory: estimate.inventory || [],
        } as unknown as MovingEstimateRequest;
        printQuote(forPrint, business);
      }
    } catch (err) {
      console.error(err);
      alert('שגיאה בטעינת המסמך');
    } finally {
      setDocLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <p className="text-gray-600" role="status" aria-live="polite">טוען נתוני מעקב...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-600" role="alert">{error || 'לא נמצאו נתוני מעקב'}</p>
            <Button asChild variant="outline">
              <Link to="/demo">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                חזרה לאתר
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stages = data.stages;
  const currentIndex = stages.indexOf(data.stage);
  const contact = data.businessContact;
  const docs = data.documents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <h1 className="sr-only">מעקב אחרי ההובלה של {data.name}</h1>
      <main className="max-w-2xl mx-auto space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span aria-hidden="true">מעקב אחרי ההובלה של {data.name}</span>
              <button
                onClick={() => { setLoading(true); fetchTracking(); }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="רענן נתוני מעקב"
                title="רענן"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p><strong>מ:</strong> {data.currentAddress}</p>
            <p><strong>אל:</strong> {data.destinationAddress}</p>
            <p><strong>תאריך הובלה מתוכנן:</strong> {data.preferredMoveDate}</p>
            {docs?.totalPrice != null && docs.totalPrice > 0 && (
              <p><strong>מחיר משוער:</strong> ₪{docs.totalPrice.toLocaleString('he-IL')}</p>
            )}
          </CardContent>
        </Card>

        {/* מסמכים להורדה */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              מסמכים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!docs?.quote && !docs?.invoice ? (
              <p className="text-sm text-gray-500">
                עדיין אין הצעת מחיר או חשבונית זמינה. כשהמוביל יפיק אותן — הן יופיעו כאן להורדה.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {docs.quote && (
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start"
                    disabled={docLoading === 'quote'}
                    onClick={() => openDocument('quote')}
                  >
                    {docLoading === 'quote'
                      ? <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      : <Download className="w-4 h-4 ml-2" />}
                    הצעת מחיר #{docs.quote.quoteNumber}
                  </Button>
                )}
                {docs.invoice && (
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start"
                    disabled={docLoading === 'invoice'}
                    onClick={() => openDocument('invoice')}
                  >
                    {docLoading === 'invoice'
                      ? <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      : <Download className="w-4 h-4 ml-2" />}
                    חשבונית / קבלה #{docs.invoice.documentNumber}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* שיחה ישירה עם המוביל */}
        {contact && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                שיחה עם המוביל
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{contact.businessName}</p>
              <div className="flex flex-wrap gap-2">
                {contact.phone && (
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="w-4 h-4 ml-1" />
                      התקשר
                    </a>
                  </Button>
                )}
                {contact.phone && (
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <a
                      href={toWhatsAppLink(
                        contact.phone,
                        `שלום ${contact.businessName}, אני ${data.name} — לגבי ההובלה שלי.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 ml-1" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {contact.email && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`mailto:${contact.email}?subject=${encodeURIComponent('לגבי ההובלה שלי')}`}>
                      <Mail className="w-4 h-4 ml-1" />
                      אימייל
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>סטטוס ההובלה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stages.map((stage, idx) => {
                const isDone = idx < currentIndex || data.stage === 'completed' && idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                const historyEntry = data.stageHistory.find(h => h.stage === stage);
                return (
                  <div key={stage} className="flex items-start gap-3" aria-current={isCurrent ? 'step' : undefined}>
                    {isDone || isCurrent ? (
                      <CheckCircle2 className={`w-6 h-6 mt-0.5 ${isCurrent ? 'text-blue-600' : 'text-green-600'}`} aria-hidden="true" />
                    ) : (
                      <Circle className="w-6 h-6 mt-0.5 text-gray-300" aria-hidden="true" />
                    )}
                    <div>
                      <p className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                        {TRACKING_STAGE_LABELS[stage] || stage}
                      </p>
                      {historyEntry && (
                        <p className="text-xs text-gray-500">
                          {new Date(historyEntry.at).toLocaleString('he-IL')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {data.reminderEmailSentAt && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Mail className="w-4 h-4" aria-hidden="true" />
                נשלחה תזכורת ביום {new Date(data.reminderEmailSentAt).toLocaleDateString('he-IL')}
              </div>
            )}
          </CardContent>
        </Card>

        {data.location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" aria-hidden="true" />
                מיקום הצוות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                עודכן לאחרונה: {new Date(data.location.updatedAt).toLocaleString('he-IL')}
                {data.location.address ? ` · ${data.location.address}` : ''}
              </p>
              <div className="rounded-lg overflow-hidden border" style={{ height: 300 }}>
                <iframe
                  title="מיקום הצוות"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}&z=15&output=embed`}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link to="/demo">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              לאתר העסק
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/demo/contact">צור קשר</Link>
          </Button>
        </div>
      </main>

      {token && <CustomerAiChat trackingToken={token} />}
    </div>
  );
};

export default Tracking;
