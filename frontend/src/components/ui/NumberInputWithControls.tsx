import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface NumberInputWithControlsProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

/**
 * שוחזר בלי MUI (היה הרכיב היחיד באתר, מלבד MovingEstimateForm.tsx, שהשתמש
 * ב-@mui/material) - עכשיו בנוי עם shadcn/Tailwind כמו כל שאר האתר, כדי
 * שלא נטען שתי ספריות עיצוב שלמות במקביל. אותה התנהגות בדיוק כמו קודם.
 */
export const NumberInputWithControls = ({
  label,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  unit,
}: NumberInputWithControlsProps) => {
  const handleIncrement = () => {
    const newValue = value + step;
    onChange(newValue <= max ? newValue : max);
  };

  const handleDecrement = () => {
    const newValue = value - step;
    onChange(newValue >= min ? newValue : min);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else if (event.target.value === '') {
      onChange(min);
    }
  };

  const inputId = useId();

  return (
    <div className="flex items-center flex-wrap gap-2 mb-4">
      <label htmlFor={inputId} className="min-w-[80px] text-sm text-gray-700">
        {label}
      </label>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label={`הקטן ${label}`}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        id={inputId}
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max === Infinity ? undefined : max}
        step={step}
        className="w-20 text-center h-8 px-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label={`הגדל ${label}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
      {unit && <span className="text-sm text-gray-700">{unit}</span>}
    </div>
  );
};

export default NumberInputWithControls;
