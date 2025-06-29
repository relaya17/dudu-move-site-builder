import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      name: "שרה כהן",
      location: "תל אביב",
      rating: 5,
      text: "דודו הובלות הפכו את המעבר שלנו לחלק לחלוטין. הצוות היה מקצועי, זהיר עם החפצים שלנו, והעביר הכל בזמן. ממליצה בחום!"
    },
    {
      name: "מיכאל לוי",
      location: "ירושלים",
      rating: 5,
      text: "שירות מעולה מתחילה ועד סוף! הם טיפלו בהעברת המשרד שלנו עם הפרעה מינימלית לעסק. התמחור היה הוגן ושקוף."
    },
    {
      name: "רותי אברהם",
      location: "חיפה",
      rating: 5,
      text: "הייתי מלחיצה לגבי המעבר עם שני ילדים קטנים, אבל הצוות של דודו הובלות עשה את זה כל כך קל. הם היו סבלניים, יעילים וזהירים עם הרהיטים."
    },
    {
      name: "דוד ישראלי",
      location: "באר שבע",
      rating: 5,
      text: "החוויה הטובה ביותר של הובלה שחוויתי אי פעם! הצוות הגיע בזמן, עבד מהר, ושום דבר לא נזרק. שווה כל שקל עבור השקט הנפשי."
    },
    {
      name: "לירון בן דוד",
      location: "נתניה",
      rating: 5,
      text: "מקצועיים, אדיבים ויעילים. הם אפילו עזרו עם אריזה בדקה האחרונה. בהחלט אשתמש בדודו הובלות למעברים עתידיים."
    },
    {
      name: "רונן גרוס",
      location: "רחובות",
      rating: 5,
      text: "שירות יוצא מן הכלל! הם טיפלו ברהיטים העתיקים שלנו בזהירות יתרה וסיפקו שירות לקוחות מעולה לאורך כל התהליך."
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">מה הלקוחות שלנו אומרים</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            אל תסתמכו רק על המילה שלנו - שמעו מאלפי לקוחות מרוצים
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto snap-x scroll-smooth px-2 md:px-0">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="snap-start min-w-[280px] md:min-w-0">
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 animate-fadeInUp">
                <CardContent className="p-6">
                  <div
                    className="flex items-center mb-4"
                    aria-label={`דירוג ${testimonial.rating} מתוך 5 כוכבים`}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 space-x-reverse bg-blue-50 px-8 py-4 rounded-lg">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">4.9/5 כוכבים</p>
              <p className="text-gray-600">מבוסס על 500+ ביקורות</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
