
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Home, Building, Shield, Clock } from 'lucide-react';

export const Services = () => {
  const services = [
    {
      icon: <Home className="h-12 w-12 text-blue-600" />,
      title: "הובלות דירה",
      description: "שירותי הובלת דירה מקצועיים למשפחות ויחידים. אנו מטפלים בהכל מאריזה ועד פריקה.",
      features: ["אריזה ופריקה", "הרכבת רהיטים", "טיפול בחפצים שבירים"]
    },
    {
      icon: <Building className="h-12 w-12 text-blue-600" />,
      title: "הובלות משרדים",
      description: "העברת משרדים ועסקים עם זמן השבתה מינימלי. אנו מבינים את החשיבות של המשך פעילות העסק.",
      features: ["ציוד משרדי", "זמן השבתה מינימלי", "הובלות בסופי שבוע"]
    },
    {
      icon: <Package className="h-12 w-12 text-blue-600" />,
      title: "שירותי אריזה",
      description: "שירותי אריזה מקצועיים עם חומרים איכותיים להבטחת הגעה בטוחה של חפציכם.",
      features: ["חומרים איכותיים", "קופסאות מותאמות", "מעקב מלאי"]
    },
    {
      icon: <Truck className="h-12 w-12 text-blue-600" />,
      title: "הובלות למרחקים ארוכים",
      description: "הובלות בין־עירוניות וארציות המטופלות בזהירות ובדייקנות. מורשים להובלות בין־עירוניות.",
      features: ["מעקב GPS", "אפשרויות אחסון", "זמנים גמישים"]
    },
  
    {
      icon: <Clock className="h-12 w-12 text-blue-600" />,
      title: "הובלות חירום",
      description: "שירותי הובלה דחופים זמינים 24/7. אנחנו כאן כשאתם הכי צריכים אותנו.",
      features: ["זמינות 24/7", "תגובה מהירה", "אריזה דחופה"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">שירותי ההובלה שלנו</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            פתרונות הובלה ואריזה מקיפים המותאמים לצרכים הספציפיים שלכם
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
