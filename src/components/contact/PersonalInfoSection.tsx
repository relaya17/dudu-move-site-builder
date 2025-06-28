
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    moveType: string;
    moveDate: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: string) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  onInputChange,
  onSelectChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">שם מלא *</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={onInputChange} 
            required 
            placeholder="יוסי כהן" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">כתובת אימייל *</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={onInputChange} 
            required 
            placeholder="yossi@example.com" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">מספר טלפון *</Label>
          <Input 
            id="phone" 
            name="phone" 
            type="tel" 
            value={formData.phone} 
            onChange={onInputChange} 
            required 
            placeholder="050-123-4567" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="moveType">סוג הובלה *</Label>
          <Select onValueChange={onSelectChange} required>
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
        <Input 
          id="moveDate" 
          name="moveDate" 
          type="date" 
          value={formData.moveDate} 
          onChange={onInputChange} 
        />
      </div>
    </>
  );
};
