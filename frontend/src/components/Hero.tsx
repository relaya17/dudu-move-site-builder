import { Button } from '@/components/ui/button';

const BG_VIDEO =
  'https://res.cloudinary.com/dora8sxcb/video/upload/v1783457470/hailuo-2_3_English_Create_a_futuristic_high-tech_promotional_video_for_a_SaaS_platform_that-0_1_hf9pb8.mp4';

export const Hero = () => {
  const scrollToEstimate = () => {
    document.getElementById('estimate-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const callNow = () => {
    window.location.href = 'tel:+9720547777623';
  };

  return (
    <section id="hero" dir="rtl" className="relative text-white overflow-hidden min-h-[520px] flex flex-col">
      {/* רקע וידאו */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src={BG_VIDEO} type="video/mp4" />
      </video>

      {/* שכבת אפלה */}
      <div className="absolute inset-0 bg-black/55" />

      {/* תוכן */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
          שירותי <span className="text-blue-300">הובלות</span> ו
          <span className="text-blue-300">אריזה</span> מקצועיים
        </h1>
        <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto mb-8 drop-shadow">
          השותף המהימן שלכם למעבר דירה ללא לחץ. אנו מטפלים בחפציכם בזהירות ובמקצועיות.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={scrollToEstimate}
            className="bg-white text-blue-700 hover:bg-blue-100 px-8 py-4 text-lg font-semibold shadow-lg"
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
