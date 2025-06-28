
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MoveDetailsSectionProps {
  formData: {
    fromAddress: string;
    toAddress: string;
    details: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const MoveDetailsSection: React.FC<MoveDetailsSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fromAddress">כתובת מוצא *</Label>
          <Input 
            id="fromAddress" 
            name="fromAddress" 
            value={formData.fromAddress} 
            onChange={onInputChange} 
            required 
            placeholder="רחוב הרצל 123, תל אביב" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="toAddress">כתובת יעד *</Label>
          <Input 
            id="toAddress" 
            name="toAddress" 
            value={formData.toAddress} 
            onChange={onInputChange} 
            required 
            placeholder="שדרות רוטשילד 456, תל אביב" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">פרטים נוספים</Label>
        <Textarea 
          id="details" 
          name="details" 
          value={formData.details} 
          onChange={onInputChange} 
          rows={4} 
          placeholder="אנא תארו דרישות מיוחדות, מספר חדרים, חפצים שבירים וכו'" 
        />
      </div>
    </>
  );
};
