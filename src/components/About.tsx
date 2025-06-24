
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, MapPin, Star } from 'lucide-react';

export const About = () => {
  const stats = [
    { icon: <Award className="h-8 w-8" />, number: "10+", label: "Years Experience" },
    { icon: <Users className="h-8 w-8" />, number: "5000+", label: "Happy Customers" },
    { icon: <MapPin className="h-8 w-8" />, number: "50+", label: "Cities Served" },
    { icon: <Star className="h-8 w-8" />, number: "4.9", label: "Star Rating" }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">About Dudu Moving</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg">
                With over a decade of experience in the moving industry, Dudu Moving has built a reputation 
                as one of the most trusted moving companies in the region. We understand that moving can be 
                stressful, which is why we're committed to making your relocation as smooth as possible.
              </p>
              <p className="text-lg">
                Our team of professional movers is fully trained, licensed, and insured. We take pride in 
                treating your belongings as if they were our own, ensuring everything arrives at your new 
                destination safely and on time.
              </p>
              <p className="text-lg">
                From local residential moves to complex commercial relocations, we have the expertise and 
                equipment to handle any size job. Our commitment to excellence has earned us thousands of 
                satisfied customers and a 4.9-star rating.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
