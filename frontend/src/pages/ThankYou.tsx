import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Phone, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            תודה על פנייתך!
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            דודו הובלות נשמח לעמוד לשירותכם
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              הערכת המחיר שלך נשלחה בהצלחה לכתובת המייל שציינת.
            </p>
            <p className="text-gray-700 mb-6">
              נציג שלנו יצור איתך קשר תוך 24 שעות כדי לאשר את הפרטים ולקבע תאריך להובלה.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              מה קורה עכשיו?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">קבלת מייל אישור</p>
                  <p className="text-sm text-gray-600">הערכת המחיר המלאה נשלחה למייל שלך</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">יצירת קשר</p>
                  <p className="text-sm text-gray-600">נציג יצור איתך קשר תוך 24 שעות</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">קביעת תאריך</p>
                  <p className="text-sm text-gray-600">נקבע תאריך וזמן להובלה</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">הובלה מקצועית</p>
                  <p className="text-sm text-gray-600">צוות מקצועי יגיע בזמן לביצוע ההובלה</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-600" />
              פרטי יצירת קשר
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-medium text-gray-900">טלפון</p>
                <p className="text-blue-600 font-semibold">03-1234567</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">אימייל</p>
                <p className="text-blue-600 font-semibold">info@dudu-move.co.il</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">שעות פעילות: א'-ה' 8:00-20:00</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                חזרה לדף הבית
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <a href="tel:03-1234567">
                <Phone className="w-4 h-4 mr-2" />
                התקשר עכשיו
              </a>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>מספר בקשה: {new Date().getTime().toString().slice(-6)}</p>
            <p>תאריך: {new Date().toLocaleDateString('he-IL')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 