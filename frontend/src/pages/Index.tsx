
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { About } from '../components/About';
import { MovingEstimateForm } from '../components/MovingEstimateForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <About />
      <MovingEstimateForm />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
