
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PersonalInfoSectionProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    apartmentType: string;
    preferredMoveDate: string;
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
          <Label htmlFor="apartmentType">סוג דירה *</Label>
          <Select onValueChange={onSelectChange} required>
            <SelectTrigger>
              <SelectValue placeholder="בחרו סוג דירה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.5">1.5 חדרים</SelectItem>
              <SelectItem value="2">2 חדרים</SelectItem>
              <SelectItem value="2.5">2.5 חדרים</SelectItem>
              <SelectItem value="3">3 חדרים</SelectItem>
              <SelectItem value="3.5">3.5 חדרים</SelectItem>
              <SelectItem value="4">4 חדרים</SelectItem>
              <SelectItem value="4.5">4.5 חדרים</SelectItem>
              <SelectItem value="5+">5+ חדרים</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredMoveDate">תאריך מעבר מועדף</Label>
        <Input
          id="preferredMoveDate"
          name="preferredMoveDate"
          type="date"
          value={formData.preferredMoveDate}
          onChange={onInputChange}
        />
      </div>
    </>
  );
};
