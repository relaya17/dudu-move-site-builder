import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Eye, CheckCircle } from 'lucide-react';
import { legalConfig } from '@/config/legal';

interface ConsentFormProps {
  onConsent: (consents: ConsentData) => void;
  onDecline: () => void;
  loading?: boolean;
}

interface ConsentData {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
  timestamp: Date;
  version: string;
}

export const ConsentForm = ({ onConsent, onDecline, loading = false }: ConsentFormProps) => {
  const [consents, setConsents] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    marketingAccepted: false
  });

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleConsentChange = (type: keyof typeof consents, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSubmit = () => {
    if (consents.termsAccepted && consents.privacyAccepted) {
      onConsent({
        ...consents,
        timestamp: new Date(),
        version: legalConfig.termsOfService.version
      });
    }
  };

  const canSubmit = consents.termsAccepted && consents.privacyAccepted;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          הסכמה לתנאי שימוש ומדיניות פרטיות
        </CardTitle>
        <CardDescription>
          כדי להמשיך בשימוש בשירות, עליך לאשר את תנאי השימוש ומדיניות הפרטיות
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* תנאי שימוש */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={consents.termsAccepted}
              onCheckedChange={(checked) => handleConsentChange('termsAccepted', checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-2">
              <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                אני מסכים לתנאי השימוש
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTerms(!showTerms)}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {showTerms ? 'הסתר' : 'הצג'} תנאי שימוש
                </Button>
                <span className="text-xs text-gray-500">
                  גרסה {legalConfig.termsOfService.version}
                </span>
              </div>
            </div>
          </div>
          
          {showTerms && (
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <div className="space-y-4 text-sm">
                {legalConfig.termsOfService.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold">{section.title}</h4>
                    <p className="text-gray-600">{section.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* מדיניות פרטיות */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy"
              checked={consents.privacyAccepted}
              onCheckedChange={(checked) => handleConsentChange('privacyAccepted', checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-2">
              <label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                אני מסכים למדיניות הפרטיות
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrivacy(!showPrivacy)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showPrivacy ? 'הסתר' : 'הצג'} מדיניות פרטיות
                </Button>
                <span className="text-xs text-gray-500">
                  גרסה {legalConfig.privacyPolicy.version}
                </span>
              </div>
            </div>
          </div>
          
          {showPrivacy && (
            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <div className="space-y-4 text-sm">
                {legalConfig.privacyPolicy.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold">{section.title}</h4>
                    <p className="text-gray-600">{section.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* הסכמה לשיווק */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="marketing"
              checked={consents.marketingAccepted}
              onCheckedChange={(checked) => handleConsentChange('marketingAccepted', checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-2">
              <label htmlFor="marketing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                אני מסכים לקבל עדכונים ומבצעים (אופציונלי)
              </label>
              <p className="text-xs text-gray-500">
                נוכל לשלוח לך עדכונים על שירותים חדשים ומבצעים מיוחדים
              </p>
            </div>
          </div>
        </div>

        {/* אזהרה */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>חשוב:</strong> ללא הסכמה לתנאי השימוש ומדיניות הפרטיות, לא תוכל להשתמש בשירות.
            המידע שלך מוגן בהתאם לחוק הגנת הפרטיות בישראל.
          </AlertDescription>
        </Alert>

        {/* כפתורים */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="flex-1"
          >
            {loading ? 'מעבד...' : 'אני מסכים וממשיך'}
          </Button>
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={loading}
          >
            לא מסכים
          </Button>
        </div>

        {/* מידע נוסף */}
        <div className="text-xs text-gray-500 text-center">
          <p>עדכון אחרון: {legalConfig.termsOfService.lastUpdated}</p>
          <p>לשאלות: legal@dudu-move.co.il</p>
        </div>
      </CardContent>
    </Card>
  );
};