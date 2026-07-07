import { useEffect, useRef, useState } from 'react';
import MovingEstimateService from '@/services/movingEstimateService';
import { MovingEstimateRequest, TRACKING_STAGES, TRACKING_STAGE_LABELS, TrackingStage } from '@/types/movingEstimate';
import { printQuote } from '@/lib/quotePrint';
import { IssueInvoiceDialog } from '@/components/admin/IssueInvoiceDialog';
import type { PaymentMethod, BusinessSettingsDTO } from 'shared';
import { usePageMeta } from '@/hooks/usePageMeta';

// מעקב חי (רציף) - מרווח מינימלי בין שליחות מיקום לשרת, כדי לא להעמיס רשת/סוללה.
const LIVE_TRACKING_MIN_INTERVAL_MS = 20000;

const MovingEstimatesAdminPage = () => {
  // דף ניהול פרטי - לא רלוונטי לחיפוש.
  usePageMeta({ title: 'ניהול הערכות מחיר | Movalo', noindex: true });

  const [estimates, setEstimates] = useState<MovingEstimateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveTrackingEstimateId, setLiveTrackingEstimateId] = useState<string | null>(null);
  const [invoiceDialogEstimate, setInvoiceDialogEstimate] = useState<MovingEstimateRequest | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettingsDTO | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef<number>(0);

  // עוצר מעקב חי בעת יציאה מהעמוד/סגירת הטאב, כדי לא להשאיר watch פעיל בלי צורך.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      const data = await MovingEstimateService.getAllEstimates();
      setEstimates(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching moving estimates:', err);
      setError('שגיאה בטעינת בקשות ההערכה');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
    // דרוש להצגת שם/פרטי העסק האמיתיים על גבי הצעת המחיר המודפסת (ולא שם קבוע) -
    // ר' quotePrint.ts. כישלון בטעינה לא חוסם את הדף - ההדפסה תיפול חזרה לברירת מחדל.
    MovingEstimateService.getBusinessSettings()
      .then(setBusinessSettings)
      .catch((err) => console.error('שגיאה בטעינת הגדרות העסק:', err));
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setBusyId(id);
      await MovingEstimateService.updateEstimateStatus(id, status);
      setEstimates(prev => prev.map(e => (e._id === id ? { ...e, status } : e)));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('שגיאה בעדכון הסטטוס');
    } finally {
      setBusyId(null);
    }
  };

  const handleStageChange = async (estimate: MovingEstimateRequest, stage: TrackingStage) => {
    try {
      setBusyId(estimate._id);
      await MovingEstimateService.updateTrackingStage(estimate.trackingToken, stage);
      setEstimates(prev => prev.map(e => (e._id === estimate._id ? { ...e, stage } : e)));
    } catch (err) {
      console.error('Error updating stage:', err);
      alert('שגיאה בעדכון שלב המעקב');
    } finally {
      setBusyId(null);
    }
  };

  const handleUpdateLocation = (estimate: MovingEstimateRequest) => {
    if (!navigator.geolocation) {
      alert('הדפדפן לא תומך באיתור מיקום');
      return;
    }

    setBusyId(estimate._id);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await MovingEstimateService.updateTrackingLocation(estimate.trackingToken, latitude, longitude);
          setEstimates(prev => prev.map(e => (
            e._id === estimate._id
              ? { ...e, location: { lat: latitude, lng: longitude, updatedAt: new Date().toISOString() } }
              : e
          )));
        } catch (err) {
          console.error('Error updating location:', err);
          alert('שגיאה בעדכון המיקום');
        } finally {
          setBusyId(null);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        alert('לא ניתן היה לאתר את המיקום הנוכחי');
        setBusyId(null);
      }
    );
  };

  /**
   * מעקב חי (רציף): שולח מיקום אוטומטית כל עוד העמוד פתוח ומסך הטלפון דלוק -
   * בלי צורך ללחוץ בכל פעם. נעצר אוטומטית אם סוגרים את הטאב/עוברים אפליקציה
   * (מגבלת דפדפן - למעקב שממשיך גם עם מסך כבוי/ברקע נדרשת אפליקציה נייטיבית).
   */
  const handleToggleLiveTracking = (estimate: MovingEstimateRequest) => {
    if (liveTrackingEstimateId === estimate._id) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLiveTrackingEstimateId(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('הדפדפן לא תומך באיתור מיקום');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    lastSentAtRef.current = 0;
    setLiveTrackingEstimateId(estimate._id);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        if (now - lastSentAtRef.current < LIVE_TRACKING_MIN_INTERVAL_MS) {
          return; // עדיין בתוך חלון ה-throttle - מדלגים על השליחה הזו
        }
        lastSentAtRef.current = now;

        try {
          const { latitude, longitude } = position.coords;
          await MovingEstimateService.updateTrackingLocation(estimate.trackingToken, latitude, longitude);
          setEstimates(prev => prev.map(e => (
            e._id === estimate._id
              ? { ...e, location: { lat: latitude, lng: longitude, updatedAt: new Date().toISOString() } }
              : e
          )));
        } catch (err) {
          console.error('Error updating live location:', err);
        }
      },
      (geoError) => {
        console.error('Geolocation watch error:', geoError);
        alert('מעקב חי הופסק - ודא שהמסך דלוק ושאישרת גישה למיקום בדפדפן');
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setLiveTrackingEstimateId(null);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  };

  const handleIssueQuote = async (estimate: MovingEstimateRequest) => {
    try {
      setBusyId(estimate._id);
      const updated = await MovingEstimateService.issueQuote(estimate._id);
      setEstimates(prev => prev.map(e => (e._id === estimate._id ? updated : e)));
      printQuote(updated, businessSettings);
    } catch (err) {
      console.error('Error issuing quote:', err);
      alert('שגיאה בהפקת הצעת המחיר');
    } finally {
      setBusyId(null);
    }
  };

  // פתיחת הזמנת חשבונית - במקום confirm() פשוט, מציגים דיאלוג "פרטי תשלום"
  // (ר' IssueInvoiceDialog) כי אמצעי תשלום הוא שדה חובה לפי הוראות ניהול ספרים.
  const handleIssueInvoice = (estimate: MovingEstimateRequest) => {
    setInvoiceDialogEstimate(estimate);
  };

  const handleConfirmIssueInvoice = async (details: { paymentMethod: PaymentMethod; customerIdNumber?: string }) => {
    const estimate = invoiceDialogEstimate;
    if (!estimate) return;
    try {
      setBusyId(estimate._id);
      const updated = await MovingEstimateService.issueInvoice(estimate._id, details);
      setEstimates(prev => prev.map(e => (e._id === estimate._id ? updated : e)));
      setInvoiceDialogEstimate(null);
    } catch (err) {
      console.error('Error issuing invoice:', err);
      alert(err instanceof Error ? err.message : 'שגיאה בהפקת החשבונית');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">ניהול הערכות מחיר להובלות דירה</h1>

      <main>
        {loading && <p role="status" aria-live="polite">טוען...</p>}
        {error && <p className="text-red-600" role="alert">{error}</p>}
        {!loading && estimates.length === 0 && <p>אין בקשות להערכת מחיר כרגע</p>}

        <ul className="list-none p-0 m-0">
          {estimates.map((estimate) => (
            <li key={estimate._id}>
              <article aria-label={`בקשת הערכת מחיר של ${estimate.name}`} className="border p-4 mb-4 rounded shadow-md bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">פרטי לקוח</h2>
                    <p><strong>שם:</strong> {estimate.name}</p>
                    <p><strong>טלפון:</strong> <a className="underline" href={`tel:${estimate.phone}`}>{estimate.phone}</a></p>
                    <p><strong>אימייל:</strong> <a className="underline" href={`mailto:${estimate.email}`}>{estimate.email}</a></p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">פרטי הדירה</h2>
                    <p><strong>סוג דירה:</strong> {estimate.apartmentType}</p>
                    <p><strong>קומה מ:</strong> {estimate.originFloor ?? 'לא צוין'}</p>
                    <p><strong>קומה אל:</strong> {estimate.destinationFloor ?? 'לא צוין'}</p>
                    <p><strong>מעלית מ:</strong> {estimate.originHasElevator ? 'יש' : 'אין'}</p>
                    <p><strong>מעלית אל:</strong> {estimate.destinationHasElevator ? 'יש' : 'אין'}</p>
                    <p><strong>מנוף מ:</strong> {estimate.originHasCrane ? 'נדרש' : 'לא נדרש'}</p>
                    <p><strong>מנוף אל:</strong> {estimate.destinationHasCrane ? 'נדרש' : 'לא נדרש'}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">פרטי ההובלה</h2>
                  <p><strong>תאריך מועדף:</strong> {estimate.preferredMoveDate}</p>
                  <p><strong>כתובת נוכחית:</strong> {estimate.currentAddress}</p>
                  <p><strong>כתובת יעד:</strong> {estimate.destinationAddress}</p>
                  {estimate.additionalNotes && <p><strong>הערות נוספות:</strong> {estimate.additionalNotes}</p>}
                  <p><strong>מחיר משוער:</strong> ₪{estimate.totalPrice}</p>
                </div>

                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">מצאי רהיטים</h2>
                  <p><strong>סה"כ פריטים:</strong> {estimate.inventory.length}</p>
                  <ul className="mt-2 list-none p-0 m-0">
                    {estimate.inventory.map((item, idx) => (
                      <li key={idx} className="border p-2 mb-2 rounded bg-gray-50">
                        <p><strong>סוג:</strong> {item.type}</p>
                        <p><strong>כמות:</strong> {item.quantity}</p>
                        {item.description && <p><strong>תיאור:</strong> {item.description}</p>}
                        <p><strong>שביר:</strong> {item.isFragile ? 'כן' : 'לא'}</p>
                        <p><strong>פירוק:</strong> {item.needsDisassemble ? 'כן' : 'לא'}</p>
                        <p><strong>הרכבה:</strong> {item.needsReassemble ? 'כן' : 'לא'}</p>
                        {item.comments && <p><strong>הערות:</strong> {item.comments}</p>}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap gap-2">
                  <p><strong>סטטוס:</strong> {estimate.status}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      disabled={busyId === estimate._id || estimate.status === 'approved'}
                      onClick={() => handleStatusChange(estimate._id, 'approved')}
                    >
                      אשר הערכת מחיר
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      disabled={busyId === estimate._id || estimate.status === 'rejected'}
                      onClick={() => handleStatusChange(estimate._id, 'rejected')}
                    >
                      דחה בקשה
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h2 className="text-lg font-semibold mb-2">מעקב הובלה</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <label htmlFor={`stage-${estimate._id}`} className="text-sm font-medium">שלב נוכחי:</label>
                    <select
                      id={`stage-${estimate._id}`}
                      className="border rounded px-2 py-1"
                      value={estimate.stage}
                      disabled={busyId === estimate._id}
                      onChange={(e) => handleStageChange(estimate, e.target.value as TrackingStage)}
                    >
                      {TRACKING_STAGES.map((stage) => (
                        <option key={stage} value={stage}>{TRACKING_STAGE_LABELS[stage]}</option>
                      ))}
                    </select>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      disabled={busyId === estimate._id || liveTrackingEstimateId === estimate._id}
                      onClick={() => handleUpdateLocation(estimate)}
                    >
                      עדכן מיקום חד-פעמי
                    </button>
                    <button
                      className={`px-3 py-1 rounded disabled:opacity-50 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        liveTrackingEstimateId === estimate._id
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                      disabled={busyId === estimate._id || (liveTrackingEstimateId !== null && liveTrackingEstimateId !== estimate._id)}
                      onClick={() => handleToggleLiveTracking(estimate)}
                    >
                      {liveTrackingEstimateId === estimate._id ? '⏹ עצור מעקב חי' : '▶ התחל מעקב חי (רציף)'}
                    </button>
                  </div>
                  {liveTrackingEstimateId === estimate._id && (
                    <p className="text-xs text-emerald-700 mb-2">
                      🟢 מעקב חי פעיל - יש להשאיר את הדף הזה פתוח ומסך הטלפון דלוק לאורך ההובלה. המיקום נשלח אוטומטית בערך כל 20 שניות.
                    </p>
                  )}
                  {estimate.location && (
                    <p className="text-sm text-gray-600">
                      מיקום אחרון: {estimate.location.lat.toFixed(5)}, {estimate.location.lng.toFixed(5)} · עודכן: {new Date(estimate.location.updatedAt).toLocaleString('he-IL')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 break-all">
                    קישור מעקב ללקוח: <a className="text-blue-600 underline" href={`/tracking/${estimate.trackingToken}`} target="_blank" rel="noreferrer">
                      /tracking/{estimate.trackingToken}
                    </a>
                  </p>
                </div>

                <div className="mt-4 border-t pt-4">
                  <h2 className="text-lg font-semibold mb-2">מסמכים</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      disabled={busyId === estimate._id}
                      onClick={() => handleIssueQuote(estimate)}
                    >
                      הפק הצעת מחיר (PDF)
                    </button>
                    <button
                      className="px-3 py-1 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      disabled={busyId === estimate._id || Boolean(estimate.invoice?.providerId)}
                      onClick={() => handleIssueInvoice(estimate)}
                    >
                      {estimate.invoice?.providerId ? 'חשבונית הופקה' : 'הפק חשבונית/קבלה'}
                    </button>
                  </div>
                  {estimate.quote?.quoteNumber && (
                    <p className="text-sm text-gray-600 mt-2">
                      מס&apos; הצעת מחיר: {estimate.quote.quoteNumber} · הופקה: {new Date(estimate.quote.generatedAt).toLocaleDateString('he-IL')}
                      <span className="block text-xs text-gray-400">(מסמך שיווקי בלבד, אינו חשבונית מס)</span>
                    </p>
                  )}
                  {estimate.invoice?.providerId && (
                    <p className="text-sm text-gray-600 mt-2">
                      חשבונית מס&apos; {estimate.invoice.documentNumber}
                      {estimate.invoice.allocationNumber && ` · מס' הקצאה: ${estimate.invoice.allocationNumber}`}
                      {' · '}
                      {estimate.invoice.documentUrl ? (
                        <a className="text-blue-600 underline" href={estimate.invoice.documentUrl} target="_blank" rel="noreferrer">
                          צפייה במסמך
                        </a>
                      ) : 'ללא קישור זמין'}
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>

      {invoiceDialogEstimate && (
        <IssueInvoiceDialog
          open={Boolean(invoiceDialogEstimate)}
          onOpenChange={(open) => !open && setInvoiceDialogEstimate(null)}
          totalPrice={invoiceDialogEstimate.totalPrice}
          customerName={invoiceDialogEstimate.name}
          loading={busyId === invoiceDialogEstimate._id}
          onConfirm={handleConfirmIssueInvoice}
        />
      )}
    </div>
  );
};

export default MovingEstimatesAdminPage;
