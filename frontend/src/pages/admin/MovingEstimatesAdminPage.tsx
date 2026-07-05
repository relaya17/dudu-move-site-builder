import { useEffect, useState } from 'react';
import MovingEstimateService from '@/services/movingEstimateService';
import { MovingEstimateRequest, TRACKING_STAGES, TRACKING_STAGE_LABELS, TrackingStage } from '@/types/movingEstimate';

const MovingEstimatesAdminPage = () => {
  const [estimates, setEstimates] = useState<MovingEstimateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-4" dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">ניהול הערכות מחיר להובלות דירה</h1>

      {loading && <p>טוען...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && estimates.length === 0 && <p>אין בקשות להערכת מחיר כרגע</p>}

      {estimates.map((estimate) => (
        <div key={estimate._id} className="border p-4 mb-4 rounded shadow-md bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">פרטי לקוח</h2>
              <p><strong>שם:</strong> {estimate.name}</p>
              <p><strong>טלפון:</strong> {estimate.phone}</p>
              <p><strong>אימייל:</strong> {estimate.email}</p>
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
            <div className="mt-2">
              {estimate.inventory.map((item, idx) => (
                <div key={idx} className="border p-2 mb-2 rounded bg-gray-50">
                  <p><strong>סוג:</strong> {item.type}</p>
                  <p><strong>כמות:</strong> {item.quantity}</p>
                  {item.description && <p><strong>תיאור:</strong> {item.description}</p>}
                  <p><strong>שביר:</strong> {item.isFragile ? 'כן' : 'לא'}</p>
                  <p><strong>פירוק:</strong> {item.needsDisassemble ? 'כן' : 'לא'}</p>
                  <p><strong>הרכבה:</strong> {item.needsReassemble ? 'כן' : 'לא'}</p>
                  {item.comments && <p><strong>הערות:</strong> {item.comments}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
            <p><strong>סטטוס:</strong> {estimate.status}</p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                disabled={busyId === estimate._id || estimate.status === 'approved'}
                onClick={() => handleStatusChange(estimate._id, 'approved')}
              >
                אשר הערכת מחיר
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                disabled={busyId === estimate._id}
                onClick={() => handleUpdateLocation(estimate)}
              >
                עדכן את מיקומי הנוכחי (GPS)
              </button>
            </div>
            {estimate.location && (
              <p className="text-sm text-gray-600">
                מיקום אחרון: {estimate.location.lat.toFixed(5)}, {estimate.location.lng.toFixed(5)} · עודכן: {new Date(estimate.location.updatedAt).toLocaleString('he-IL')}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              קישור מעקב ללקוח: <a className="text-blue-600 underline" href={`/tracking/${estimate.trackingToken}`} target="_blank" rel="noreferrer">
                /tracking/{estimate.trackingToken}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovingEstimatesAdminPage;
