
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MapPin } from 'lucide-react';
import { PrivacyPolicy } from '@/components/legal/PrivacyPolicy';
import { TermsModal } from '@/components/legal/TermsModal';
import { AccessibilityStatement } from '@/components/legal/AccessibilityStatement';

const PHONE_NUMBER = '0547777623';
const EMAIL_ADDRESS = 'davidgueta3232@gmail.com';

const serviceLinks = [
  { label: 'הובלות דירה', href: '/demo#services' },
  { label: 'הובלות משרדים', href: '/demo#services' },
  { label: 'הובלות למרחקים ארוכים', href: '/demo#services' },
  { label: 'שירותי אריזה', href: '/demo#services' },
];

const quickLinks = [
  { label: 'אודותינו', href: '/demo#about' },
  { label: 'קבלת הצעת מחיר', href: '/demo#estimate-form' },
  { label: 'ביקורות', href: '/demo#testimonials' },
  { label: 'צור קשר', href: '/demo/contact' },
  { label: 'Virtual Staging', href: '/demo/staging' },
  { label: 'מרכז פרטיות', href: '/demo/privacy' },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" dir="rtl">
      {/* max-w-4xl (ולא כל רוחב ה-container) - כדי שבמסכים גדולים העמודות יישארו
          קרובות זו לזו ומאוזנות, במקום להימתח על פני כל הרוחב וליצור מרחקים ענקיים. */}
      <div className="container mx-auto px-6 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto">

        {/* שלוש עמודות זה לצד זה - רוחב שווה, מיושרות לימין, גובה עמודות מיושר (items-start) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-8 text-right">

          {/* שירותים */}
          <nav aria-label="השירותים שלנו">
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 mb-3">השירותים שלנו</h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="block text-sm text-gray-300 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* קישורים מהירים */}
          <nav aria-label="קישורים מהירים">
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 mb-3">קישורים מהירים</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="block text-sm text-gray-300 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* צור קשר — הסדר במסמך (אייקון ואז טקסט) הוא הנכון ל-RTL: האיבר הראשון
              יושב בצד ה"התחלה" שהוא ימין תחת dir="rtl", כך שהאייקון מופיע קרוב לכותרת
              (מימין) והטקסט ממשיך משמאלו - זו ההתנהגות הרצויה, אין צורך להפוך סדר. */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 mb-3">צור קשר</h3>
            <div className="space-y-2.5">
              <a href={`tel:${PHONE_NUMBER}`}
                className="flex items-center justify-end gap-2 text-sm text-gray-300 hover:text-white transition-colors w-fit mr-0">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                <span dir="ltr">{PHONE_NUMBER}</span>
              </a>
              <a href={`mailto:${EMAIL_ADDRESS}`}
                className="flex items-center justify-end gap-2 text-sm text-gray-300 hover:text-white transition-colors w-fit mr-0">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                <span dir="ltr" className="break-all">{EMAIL_ADDRESS}</span>
              </a>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-300 w-fit mr-0">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                <span>אילת, ישראל</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* שורת קישורים משפטיים */}
        <div className="flex flex-wrap justify-center items-center gap-3 [&_button]:text-xs [&_button]:text-gray-400 [&_button]:hover:text-white">
          <PrivacyPolicy />
          <span className="text-gray-700 text-xs">|</span>
          <TermsModal />
          <span className="text-gray-700 text-xs">|</span>
          <AccessibilityStatement />
          <span className="text-gray-700 text-xs">|</span>
          <a href="/demo/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">
            מרכז פרטיות (GDPR)
          </a>
        </div>
        </div>
      </div>

      {/* פס זכויות תחתון */}
      <div className="w-full bg-white border-t border-gray-100">
        <p className="text-center text-xs text-gray-500 py-1.5">
          © {new Date().getFullYear()} כל הזכויות שמורות ל-<span dir="ltr" className="font-semibold">Movalo</span>
        </p>
      </div>
    </footer>
  );
};
