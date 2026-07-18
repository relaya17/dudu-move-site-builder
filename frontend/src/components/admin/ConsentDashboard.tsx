import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ConsentReportService } from '@/services/ConsentReportService';
import { TermsNotificationService } from '@/services/TermsNotificationService';

export const ConsentDashboard = () => {
  const [report, setReport] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const [reportData, trendData, updateData] = await Promise.all([
        ConsentReportService.generateReport(startDate, endDate),
        ConsentReportService.getTrends(30),
        TermsNotificationService.getLatestUpdates()
      ]);

      setReport(reportData);
      setTrends(trendData);
      setUpdates(updateData);
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הסכמות:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const blob = await ConsentReportService.exportToExcel(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `דוח_הסכמות_${new Date().toLocaleDateString('he-IL')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('שגיאה בייצוא דוח:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">ניהול הסכמות</h2>
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          ייצוא דוח
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              הסכמות פעילות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.activeConsents || 0}</div>
            <p className="text-sm text-gray-500">
              {report?.conversionRate?.toFixed(1)}% אחוז המרה
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              הסכמות שיווקיות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.marketingConsents || 0}</div>
            <p className="text-sm text-gray-500">
              {((report?.marketingConsents / report?.totalConsents) * 100)?.toFixed(1)}% מסך ההסכמות
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ביטולים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.recentWithdrawals || 0}</div>
            <p className="text-sm text-gray-500">
              ב-30 הימים האחרונים
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">מגמות</TabsTrigger>
          <TabsTrigger value="versions">גרסאות</TabsTrigger>
          <TabsTrigger value="updates">עדכונים אחרונים</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>מגמות הסכמה - 30 ימים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="active" name="הסכמות פעילות" stroke="#0088FE" />
                    <Line type="monotone" dataKey="marketing" name="הסכמות שיווקיות" stroke="#00C49F" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>התפלגות גרסאות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(report?.consentsByVersion || {}).map(([version, count]) => ({
                        name: version,
                        value: count
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {Object.entries(report?.consentsByVersion || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates">
          <Card>
            <CardHeader>
              <CardTitle>עדכוני תנאים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <Alert key={index}>
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{update.summary}</div>
                          <div className="text-sm text-gray-500">
                            גרסה {update.version} | {new Date(update.effectiveDate).toLocaleDateString('he-IL')}
                          </div>
                        </div>
                        {update.requiresReConsent && (
                          <span className="text-red-500 text-sm">דורש אישור מחדש</span>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};