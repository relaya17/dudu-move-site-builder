
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, MapPin, Star } from 'lucide-react';

export const About = () => {
  const stats = [
    { icon: <Award className="h-8 w-8 text-blue-600" />, number: "7+", label: "שנות ניסיון" },
    { icon: <Users className="h-8 w-8 text-blue-600" />, number: "5000+", label: "לקוחות מרוצים" },
    { icon: <MapPin className="h-8 w-8 text-blue-600" />, number: "50+", label: "ערים בשירות" },
    { icon: <Star className="h-8 w-8 text-blue-600" />, number: "4.9", label: "דירוג כוכבים" }
  ];

  return (
    <section id="about" className="py-20 bg-white" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center animate-fadeInUp">
              אודות דויד הובלות
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-center">
              <p className="text-lg animate-fadeInUp delay-200">
                ניסיון עשיר בתחום ההובלות, דוד הובלות בנתה מוניטין כאחת מחברות ההובלה המהימנות ביותר באזור.
                אנו מבינים שמעבר דירה יכול להיות מלחיץ, ולכן אנו מחויבים להפוך את המעבר שלכם לחלק ככל האפשר.
              </p>
              <p className="text-lg animate-fadeInUp delay-400">
                הצוות שלנו של מובילים מקצועיים מאומן במלואו, מורשה ומבוטח. אנחנו גאים להתייחס לחפצים שלכם כאילו הם שלנו,
                ומבטיחים שהכל יגיע ליעד החדש בבטחה ובזמן.
              </p>
              <p className="text-lg animate-fadeInUp delay-600">
                מהובלות דירה מקומיות ועד העברות משרדים מורכבות, יש לנו את המומחיות והציוד לטפל בכל גודל עבודה.
                המחויבות שלנו למצוינות זיכתה אותנו באלפי לקוחות מרוצים ודירוג של 4.9 כוכבים.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 bg-gray-50 border border-gray-200 hover:shadow-md transition duration-300">
                <CardContent className="flex flex-col items-center text-center gap-3">
                  <div className="bg-blue-100 rounded-full p-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
