import { Button } from '@/components/ui/button';
export const Hero = () => {
  const scrollToEstimate = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const callNow = () => {
    window.location.href = 'tel:+9720547777623'; // תחליף למספר טלפון שלך
  };

  return (
    <section dir="rtl" className="relative text-white bg-gray-900">
      <img
        src="/images/moving-bg.jpg"
        alt="תמונה של הובלה"
        className="w-full max-h-[500px] object-cover object-top"
      />
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          שירותי <span className="text-blue-300">הובלות</span> ו
          <span className="text-blue-300">אריזה</span> מקצועיים
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          השותף המהימן שלכם למעבר דירה ללא לחץ. אנו מטפלים בחפציכם בזהירות ובמקצועיות.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={scrollToEstimate}
            className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-4 text-lg font-semibold"
          >
            קבלו הצעת מחיר
          </Button>
          <Button
            onClick={callNow}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 text-lg font-semibold"
          >
            התקשרו עכשיו
          </Button>

        </div>
      </div>
    </section>
  );
};

