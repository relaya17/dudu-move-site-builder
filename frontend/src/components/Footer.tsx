
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Truck, Phone, Mail, MapPin } from 'lucide-react';
import { PrivacyPolicy } from '@/components/legal/PrivacyPolicy';
import { TermsModal } from '@/components/legal/TermsModal';
import { AccessibilityStatement } from '@/components/legal/AccessibilityStatement';
import { fetchBusinessName, FALLBACK_BUSINESS_NAME } from '@/services/businessInfoService';

const PHONE_NUMBER = '0547777623';
const EMAIL_ADDRESS = 'davidgueta3232@gmail.com';

const serviceLinks = [
  { label: 'הובלות דירה', href: '#services' },
  { label: 'הובלות משרדים', href: '#services' },
  { label: 'הובלות למרחקים ארוכים', href: '#services' },
  { label: 'שירותי אריזה', href: '#services' },
];

const quickLinks = [
  { label: 'אודותינו', href: '#about' },
  { label: 'קבלת הצעת מחיר', href: '#estimate-form' },
  { label: 'ביקורות', href: '#testimonials' },
];

export const Footer = () => {
  // שם העסק מגיע מהגדרות העסק בפאנל הניהול, לא קבוע בקוד - ר' Navbar.tsx להסבר מלא.
  const [businessName, setBusinessName] = useState(FALLBACK_BUSINESS_NAME);

  useEffect(() => {
    let cancelled = false;
    fetchBusinessName().then(name => {
      if (!cancelled) setBusinessName(name);
    });
    return () => { cancelled = true; };
  }, []);

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
