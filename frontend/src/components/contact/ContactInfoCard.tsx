
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

export const ContactInfoCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="ml-2 h-5 w-5 text-blue-600" />
          פרטי יצירת קשר
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Phone className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-semibold">טלפון</p>
            <p className="text-gray-600">0547777623</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <Mail className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-semibold">אימייל</p>
            <p className="text-gray-600">info@davidmoving.co.il</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <MapPin className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-semibold">כתובת</p>
            <p className="text-gray-600"><br />אילת, ישראל</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
