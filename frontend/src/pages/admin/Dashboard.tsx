import React, { useState, useEffect } from 'react';
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
  BarChart,
  Bar
} from 'recharts';
import { db } from '@/config/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { NotificationService } from "@/services/NotificationService";
import { ReportService } from "@/services/ReportService";
import { AiAssistant } from "@/components/admin/AiAssistant";
import { useToast } from "@/components/ui/use-toast";

interface Move {
  id: string;
  customer_id: string;
  date: string;
  totalPrice: number;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [moves, setMoves] = useState<Move[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
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
        description: `הובלה מתוכננת ל-${new Date(move.date).toLocaleDateString('he-IL')} עדיין ממתינה לאישור`,
        variant: 'destructive',
      });
    });

    // התראות על הובלות בסכום גבוה
    NotificationService.subscribeToHighValueMoves((move) => {
      toast({
        title: 'הובלה בסכום גבוה!',
        description: `התקבלה הזמנת הובלה בסך ${move.price_estimate.totalPrice}₪`,
        variant: 'default',
      });
    });
  };

  const fetchMoves = async () => {
    try {
      const movesRef = collection(db, 'moves');
      const q = query(movesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const movesData: Move[] = [];
      let total = 0;
      const monthly: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const moveData = doc.data();
        const move = {
          id: doc.id,
          ...moveData,
          date: moveData.date,
          totalPrice: moveData.price_estimate?.totalPrice || 0,
          customer: moveData.customer || {}
        } as Move;

        movesData.push(move);
        total += move.totalPrice;

        const monthYear = new Date(move.date).toLocaleDateString('he-IL', { 
          year: 'numeric', 
          month: 'long' 
        });
        monthly[monthYear] = (monthly[monthYear] || 0) + move.totalPrice;
      });

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

  return (
    <div className="p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">דשבורד ניהול</h1>
        <Button onClick={handleExportReport}>ייצא דוח חודשי</Button>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="moves">הובלות</TabsTrigger>
          <TabsTrigger value="ai">המלצות AI</TabsTrigger>
          <TabsTrigger value="reports">דוחות</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>סה"כ הכנסות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הובלות החודש</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{moves.filter(m => 
                  new Date(m.date).getMonth() === new Date().getMonth()
                ).length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הובלות ממתינות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{moves.filter(m => m.status === 'pending').length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>הכנסות חודשיות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="הכנסות" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moves">
          <Card>
            <CardHeader>
              <CardTitle>רשימת הובלות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-right p-2">תאריך</th>
                      <th className="text-right p-2">לקוח</th>
                      <th className="text-right p-2">טלפון</th>
                      <th className="text-right p-2">סטטוס</th>
                      <th className="text-right p-2">מחיר</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moves.map(move => (
                      <tr key={move.id} className="border-t">
                        <td className="p-2">{new Date(move.date).toLocaleDateString('he-IL')}</td>
                        <td className="p-2">{move.customer?.name}</td>
                        <td className="p-2">{move.customer?.phone}</td>
                        <td className="p-2">{move.status}</td>
                        <td className="p-2">₪{move.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <AiAssistant />
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>דוח יומי</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => ReportService.generateDailyReport(new Date())}>
                  הורד דוח יומי
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>דוח חודשי</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportReport}>
                  הורד דוח חודשי
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;