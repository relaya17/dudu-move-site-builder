
import { Separator } from '@/components/ui/separator';
import { Truck, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Truck className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">דויד הובלות</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              השותף המהימן שלכם לשירותי הובלה ואריזה מקצועיים. 
              הופכים את המעבר שלכם לחוויה ללא לחץ מאז 2014.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">השירותים שלנו</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-white cursor-pointer transition-colors">הובלות דירה</li>
              <li className="hover:text-white cursor-pointer transition-colors">הובלות משרדים</li>
              <li className="hover:text-white cursor-pointer transition-colors">הובלות למרחקים ארוכים</li>
              <li className="hover:text-white cursor-pointer transition-colors">שירותי אריזה</li>
              <li className="hover:text-white cursor-pointer transition-colors">פתרונות אחסון</li>
              <li className="hover:text-white cursor-pointer transition-colors">הובלות חירום</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">קישורים מהירים</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="hover:text-white cursor-pointer transition-colors">אודותינו</li>
              <li className="hover:text-white cursor-pointer transition-colors">קבלת הצעת מחיר</li>
              <li className="hover:text-white cursor-pointer transition-colors">טיפים למעבר דירה</li>
              <li className="hover:text-white cursor-pointer transition-colors">שאלות נפוצות</li>
              <li className="hover:text-white cursor-pointer transition-colors">קריירה</li>
              <li className="hover:text-white cursor-pointer transition-colors">ביקורות</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">פרטי יצירת קשר</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">0547777623</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-300">info@davidmoving.co.il</span>
              </div>
              <div className="flex items-start space-x-3 space-x-reverse">
                <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                <span className="text-gray-300">
                <br />
                  אילת, ישראל
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 דויד הובלות. כל הזכויות שמורות.
          </p>
          <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">מדיניות פרטיות</span>
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">תנאי שירות</span>
            <span className="text-gray-400 hover:text-white cursor-pointer transition-colors text-sm">מדיניות עוגיות</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
