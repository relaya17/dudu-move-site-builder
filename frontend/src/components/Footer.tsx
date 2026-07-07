
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
      <div className="container mx-auto px-6 py-10 sm:py-12">

        {/* גריד ראשי — שני עמודות בנייד, ארבעה בדסקטופ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">

          {/* אודות */}
          <div className="col-span-2 lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-blue-400 shrink-0" aria-hidden="true" />
              <span className="text-lg font-bold leading-tight" dir="auto">{businessName}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              השותף המהימן שלכם לשירותי הובלה ואריזה מקצועיים.
              מעל 7 שנות ניסיון בהפיכת המעבר שלכם לחוויה ללא לחץ.
            </p>
          </div>

          {/* שירותים */}
          <nav aria-label="השירותים שלנו" className="space-y-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">השירותים שלנו</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* קישורים מהירים */}
          <nav aria-label="קישורים מהירים" className="space-y-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">קישורים מהירים</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* צור קשר */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">צור קשר</h3>
            <div className="space-y-2">
              <a href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                {PHONE_NUMBER}
              </a>
              <a href={`mailto:${EMAIL_ADDRESS}`}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors break-all">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                {EMAIL_ADDRESS}
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                אילת, ישראל
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* שורת תחתית */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 order-2 sm:order-1">
            © {new Date().getFullYear()} כל הזכויות שמורות
          </p>
          <div className="flex items-center gap-3 order-1 sm:order-2 [&_button]:text-xs [&_button]:text-gray-400 [&_button]:hover:text-white">
            <PrivacyPolicy />
            <span className="text-gray-700 text-xs">|</span>
            <TermsModal />
            <span className="text-gray-700 text-xs">|</span>
            <AccessibilityStatement />
          </div>
        </div>
      </div>

      {/* פס זכויות תחתון */}
      <div className="w-full bg-white">
        <p className="text-center text-xs text-gray-700 py-1.5">
          Powered by <span dir="ltr" className="font-semibold">Movalo</span>
        </p>
      </div>
    </footer>
  );
};
