
import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Services } from '../components/Services';
import { About } from '../components/About';
import MovingEstimateForm from '../components/MovingEstimateForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { fetchBusinessName, FALLBACK_BUSINESS_NAME } from '../services/businessInfoService';
import { VideoIntro, hasSeenIntro } from '../components/VideoIntro';

const Index = () => {
  const [showIntro, setShowIntro] = useState(!hasSeenIntro());

  // כותרת הטאב של הדפדפן משתקפת לפי שם העסק האמיתי (ולא "Movalo" - זה שם הפלטפורמה,
  // לא שם העסק של הלקוח) - עמוד זה הוא אתר הלקוחות לדוגמה (/demo), לא דף הבית הראשי.
  useEffect(() => {
    const previousTitle = document.title;
    let cancelled = false;
    fetchBusinessName().then((name) => {
      if (!cancelled) document.title = `${name} - הערכת מחיר`;
    }).catch(() => {
      document.title = `${FALLBACK_BUSINESS_NAME} - הערכת מחיר`;
    });
    return () => {
      cancelled = true;
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {showIntro && <VideoIntro onDone={() => setShowIntro(false)} />}
      <a href="#main-content" className="skip-to-content">
        דלג לתוכן העיקרי
      </a>
      <Navbar />
      <Hero />
      <main id="main-content">
        <Services />
        <About />
        <section id="estimate-form">
          <MovingEstimateForm />
        </section>
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
