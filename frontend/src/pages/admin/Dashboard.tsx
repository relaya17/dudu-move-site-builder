import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { NotificationService } from "@/services/NotificationService";
import { ReportService } from "@/services/ReportService";
import { AiAssistant } from "@/components/admin/AiAssistant";
import { useToast } from "@/components/ui/use-toast";
import { adminHeaders } from "@/lib/adminApi";

interface MoveRecord {
  id: string;
  customer_id: string;
  created_at: string;
  preferred_move_date?: string;
  totalPrice: number;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{ month: string; amount: number }[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchMoves();
    setupNotifications();
    return () => {
      NotificationService.unsubscribeAll();
    };
  }, []);

  const setupNotifications = () => {
    // התראות על הובלות חדשות
    NotificationService.subscribeToNewMoves((move) => {
      toast({
        title: 'הובלה חדשה!',
        description: `התקבלה בקשת הובלה חדשה מ${move.customer?.name}`,
      });
    });

    // התראות על הובלות דחופות
    NotificationService.subscribeToUrgentMoves((move) => {
      toast({
        title: 'הובלה דחופה!',
        description: `הובלה מתוכננת ל-${new Date(move.preferred_move_date ?? move.created_at ?? Date.now()).toLocaleDateString('he-IL')} עדיין ממתינה לאישור`,
        variant: 'destructive',
      });
    });

    // התראות על הובלות בסכום גבוה
    NotificationService.subscribeToHighValueMoves((move) => {
      toast({
        title: 'הובלה בסכום גבוה!',
        description: `התקבלה הזמנת הובלה בסך ${move.price_estimate?.totalPrice ?? 0}₪`,
        variant: 'default',
      });
    });
  };

  const API_ROOT = import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://dudu-move-backend.onrender.com');

  const fetchMoves = async () => {
    try {
      const response = await fetch(`${API_ROOT}/api/mongo/estimates?limit=500`, { headers: adminHeaders() });
      const result = await response.json();
      const estimates: Array<{
        _id: string; name: string; phone: string; createdAt: string;
        preferredMoveDate?: string; totalPrice: number; status: string;
      }> = result.data || [];

      const movesData: MoveRecord[] = [];
      let total = 0;
      const monthly: { [key: string]: number } = {};

      for (const estimate of estimates) {
        const move: MoveRecord = {
          id: estimate._id,
          customer_id: estimate._id,
          created_at: new Date(estimate.createdAt).toISOString(),
          preferred_move_date: estimate.preferredMoveDate,
          totalPrice: estimate.totalPrice ?? 0,
          status: estimate.status ?? 'pending',
          customer: { name: estimate.name, phone: estimate.phone },
        };

        movesData.push(move);
        total += move.totalPrice;

        const monthYear = new Date(move.created_at).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long'
        });
        monthly[monthYear] = (monthly[monthYear] || 0) + move.totalPrice;
      }

      setMoves(movesData);
      setTotalRevenue(total);
      setMonthlyData(Object.entries(monthly).map(([month, amount]) => ({
        month,
        amount
      })));
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הובלות:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בטעינת הנתונים',
        variant: 'destructive',
      });
    }
  };

  const handleExportReport = async () => {
    try {
      const today = new Date();
      const monthlyReport = await ReportService.generateMonthlyReport(
        today.getFullYear(),
        today.getMonth()
      );
      
      await ReportService.exportToExcel(
        monthlyReport.moves,
        `דוח_הובלות_${monthlyReport.month}`
      );

      toast({
        title: 'הדוח הורד בהצלחה',
        description: 'הדוח נשמר בתיקיית ההורדות שלך',
      });
    } catch (error) {
      console.error('שגיאה בייצוא הדוח:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה בייצוא הדוח',
        variant: 'destructive',
      });
    }
  };

  const thisMonthMoves = moves.filter(m =>
    new Date(m.created_at).getMonth() === new Date().getMonth() &&
    new Date(m.created_at).getFullYear() === new Date().getFullYear()
  );
  const pendingMoves = moves.filter(m => m.status === 'pending');

  const STATUS_LABELS: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'מאושר',
    in_progress: 'בביצוע',
    completed: 'הושלם',
    cancelled: 'בוטל',
  };
  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* כותרת */}
      <header className="bg-gradient-to-l from-blue-700 to-indigo-800 text-white px-4 sm:px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              🚛 דוד הובלות — מרכז ניהול
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Button
            onClick={handleExportReport}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 gap-2"
          >
            ייצא דוח חודשי
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6 bg-white shadow-sm border w-full sm:w-auto">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">סקירה</TabsTrigger>
            <TabsTrigger value="moves" className="flex-1 sm:flex-none">הובלות</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 sm:flex-none">🤖 לאה AI</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 sm:flex-none">דוחות</TabsTrigger>
          </TabsList>

          {/* סקירה כללית */}
          <TabsContent value="overview">
            {/* כרטיסי KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="border-r-4 border-r-green-500 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">סה"כ הכנסות</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">₪{totalRevenue.toLocaleString('he-IL')}</p>
                  <p className="text-xs text-gray-400 mt-1">מ-{moves.length} הובלות</p>
                </CardContent>
              </Card>

              <Card className="border-r-4 border-r-blue-500 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">הובלות החודש</CardTitle>
                </CardHeader>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">ממתינות לאישור</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">{pendingMoves.length}</p>
                  <p className="text-xs text-gray-400 mt-1">מתוך {moves.length} סה"כ</p>
                </CardContent>
              </Card>
            </div>

            {/* גרף הכנסות */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">הכנסות חודשיות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₪${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`₪${v.toLocaleString('he-IL')}`, 'הכנסות']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="הכנסות"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* הובלות */}
          <TabsContent value="moves">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">רשימת הובלות ({moves.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600">תאריך</th>
                        <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600">לקוח</th>
                        <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">טלפון</th>
                        <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                        <th scope="col" className="text-right px-4 py-3 font-medium text-gray-600">מחיר</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {moves.map(move => (
                        <tr key={move.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(move.created_at).toLocaleDateString('he-IL')}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{move.customer?.name}</td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{move.customer?.phone}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[move.status] ?? 'bg-gray-100 text-gray-700'}`}>
                              {STATUS_LABELS[move.status] ?? move.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            ₪{move.totalPrice.toLocaleString('he-IL')}
                          </td>
                        </tr>
                      ))}
                      {moves.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                            אין הובלות להצגה
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* מזכירה AI */}
          <TabsContent value="ai">
            <AiAssistant />
          </TabsContent>

          {/* דוחות */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">דוח יומי</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">הורד סיכום הובלות להיום</p>
                  <Button
                    variant="outline"
                    onClick={() => ReportService.generateDailyReport(new Date())}
                    className="w-full"
                  >
                    הורד דוח יומי
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">דוח חודשי</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">ייצא Excel עם כל הובלות החודש</p>
                  <Button onClick={handleExportReport} className="w-full">
                    ייצא לאקסל
                  </Button>
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