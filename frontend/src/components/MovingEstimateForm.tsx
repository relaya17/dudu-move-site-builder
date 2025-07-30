// components/MovingEstimateForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, Calendar, Phone, Mail, User, Package, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import MovingEstimateService from '@/services/movingEstimateService';
import { FurnitureItem } from '@/types/movingEstimate';

interface FormData {
  name: string;
  email: string;
  phone: string;
  apartmentType: string;
  preferredMoveDate: string;
  currentAddress: string;
  destinationAddress: string;
  additionalNotes: string;
  originFloor: number;
  destinationFloor: number;
  originHasElevator: boolean;
  destinationHasElevator: boolean;
}

interface FurniturePricing {
  [key: string]: {
    basePrice: number;
    description: string;
    isFragile: boolean;
    needsDisassemble: boolean;
  };
}

export const MovingEstimateForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    apartmentType: '',
    preferredMoveDate: '',
    currentAddress: '',
    destinationAddress: '',
    additionalNotes: '',
    originFloor: 0,
    destinationFloor: 0,
    originHasElevator: false,
    destinationHasElevator: false,
  });

  const [inventory, setInventory] = useState<FurnitureItem[]>([
    { type: 'sofa', quantity: 1, description: 'ספה' },
    { type: 'bed', quantity: 1, description: 'מיטה' },
    { type: 'table', quantity: 1, description: 'שולחן' },
    { type: 'chair', quantity: 4, description: 'כיסאות' },
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // מחירי רהיטים
  const furniturePricing: FurniturePricing = {
    sofa: { basePrice: 300, description: 'ספה', isFragile: false, needsDisassemble: true },
    bed: { basePrice: 200, description: 'מיטה', isFragile: false, needsDisassemble: true },
    table: { basePrice: 150, description: 'שולחן', isFragile: false, needsDisassemble: true },
    chair: { basePrice: 50, description: 'כיסא', isFragile: false, needsDisassemble: false },
    armchair: { basePrice: 120, description: 'כורסה', isFragile: false, needsDisassemble: false },
    mattress: { basePrice: 80, description: 'מזרן', isFragile: true, needsDisassemble: false },
    wardrobe: { basePrice: 250, description: 'ארון בגדים', isFragile: false, needsDisassemble: true },
    desk: { basePrice: 180, description: 'שולחן עבודה', isFragile: false, needsDisassemble: true },
    dining_table: { basePrice: 200, description: 'שולחן אוכל', isFragile: false, needsDisassemble: true },
    tv: { basePrice: 120, description: 'טלוויזיה', isFragile: true, needsDisassemble: false },
    computer: { basePrice: 80, description: 'מחשב', isFragile: true, needsDisassemble: false },
    refrigerator: { basePrice: 400, description: 'מקרר', isFragile: true, needsDisassemble: false },
    washing_machine: { basePrice: 200, description: 'מכונת כביסה', isFragile: true, needsDisassemble: false },
    dishwasher: { basePrice: 180, description: 'מדיח כלים', isFragile: true, needsDisassemble: false },
    cabinet: { basePrice: 120, description: 'ארון', isFragile: false, needsDisassemble: true },
    bookshelf: { basePrice: 100, description: 'מדף ספרים', isFragile: false, needsDisassemble: true },
    drawer: { basePrice: 80, description: 'מגירה', isFragile: false, needsDisassemble: false },
    microwave: { basePrice: 60, description: 'מיקרוגל', isFragile: true, needsDisassemble: false },
    toaster: { basePrice: 30, description: 'טוסטר', isFragile: true, needsDisassemble: false },
    coffee_machine: { basePrice: 50, description: 'מכונת קפה', isFragile: true, needsDisassemble: false },
    mirror: { basePrice: 40, description: 'מראה', isFragile: true, needsDisassemble: false },
    lamp: { basePrice: 30, description: 'מנורה', isFragile: true, needsDisassemble: false },
    rug: { basePrice: 40, description: 'שטיח', isFragile: false, needsDisassemble: false },
    other: { basePrice: 50, description: 'אחר', isFragile: false, needsDisassemble: false },
  };

  const apartmentPrices: { [key: string]: number } = {
    '1.5': 200,
    '2': 300,
    '2.5': 400,
    '3': 500,
    '3.5': 600,
    '4': 700,
    '4.5': 800,
    '5+': 1000
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInventoryChange = (index: number, field: keyof FurnitureItem, value: string | number) => {
    const newInventory = [...inventory];
    newInventory[index] = {
      ...newInventory[index],
      [field]: value
    };
    setInventory(newInventory);
  };

  const addInventoryItem = () => {
    setInventory([...inventory, { type: 'other', quantity: 1, description: '' }]);
  };

  const removeInventoryItem = (index: number) => {
    setInventory(inventory.filter((_, i) => i !== index));
  };

  // חישוב מחיר לפריט
  const calculateItemPrice = (item: FurnitureItem): number => {
    const pricing = furniturePricing[item.type] || furniturePricing.other;
    let price = pricing.basePrice * item.quantity;

    // מכפיל לפריטים שבירים
    if (pricing.isFragile) {
      price *= 1.5;
    }

    // מחיר פירוק והרכבה
    if (pricing.needsDisassemble) {
      price += 250; // 100 פירוק + 150 הרכבה
    }

    return Math.round(price);
  };

  // חישוב מחיר כולל
  const calculateTotalPrice = (): number => {
    const basePrice = 500; // מחיר בסיס
    const apartmentPrice = apartmentPrices[formData.apartmentType] || 500;
    
    let furniturePrice = 0;
    inventory.forEach(item => {
      furniturePrice += calculateItemPrice(item);
    });

    // מחיר קומות
    const floorDifference = Math.abs(formData.destinationFloor - formData.originFloor);
    let floorPrice = floorDifference * 50;
    if (formData.originHasElevator && formData.destinationHasElevator) {
      floorPrice *= 0.8; // הנחה במעלית
    }

    return basePrice + apartmentPrice + furniturePrice + floorPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await MovingEstimateService.submitEstimateRequest(formData, inventory);
      setSuccess(true);
      console.log('הערכת מחיר נשלחה בהצלחה:', result);
    } catch (err) {
      console.error('שגיאה בשליחת הערכת מחיר:', err);
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בשליחת הבקשה');
    } finally {
      setLoading(false);
    }
  };

  const apartmentTypes = [
    { value: '1.5', label: '1.5 חדרים' },
    { value: '2', label: '2 חדרים' },
    { value: '2.5', label: '2.5 חדרים' },
    { value: '3', label: '3 חדרים' },
    { value: '3.5', label: '3.5 חדרים' },
    { value: '4', label: '4 חדרים' },
    { value: '4.5', label: '4.5 חדרים' },
    { value: '5+', label: '5+ חדרים' },
  ];

  const furnitureTypes = [
    { value: 'sofa', label: 'ספה' },
    { value: 'bed', label: 'מיטה' },
    { value: 'table', label: 'שולחן' },
    { value: 'chair', label: 'כיסא' },
    { value: 'armchair', label: 'כורסה' },
    { value: 'mattress', label: 'מזרן' },
    { value: 'wardrobe', label: 'ארון בגדים' },
    { value: 'desk', label: 'שולחן עבודה' },
    { value: 'dining_table', label: 'שולחן אוכל' },
    { value: 'cabinet', label: 'ארון' },
    { value: 'bookshelf', label: 'מדף ספרים' },
    { value: 'drawer', label: 'מגירה' },
    { value: 'tv', label: 'טלוויזיה' },
    { value: 'computer', label: 'מחשב' },
    { value: 'refrigerator', label: 'מקרר' },
    { value: 'washing_machine', label: 'מכונת כביסה' },
    { value: 'dishwasher', label: 'מדיח כלים' },
    { value: 'microwave', label: 'מיקרוגל' },
    { value: 'toaster', label: 'טוסטר' },
    { value: 'coffee_machine', label: 'מכונת קפה' },
    { value: 'mirror', label: 'מראה' },
    { value: 'lamp', label: 'מנורה' },
    { value: 'rug', label: 'שטיח' },
    { value: 'other', label: 'אחר' },
  ];

  const totalPrice = calculateTotalPrice();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          בקשת הערכת מחיר להובלה
        </CardTitle>
        <CardDescription>
          מלא את הפרטים וקבל הערכת מחיר מדויקת להובלת הדירה שלך
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* פרטי לקוח */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              פרטי לקוח
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="שם מלא"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">טלפון *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="050-1234567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartmentType">סוג דירה *</Label>
                <Select value={formData.apartmentType} onValueChange={(value) => handleInputChange('apartmentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג דירה" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* פרטי המעבר */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Home className="h-4 w-4" />
              פרטי המעבר
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAddress">כתובת נוכחית *</Label>
                <Input
                  id="currentAddress"
                  value={formData.currentAddress}
                  onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                  placeholder="רחוב, עיר"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationAddress">כתובת יעד *</Label>
                <Input
                  id="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                  placeholder="רחוב, עיר"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredMoveDate">תאריך מעבר מועדף</Label>
                <Input
                  id="preferredMoveDate"
                  type="date"
                  value={formData.preferredMoveDate}
                  onChange={(e) => handleInputChange('preferredMoveDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originFloor">קומה נוכחית</Label>
                <Input
                  id="originFloor"
                  type="number"
                  min="0"
                  value={formData.originFloor}
                  onChange={(e) => handleInputChange('originFloor', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationFloor">קומת יעד</Label>
                <Input
                  id="destinationFloor"
                  type="number"
                  min="0"
                  value={formData.destinationFloor}
                  onChange={(e) => handleInputChange('destinationFloor', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="originHasElevator"
                  checked={formData.originHasElevator}
                  onCheckedChange={(checked) => handleInputChange('originHasElevator', checked as boolean)}
                />
                <Label htmlFor="originHasElevator">מעלית בכתובת הנוכחית</Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="destinationHasElevator"
                  checked={formData.destinationHasElevator}
                  onCheckedChange={(checked) => handleInputChange('destinationHasElevator', checked as boolean)}
                />
                <Label htmlFor="destinationHasElevator">מעלית בכתובת היעד</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* רשימת רהיטים */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                רשימת רהיטים
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addInventoryItem}>
                הוסף פריט
              </Button>
            </div>

            <div className="space-y-3">
              {inventory.map((item, index) => {
                const pricing = furniturePricing[item.type] || furniturePricing.other;
                const itemPrice = calculateItemPrice(item);
                
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg">
                    <Select 
                      value={item.type} 
                      onValueChange={(value) => handleInventoryChange(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="סוג פריט" />
                      </SelectTrigger>
                      <SelectContent>
                        {furnitureTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleInventoryChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="כמות"
                    />

                    <Input
                      value={item.description || ''}
                      onChange={(e) => handleInventoryChange(index, 'description', e.target.value)}
                      placeholder="תיאור (אופציונלי)"
                    />

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ₪{itemPrice}
                      </Badge>
                      {pricing.isFragile && (
                        <Badge variant="destructive" className="text-xs">שביר</Badge>
                      )}
                      {pricing.needsDisassemble && (
                        <Badge variant="secondary" className="text-xs">פירוק</Badge>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeInventoryItem(index)}
                    >
                      מחק
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* הערות נוספות */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">הערות נוספות</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="פרטים נוספים כמו חניה, גישה מיוחדת, שעות מועדפות וכו'"
              rows={3}
            />
          </div>

          {/* סיכום מחיר */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                סיכום מחיר
              </h3>
              <div className="text-2xl font-bold text-primary">
                ₪{totalPrice.toLocaleString()}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              * המחיר הינו הערכה בלבד ועשוי להשתנות בהתאם לתנאים בפועל
            </p>
          </div>

          {/* הודעות */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                בקשת הערכת המחיר נשלחה בהצלחה! נציג יצור איתך קשר בהקדם.
              </AlertDescription>
            </Alert>
          )}

          {/* כפתור שליחה */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'שולח...' : 'שלח בקשת הערכת מחיר'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
