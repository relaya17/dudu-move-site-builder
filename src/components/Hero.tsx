
import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck, Phone, MapPin } from 'lucide-react';

export const Hero = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Professional <span className="text-blue-200">Moving</span> & 
                <span className="text-blue-200"> Packing</span> Services
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                Your trusted partner for stress-free relocations. We handle your belongings with care and professionalism.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToContact}
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
              >
                Get Free Quote
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-700 font-semibold px-8 py-4 text-lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <Truck className="h-8 w-8 text-blue-300 mr-2" />
                </div>
                <h3 className="font-semibold text-lg">Licensed & Insured</h3>
                <p className="text-blue-200">Full protection for your move</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <MapPin className="h-8 w-8 text-blue-300 mr-2" />
                </div>
                <h3 className="font-semibold text-lg">Local & Long Distance</h3>
                <p className="text-blue-200">Anywhere you need to go</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start mb-2">
                  <Phone className="h-8 w-8 text-blue-300 mr-2" />
                </div>
                <h3 className="font-semibold text-lg">24/7 Support</h3>
                <p className="text-blue-200">Always here to help</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Dudu Moving?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-lg">10+ Years of Experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-lg">Professional Trained Team</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-lg">Competitive Pricing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-lg">100% Satisfaction Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
