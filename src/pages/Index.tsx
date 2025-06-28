import React from 'react';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { About } from '../components/About';
import { ContactForm } from '../components/ContactForm';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { FurnitureInventory } from '../components/FurnitureInventory';  // הוספת ייבוא
import { FurnitureItem } from '@/types/quote';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <About />
      <FurnitureInventory onInventoryChange={function (inventory: FurnitureItem[]): void {
        throw new Error('Function not implemented.');
      } } /> {/* הוספת הרכיב כאן */}
      <ContactForm />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
