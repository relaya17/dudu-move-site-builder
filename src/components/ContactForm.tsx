
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FurnitureInventory } from './FurnitureInventory';
import QuoteService from '@/services/quoteService';
import { FurnitureItem } from '@/types/quote';
import { PersonalInfoSection } from './contact/PersonalInfoSection';
import { MoveDetailsSection } from './contact/MoveDetailsSection';
import { ContactInfoCard } from './contact/ContactInfoCard';
import { BusinessHoursCard } from './contact/BusinessHoursCard';

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    moveType: '',
    moveDate: '',
    fromAddress: '',
    toAddress: '',
    details: ''
  });
  const [furnitureInventory, setFurnitureInventory] = useState<FurnitureItem[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, moveType: value });
  };

  const handleInventoryChange = (inventory: FurnitureItem[]) => {
    setFurnitureInventory(inventory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedQuote = QuoteService.saveQuoteRequest(formData, furnitureInventory);

    console.log('הצעת מחיר נשמרה בהצלחה:', savedQuote.id);

    toast({
      title: 'בקשת הצעת מחיר נשלחה!',
      description: `הצעת מחיר מס' ${savedQuote.id.split('_')[1]} נשמרה. ניצור איתכם קשר תוך 24 שעות.`,
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      moveType: '',
      moveDate: '',
      fromAddress: '',
      toAddress: '',
      details: ''
    });
    setFurnitureInventory([]);
  };

  return (
    <section id="contact" className="py-20 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">קבלו הצעת מחיר</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            מלאו את הטופס למטה ואנו נספק לכם הצעת מחיר מפורטת ללא התחייבות תוך 24 שעות
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">בקשת הצעת מחיר</CardTitle>
                <CardDescription>
                  אנא ספקו כמה שיותר פרטים להערכה מדויקת
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <PersonalInfoSection
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                  />

                  <MoveDetailsSection
                    formData={formData}
                    onInputChange={handleInputChange}
                  />

                  <FurnitureInventory onInventoryChange={handleInventoryChange} />

                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    שלחו בקשת הצעת מחיר
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ContactInfoCard />
            <BusinessHoursCard />
          </div>
        </div>
      </div>
    </section>
  );
};
