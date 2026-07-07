import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const BG_VIDEO =
  'https://res.cloudinary.com/dora8sxcb/video/upload/v1783456939/kling-3.0_English_Create_a_futuristic_high-tech_promotional_video_for_a_SaaS_platform_that-0_p4yvcm.mp4';

export const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  const scrollToEstimate = () => {
    document.getElementById('estimate-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const callNow = () => {
    window.location.href = 'tel:+9720547777623';
  };

  return (
    <section id="hero" dir="rtl" className="text-white bg-gray-900">
      {/* תמונה / וידאו למעלה — ללא כיתובים */}
      {!videoEnded ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={() => setVideoEnded(true)}
          className="w-full max-h-[500px] object-cover object-top block"
          aria-hidden="true"
        >
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
      ) : (
        <img
          src="/images/moving-bg.jpg"
          alt=""
          aria-hidden="true"
          className="w-full max-h-[500px] object-cover object-top block"
        />
      )}

      {/* טקסט וכפתורים — מתחת לתמונה על רקע כהה */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
          שירותי <span className="text-blue-300">הובלות</span> ו
          <span className="text-blue-300">אריזה</span> מקצועיים
        </h1>
        <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
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
