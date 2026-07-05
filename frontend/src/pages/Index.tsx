
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { About } from '../components/About';
import MovingEstimateForm from '../components/MovingEstimateForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-content">
        דלג לתוכן העיקרי
      </a>
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
