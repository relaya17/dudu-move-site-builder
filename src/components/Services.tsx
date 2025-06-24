
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Home, Building, Shield, Clock } from 'lucide-react';

export const Services = () => {
  const services = [
    {
      icon: <Home className="h-12 w-12 text-blue-600" />,
      title: "Residential Moving",
      description: "Professional home moving services for families and individuals. We handle everything from packing to unpacking.",
      features: ["Packing & Unpacking", "Furniture Assembly", "Fragile Item Care"]
    },
    {
      icon: <Building className="h-12 w-12 text-blue-600" />,
      title: "Commercial Moving",
      description: "Office and business relocations with minimal downtime. We understand the importance of keeping your business running.",
      features: ["Office Equipment", "Minimal Downtime", "Weekend Moving"]
    },
    {
      icon: <Package className="h-12 w-12 text-blue-600" />,
      title: "Packing Services",
      description: "Professional packing services using high-quality materials to ensure your belongings arrive safely.",
      features: ["Quality Materials", "Custom Crating", "Inventory Tracking"]
    },
    {
      icon: <Truck className="h-12 w-12 text-blue-600" />,
      title: "Long Distance Moving",
      description: "State-to-state and cross-country moves handled with care and precision. Licensed for interstate transport.",
      features: ["GPS Tracking", "Storage Options", "Flexible Scheduling"]
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Storage Solutions",
      description: "Secure, climate-controlled storage facilities for short-term and long-term needs.",
      features: ["Climate Controlled", "24/7 Security", "Flexible Terms"]
    },
    {
      icon: <Clock className="h-12 w-12 text-blue-600" />,
      title: "Emergency Moving",
      description: "Last-minute moving services available 24/7. We're here when you need us most.",
      features: ["24/7 Availability", "Rapid Response", "Emergency Packing"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Moving Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive moving and packing solutions tailored to your specific needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{service.title}</CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
