// ContactForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FurnitureInventory } from './FurnitureInventory';
import QuoteService from '@/services/quoteService';
import { FurnitureItem } from '@/types/quote';

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

    // שמירת הצעת המחיר באמצעות השירות החדש
    const savedQuote = QuoteService.saveQuoteRequest(formData, furnitureInventory);

    console.log('הצעת מחיר נשמרה בהצלחה:', savedQuote.id);

    toast({
      title: 'בקשת הצעת מחיר נשלחה!',
      description: `הצעת מחיר מס' ${savedQuote.id.split('_')[1]} נשמרה. ניצור איתכם קשר תוך 24 שעות.`,
    });

    // איפוס הטופס
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">שם מלא *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="יוסי כהן" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">כתובת אימייל *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="yossi@example.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">מספר טלפון *</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="050-123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moveType">סוג הובלה *</Label>
                      <Select onValueChange={handleSelectChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="בחרו סוג הובלה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">הובלת דירה</SelectItem>
                          <SelectItem value="commercial">הובלת משרד</SelectItem>
                          <SelectItem value="local">הובלה מקומית</SelectItem>
                          <SelectItem value="packing">שירותי אריזה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moveDate">תאריך מעבר מועדף</Label>
                    <Input id="moveDate" name="moveDate" type="date" value={formData.moveDate} onChange={handleInputChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fromAddress">כתובת מוצא *</Label>
                      <Input id="fromAddress" name="fromAddress" value={formData.fromAddress} onChange={handleInputChange} required placeholder="רחוב הרצל 123, תל אביב" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toAddress">כתובת יעד *</Label>
                      <Input id="toAddress" name="toAddress" value={formData.toAddress} onChange={handleInputChange} required placeholder="שדרות רוטשילד 456, תל אביב" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details">פרטים נוספים</Label>
                    <Textarea id="details" name="details" value={formData.details} onChange={handleInputChange} rows={4} placeholder="אנא תארו דרישות מיוחדות, מספר חדרים, חפצים שבירים וכו'" />
                  </div>

                  {/* ✅ כאן הכנסנו את קומפוננטת הרהיטים */}
                  <FurnitureInventory onInventoryChange={handleInventoryChange} />

                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    שלחו בקשת הצעת מחיר
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="ml-2 h-5 w-5 text-blue-600" />
                  פרטי יצירת קשר
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">טלפון</p>
                    <p className="text-gray-600">0547777623</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">אימייל</p>
                    <p className="text-gray-600">info@davidmoving.co.il</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">כתובת</p>
                    <p className="text-gray-600"><br />אילת, ישראל</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="ml-2 h-5 w-5 text-blue-600" />
                  שעות פעילות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ימים א'-ה'</span>
                    <span>07:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>יום ו'</span>
                    <span>08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>יום שבת</span>
                    <span>סגור</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-blue-600 font-medium">שירות לקוחות זמין 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
