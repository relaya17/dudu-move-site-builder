
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Austin, TX",
      rating: 5,
      text: "Dudu Moving made our cross-country move seamless. The team was professional, careful with our belongings, and delivered everything on time. Highly recommended!"
    },
    {
      name: "Michael Chen",
      location: "Denver, CO",
      rating: 5,
      text: "Outstanding service from start to finish! They handled our office relocation with minimal disruption to our business. The pricing was fair and transparent."
    },
    {
      name: "Emily Rodriguez",
      location: "Seattle, WA",
      rating: 5,
      text: "I was stressed about moving with two young kids, but Dudu Moving's team made it so easy. They were patient, efficient, and took great care of our furniture."
    },
    {
      name: "David Thompson",
      location: "Phoenix, AZ",
      rating: 5,
      text: "Best moving experience I've ever had! The crew arrived on time, worked quickly, and nothing was damaged. Worth every penny for the peace of mind."
    },
    {
      name: "Lisa Wang",
      location: "Portland, OR",
      rating: 5,
      text: "Professional, courteous, and efficient. They even helped with last-minute packing. I'll definitely use Dudu Moving for any future moves."
    },
    {
      name: "Robert Martinez",
      location: "Las Vegas, NV",
      rating: 5,
      text: "Exceptional service! They handled our antique furniture with extreme care and provided excellent customer service throughout the entire process."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from thousands of satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-blue-50 px-8 py-4 rounded-lg">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">4.9/5 Stars</p>
              <p className="text-gray-600">Based on 500+ reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
