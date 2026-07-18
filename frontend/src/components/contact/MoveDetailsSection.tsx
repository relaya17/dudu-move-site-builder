
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MoveDetailsSectionProps {
  formData: {
    currentAddress: string;
    destinationAddress: string;
    additionalNotes: string;
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
          <Label htmlFor="currentAddress">כתובת נוכחית *</Label>
          <Input
            id="currentAddress"
            name="currentAddress"
            value={formData.currentAddress}
            onChange={onInputChange}
            required
            placeholder="רחוב הרצל 123, תל אביב"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destinationAddress">כתובת יעד *</Label>
          <Input
            id="destinationAddress"
            name="destinationAddress"
            value={formData.destinationAddress}
            onChange={onInputChange}
            required
            placeholder="שדרות רוטשילד 456, תל אביב"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">פרטים נוספים</Label>
        <Textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={onInputChange}
          rows={4}
          placeholder="אנא תארו פרטים נוספים כמו קומה, מעלית, חניה, דרישות מיוחדות וכו'"
        />
      </div>
    </>
  );
};
