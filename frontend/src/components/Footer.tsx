
import { Separator } from '@/components/ui/separator';
import { Truck, Phone, Mail, MapPin } from 'lucide-react';
import { PrivacyPolicy } from '@/components/legal/PrivacyPolicy';
import { TermsModal } from '@/components/legal/TermsModal';
import { AccessibilityStatement } from '@/components/legal/AccessibilityStatement';

const PHONE_NUMBER = '0547777623';
const EMAIL_ADDRESS = 'info@davidmoving.co.il';

const serviceLinks = [
  { label: 'הובלות דירה', href: '#services' },
  { label: 'הובלות משרדים', href: '#services' },
  { label: 'הובלות למרחקים ארוכים', href: '#services' },
  { label: 'שירותי אריזה', href: '#services' },
  { label: 'הובלות חירום', href: '#services' },
];

const quickLinks = [
  { label: 'אודותינו', href: '#about' },
  { label: 'קבלת הצעת מחיר', href: '#estimate-form' },
  { label: 'ביקורות', href: '#testimonials' },
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Truck className="h-8 w-8 text-blue-400" aria-hidden="true" />
              <span className="text-2xl font-bold">דויד הובלות</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              השותף המהימן שלכם לשירותי הובלה ואריזה מקצועיים.
              הופכים את המעבר שלכם לחוויה ללא לחץ מאז 2014.
            </p>
          </div>

          <nav aria-label="השירותים שלנו" className="space-y-4">
            <h3 className="text-xl font-semibold">השירותים שלנו</h3>
            <ul className="space-y-2 text-gray-300">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-white focus-visible:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="קישורים מהירים" className="space-y-4">
            <h3 className="text-xl font-semibold">קישורים מהירים</h3>
            <ul className="space-y-2 text-gray-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-white focus-visible:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">פרטי יצירת קשר</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-5 w-5 text-blue-400" aria-hidden="true" />
                <a href={`tel:${PHONE_NUMBER}`} className="text-gray-300 hover:text-white focus-visible:text-white transition-colors">
                  {PHONE_NUMBER}
                </a>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="h-5 w-5 text-blue-400" aria-hidden="true" />
                <a href={`mailto:${EMAIL_ADDRESS}`} className="text-gray-300 hover:text-white focus-visible:text-white transition-colors">
                  {EMAIL_ADDRESS}
                </a>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-blue-400 mt-1" aria-hidden="true" />
                <span className="text-gray-300">אילת, ישראל</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 דויד הובלות. כל הזכויות שמורות.
          </p>
          <div className="flex flex-wrap items-center gap-4 [&_button]:text-gray-400 [&_button]:hover:text-white">
            <PrivacyPolicy />
            <TermsModal />
            <AccessibilityStatement />
          </div>
        </div>
      </div>
    </footer>
  );
};
