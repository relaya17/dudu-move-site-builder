import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, MapPin, ArrowLeft, Mail, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

const STAGE_LABELS: Record<string, string> = {
  order_placed: 'ההזמנה התקבלה',
  confirmed: 'ההזמנה אושרה',
  packing_disassembly: 'פירוק ואריזה',
  in_transit: 'בדרך ליעד',
  unloading_assembly: 'פריקה והרכבה',
  completed: 'ההובלה הושלמה'
};

interface StageHistoryEntry {
  stage: string;
  at: string;
  note?: string;
}

interface TrackingLocation {
  lat: number;
  lng: number;
  address?: string;
  updatedAt: string;
}

interface TrackingView {
  trackingToken: string;
  name: string;
  apartmentType: string;
  preferredMoveDate: string;
  currentAddress: string;
  destinationAddress: string;
  status: string;
  stage: string;
  stages: string[];
  stageHistory: StageHistoryEntry[];
  location: TrackingLocation | null;
  reminderEmailSentAt: string | null;
  reminderSmsSentAt: string | null;
  createdAt: string;
}

export const Tracking = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TrackingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <p className="text-gray-600">טוען נתוני מעקב...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-600">{error || 'לא נמצאו נתוני מעקב'}</p>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                חזרה לדף הבית
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stages = data.stages;
  const currentIndex = stages.indexOf(data.stage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>מעקב אחרי ההובלה של {data.name}</span>
              <button
                onClick={() => { setLoading(true); fetchTracking(); }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="רענן"
                title="רענן"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p><strong>מ:</strong> {data.currentAddress}</p>
            <p><strong>אל:</strong> {data.destinationAddress}</p>
            <p><strong>תאריך הובלה מתוכנן:</strong> {data.preferredMoveDate}</p>
          </CardContent>
        </Card>

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
                  <div key={stage} className="flex items-start gap-3">
                    {isDone || isCurrent ? (
                      <CheckCircle2 className={`w-6 h-6 mt-0.5 ${isCurrent ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <Circle className="w-6 h-6 mt-0.5 text-gray-300" />
                    )}
                    <div>
                      <p className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                        {STAGE_LABELS[stage] || stage}
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
                <Mail className="w-4 h-4" />
                נשלחה תזכורת ביום {new Date(data.reminderEmailSentAt).toLocaleDateString('he-IL')}
              </div>
            )}
          </CardContent>
        </Card>

        {data.location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
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

        <div className="text-center">
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              חזרה לדף הבית
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
