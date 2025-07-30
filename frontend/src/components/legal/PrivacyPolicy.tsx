import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Lock, Share2 } from 'lucide-react';
import { legalConfig } from '@/config/legal';

export const PrivacyPolicy = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm">מדיניות פרטיות</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>מדיניות פרטיות</DialogTitle>
          <DialogDescription>
            גרסה {legalConfig.privacyPolicy.version} | עודכן לאחרונה: {legalConfig.privacyPolicy.lastUpdated}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {legalConfig.privacyPolicy.sections.map((section, index) => (
              <Alert key={index} className="border-2">
                <div className="flex items-start gap-4">
                  {index === 0 && <Shield className="h-5 w-5" />}
                  {index === 1 && <Lock className="h-5 w-5" />}
                  {index === 2 && <Share2 className="h-5 w-5" />}
                  <div>
                    <AlertTitle className="mb-2">{section.title}</AlertTitle>
                    <AlertDescription>{section.content}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}

            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold">זכויותיך</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>הזכות לעיין במידע שנאסף עליך</li>
                <li>הזכות לתקן מידע לא מדויק</li>
                <li>הזכות למחוק את המידע שלך</li>
                <li>הזכות להתנגד לעיבוד המידע</li>
                <li>הזכות לקבל את המידע בפורמט דיגיטלי</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">אבטחת מידע</h3>
              <p className="text-gray-600">
                אנו נוקטים באמצעי אבטחה מתקדמים להגנה על המידע שלך, כולל:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>הצפנת SSL/TLS בתקשורת</li>
                <li>הצפנת מידע רגיש במסד הנתונים</li>
                <li>גיבויים מאובטחים</li>
                <li>ניטור אבטחה 24/7</li>
                <li>הרשאות גישה מוגבלות</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">יצירת קשר בנושאי פרטיות</h3>
              <p className="text-gray-600">
                לכל שאלה או בקשה בנושא פרטיות, ניתן לפנות למחלקת הגנת הפרטיות שלנו:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>דוא"ל: privacy@dudu-move.co.il</p>
                <p>טלפון: 03-1234567</p>
                <p>כתובת: רחוב הראשונים 1, תל אביב</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};