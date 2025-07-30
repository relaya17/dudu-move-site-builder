

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const BusinessHoursCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="ml-2 h-5 w-5 text-blue-600" />
          שעות פעילות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>ימים א'-ה'</span>
            <span>07:00 - 19:00</span>
          </div>
          <div className="flex justify-between">
            <span>יום ו'</span>
            <span>08:00 - 17:00</span>
          </div>
          <div className="flex justify-between">
            <span>יום שבת</span>
            <span>סגור</span>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-blue-600 font-medium">שירות לקוחות זמין 24/7</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
