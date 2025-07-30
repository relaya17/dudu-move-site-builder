
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { About } from '../components/About';
import { ContactForm } from '../components/ContactForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <About />
      <ContactForm />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
