
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
import { Card, CardContent } from '@/components/ui/card';
import { legalConfig } from '@/config/legal';

export const AccessibilityStatement = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm">הצהרת נגישות</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>הצהרת נגישות</DialogTitle>
          <DialogDescription>
            גרסה {legalConfig.accessibility.version} | עודכן לאחרונה: {legalConfig.accessibility.lastUpdated}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 mb-4">{legalConfig.accessibility.statement}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">תכונות נגישות באתר</h3>
                <ul className="list-disc list-inside space-y-2">
                  {legalConfig.accessibility.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">יצירת קשר בנושאי נגישות</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">רכז נגישות: {legalConfig.accessibility.contact.name}</p>
                  <p className="text-gray-600">
                    דוא"ל:{' '}
                    <a href={`mailto:${legalConfig.accessibility.contact.email}`} className="text-blue-600 hover:underline">
                      {legalConfig.accessibility.contact.email}
                    </a>
                  </p>
                  <p className="text-gray-600">
                    טלפון:{' '}
                    <a href={`tel:${legalConfig.accessibility.contact.phone}`} className="text-blue-600 hover:underline">
                      {legalConfig.accessibility.contact.phone}
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500">
              <p>
                אנו מתחייבים להנגיש את האתר ברמה AA לפי תקן WCAG 2.1 ולעמוד בדרישות תקנות שוויון זכויות
                לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};