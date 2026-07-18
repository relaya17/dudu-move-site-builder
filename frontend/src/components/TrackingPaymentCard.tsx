import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, Landmark, Loader2, CheckCircle2 } from 'lucide-react';
import type { TrackingViewDTO } from 'shared';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

type PaymentState = NonNullable<TrackingViewDTO['payment']>;

const STATUS_LABEL: Record<string, string> = {
  unpaid: 'לא שולם',
  pending: 'ממתין לאישור',
  paid: 'שולם',
  failed: 'נכשל',
  refunded: 'הוחזר',
};

export function TrackingPaymentCard({
  token,
  initialPayment,
  onUpdated,
}: {
  token: string;
  initialPayment: TrackingViewDTO['payment'];
  onUpdated: () => void;
}) {
  const [payment, setPayment] = useState<PaymentState | null>(initialPayment);
  const [busy, setBusy] = useState<string | null>(null);
  const [info, setInfo] = useState('');

  useEffect(() => {
    setPayment(initialPayment);
  }, [initialPayment]);

  useEffect(() => {
    if (initialPayment || !token) return;
    let cancelled = false;
    (async () => {
      setBusy('load');
      try {
        const res = await fetch(`${API_BASE_URL}/api/tracking/${token}/payment`);
        const json = await res.json();
        if (!cancelled && json.success && json.data?.payment) {
          setPayment(json.data.payment);
        }
      } catch {
        /* silent — משתמש יכול לטעון ידנית */
      } finally {
        if (!cancelled) setBusy(null);
      }
    })();
    return () => { cancelled = true; };
  }, [token, initialPayment]);

  const call = async (path: string, method: 'GET' | 'POST' = 'POST') => {
    setBusy(path);
    setInfo('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/tracking/${token}/payment${path}`, { method });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setInfo(json.message || 'שגיאה');
        return;
      }
      const next = json.data?.payment;
      if (next) setPayment(next);
      if (json.data?.message) setInfo(json.data.message);
      else if (json.data?.demo) setInfo('מצב הדגמה — לחצו "אשר תשלום" להשלמה.');
      onUpdated();
    } catch {
      setInfo('שגיאת תקשורת');
    } finally {
      setBusy(null);
    }
  };

  const amount = payment?.amount ?? 0;
  const paid = payment?.status === 'paid';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          תשלום אונליין
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!payment ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {busy === 'load' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            טוען אפשרויות תשלום...
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className={`rounded-full px-3 py-1 border ${paid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
                {paid && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1" />}
                {STATUS_LABEL[payment.status] || payment.status}
              </span>
              <span className="rounded-full px-3 py-1 border bg-gray-50 text-gray-700">
                ₪{amount.toLocaleString('he-IL')}
              </span>
              <span className="rounded-full px-3 py-1 border bg-gray-50 text-gray-700" dir="ltr">
                אסמכתא: {payment.reference}
              </span>
            </div>

            {!paid && (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 justify-start"
                  disabled={!!busy}
                  onClick={async () => {
                    await call('/card');
                  }}
                >
                  {busy === '/card' ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <CreditCard className="w-4 h-4 ml-2" />}
                  תשלום בכרטיס אשראי
                </Button>
                {payment.channel === 'card_demo' && payment.status === 'pending' && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!!busy}
                    onClick={() => call('/card/confirm-demo')}
                  >
                    {busy === '/card/confirm-demo' ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    אשר תשלום (הדגמה)
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start"
                  disabled={!!busy}
                  onClick={() => call('/bank-transfer')}
                >
                  {busy === '/bank-transfer' ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Building2 className="w-4 h-4 ml-2" />}
                  העברה בנקאית — סיימתי להעביר
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start"
                  disabled={!!busy}
                  onClick={() => call('/open-banking')}
                >
                  {busy === '/open-banking' ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Landmark className="w-4 h-4 ml-2" />}
                  חיבור Open Banking (מעקב תשלומים)
                </Button>
              </div>
            )}

            {payment.bankTransfer && (
              <div className="rounded-lg bg-slate-50 border p-3 text-sm space-y-1">
                <p className="font-medium text-gray-800">פרטי העברה</p>
                <p>בנק: {payment.bankTransfer.bankName}</p>
                <p>על שם: {payment.bankTransfer.accountName}</p>
                <p dir="ltr">חשבון: {payment.bankTransfer.accountNumber}</p>
                {payment.bankTransfer.branch && <p>סניף: {payment.bankTransfer.branch}</p>}
                <p className="text-gray-600 text-xs leading-relaxed">{payment.bankTransfer.instructionsHe}</p>
              </div>
            )}

            {payment.openBankingStatus && payment.openBankingStatus !== 'none' && (
              <p className="text-xs text-slate-600">
                Open Banking: {payment.openBankingStatus === 'pending' ? 'ממתין לחיבור ספק מורשה' : payment.openBankingStatus}
              </p>
            )}
          </>
        )}
        {info && <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{info}</p>}
      </CardContent>
    </Card>
  );
}
