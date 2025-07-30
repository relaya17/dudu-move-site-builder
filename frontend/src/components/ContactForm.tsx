import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FurnitureInventory } from './FurnitureInventory';
import MovingEstimateService from '@/services/movingEstimateService';
import { FurnitureItem } from '@/types/movingEstimate';
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
    apartmentType: '',
    currentAddress: '',
    destinationAddress: '',
    additionalNotes: ''
  });
  const [furnitureInventory, setFurnitureInventory] = useState<FurnitureItem[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, apartmentType: value });
  };

  const handleInventoryChange = (inventory: FurnitureItem[]) => {
    setFurnitureInventory(inventory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const estimateData = {
        ...formData,
        preferredMoveDate: formData.moveDate
      };
      const savedEstimate = await MovingEstimateService.submitEstimateRequest(estimateData, furnitureInventory);

      console.log('בקשת הערכת מחיר נשמרה בהצלחה:', savedEstimate.id);

      // הצגת המחיר והאזהרות
      toast({
        title: 'הערכת מחיר התקבלה!',
        description: `
          בקשה מס' ${savedEstimate.id.split('_')[1]} נשמרה. ניצור איתכם קשר תוך 24 שעות עם הערכת מחיר מפורטת.
        `,
        duration: 10000, // הודעה תוצג ל-10 שניות
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        moveType: '',
        moveDate: '',
        apartmentType: '',
        currentAddress: '',
        destinationAddress: '',
        additionalNotes: ''
      });
      setFurnitureInventory([]);
    } catch (error) {
      console.error('שגיאה בשליחת בקשת הערכת המחיר:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה בעיה בשליחת בקשת הערכת המחיר, אנא נסו שוב מאוחר יותר.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">קבלו הערכת מחיר</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            מלאו את הטופס למטה ואנו נספק לכם הערכת מחיר מפורטת ללא התחייבות תוך 24 שעות
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">בקשת הערכת מחיר</CardTitle>
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
                    שלחו בקשת הערכת מחיר
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
