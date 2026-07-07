
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Home, Building } from 'lucide-react';

export const Services = () => {
  const services = [
    {
      icon: <Home className="h-12 w-12 text-blue-600" aria-hidden="true" />,
      title: "הובלות דירה",
      description: "שירותי הובלת דירה מקצועיים למשפחות ויחידים. אנו מטפלים בהכל מאריזה ועד פריקה.",
      features: ["אריזה ופריקה", "הרכבת רהיטים", "טיפול בחפצים שבירים"]
    },
    {
      icon: <Building className="h-12 w-12 text-blue-600" aria-hidden="true" />,
      title: "הובלות משרדים",
      description: "העברת משרדים ועסקים עם זמן השבתה מינימלי. אנו מבינים את החשיבות של המשך פעילות העסק.",
      features: ["ציוד משרדי", "זמן השבתה מינימלי", "הובלות בסופי שבוע"]
    },
    {
      icon: <Package className="h-12 w-12 text-blue-600" aria-hidden="true" />,
      title: "שירותי אריזה",
      description: "שירותי אריזה מקצועיים עם חומרים איכותיים להבטחת הגעה בטוחה של חפציכם.",
      features: ["חומרים איכותיים", "קופסאות מותאמות", "מעקב מלאי"]
    },
    {
      icon: <Truck className="h-12 w-12 text-blue-600" aria-hidden="true" />,
      title: "הובלות למרחקים ארוכים",
      description: "הובלות בין־עירוניות וארציות המטופלות בזהירות ובדייקנות. מורשים להובלות בין־עירוניות.",
      features: ["מעקב GPS", "אפשרויות אחסון", "זמנים גמישים"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {/* שני צבעי המותג (כהה + כחול) + פונט הכותרות האלגנטי (Playfair Display,
              כבר מוגדר כברירת מחדל ל-h1-h6 ב-tailwind.config/index.css) עם הטיה
              (italic) על החלק השני - נותן תחושה מיוחדת/מזמינה יותר מטקסט שטוח אחיד. */}
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">הובלות</span>{' '}
            <span className="text-blue-600 italic">בלי בעיות</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            פתרונות הובלה ואריזה מקיפים המותאמים לצרכים הספציפיים שלכם
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
