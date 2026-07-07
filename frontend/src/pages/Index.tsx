
import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { Services } from '../components/Services';
import { About } from '../components/About';
import MovingEstimateForm from '../components/MovingEstimateForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { fetchBusinessName, FALLBACK_BUSINESS_NAME } from '../services/businessInfoService';
import { usePageMeta, SITE_ORIGIN } from '@/hooks/usePageMeta';

const Index = () => {
  // כותרת/תיאור הדף משתקפים לפי שם העסק האמיתי (ולא "Movalo" - זה שם הפלטפורמה,
  // לא שם העסק של הלקוח) - עמוד זה הוא אתר הלקוחות לדוגמה (/demo), לא דף הבית הראשי.
  const [businessName, setBusinessName] = useState(FALLBACK_BUSINESS_NAME);

  useEffect(() => {
    let cancelled = false;
    fetchBusinessName().then((name) => {
      if (!cancelled) setBusinessName(name);
    });
    return () => { cancelled = true; };
  }, []);

  usePageMeta({
    title: `${businessName} - הערכת מחיר להובלה`,
    description: `${businessName} - שירותי הובלות ואריזה מקצועיים. קבלו הצעת מחיר מיידית ומעקב GPS בזמן אמת אחרי ההובלה שלכם.`,
    canonical: `${SITE_ORIGIN}/demo`,
  });

  return (
    <div className="min-h-screen bg-background">
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
