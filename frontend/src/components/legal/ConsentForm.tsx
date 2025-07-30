import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { TermsModal } from './TermsModal';
import { PrivacyPolicy } from './PrivacyPolicy';

interface ConsentFormProps {
  onConsent: (consented: boolean) => void;
  onClose?: () => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({ onConsent, onClose }) => {
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [showError, setShowError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consents.terms || !consents.privacy) {
      setShowError(true);
      return;
    }

    onConsent(true);
    if (onClose) onClose();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>הסכמה לתנאי השימוש ומדיניות הפרטיות</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {showError && (
            <Alert variant="destructive">
              <AlertDescription>
                יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-start space-x-4 space-x-reverse">
              <Checkbox
                id="terms"
                checked={consents.terms}
                onCheckedChange={(checked) => {
                  setConsents(prev => ({ ...prev, terms: checked as boolean }));
                  setShowError(false);
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  קראתי ואני מסכים/ה ל
                  <TermsModal />
                </label>
                <p className="text-sm text-muted-foreground">
                  כולל הגבלת אחריות וביטוח
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <Checkbox
                id="privacy"
                checked={consents.privacy}
                onCheckedChange={(checked) => {
                  setConsents(prev => ({ ...prev, privacy: checked as boolean }));
                  setShowError(false);
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  קראתי ואני מסכים/ה ל
                  <PrivacyPolicy />
                </label>
                <p className="text-sm text-muted-foreground">
                  כולל עיבוד מידע אישי
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 space-x-reverse">
              <Checkbox
                id="marketing"
                checked={consents.marketing}
                onCheckedChange={(checked) => {
                  setConsents(prev => ({ ...prev, marketing: checked as boolean }));
                }}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="marketing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  אני מסכים/ה לקבל עדכונים ומבצעים
                </label>
                <p className="text-sm text-muted-foreground">
                  ניתן לבטל בכל עת
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <Info className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p>
                  באישור תנאים אלו, אתה מסכים ל:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>תנאי השימוש והגבלת האחריות</li>
                  <li>מדיניות הפרטיות ועיבוד המידע האישי</li>
                  <li>תנאי הביטוח והכיסוי</li>
                  <li>מדיניות הביטולים והחזרים</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!consents.terms || !consents.privacy}>
          אישור והמשך
        </Button>
      </CardFooter>
    </Card>
  );
};