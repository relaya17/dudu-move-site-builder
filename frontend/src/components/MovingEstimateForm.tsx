// components/MovingEstimateForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, MapPin, CalendarDays, Building, Package, 
  Info, Plus, Trash2, Eye, Home, Upload, X, DollarSign, AlertCircle, CheckCircle, Moon, Sun
} from 'lucide-react';
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
  originHasCrane: boolean;
  destinationHasCrane: boolean;
}

interface FurniturePricing {
  [key: string]: {
    basePrice: number;
    description: string;
    isFragile: boolean;
    needsDisassemble: boolean;
  };
}

interface FurnitureItemWithImage extends FurnitureItem {
  image?: File;
  imagePreview?: string;
}

export const MovingEstimateForm = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    originHasCrane: false,
    destinationHasCrane: false,
  });

  const [inventory, setInventory] = useState<FurnitureItemWithImage[]>([
    { type: 'bed_double', quantity: 1, description: '', isFragile: false, needsDisassemble: true, needsReassemble: true, comments: '' },
    { type: 'dining_corner_medium', quantity: 1, description: '', isFragile: false, needsDisassemble: true, needsReassemble: true, comments: '' },
    { type: 'bag', quantity: 5, description: '', isFragile: false, needsDisassemble: false, needsReassemble: false, comments: '' },
    { type: 'box', quantity: 10, description: '', isFragile: false, needsDisassemble: false, needsReassemble: false, comments: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPriceAnimation, setShowPriceAnimation] = useState(false);

  // מחירי רהיטים
  const furniturePricing: FurniturePricing = {
    sofa: { basePrice: 300, description: 'ספה', isFragile: false, needsDisassemble: true },
    bed_single: { basePrice: 250, description: 'מיטת יחיד', isFragile: false, needsDisassemble: true },
    bed_double: { basePrice: 450, description: 'מיטה זוגית', isFragile: false, needsDisassemble: true },
    bed: { basePrice: 350, description: 'מיטה', isFragile: false, needsDisassemble: true },
    table: { basePrice: 150, description: 'שולחן', isFragile: false, needsDisassemble: true },
    chair: { basePrice: 50, description: 'כיסא', isFragile: false, needsDisassemble: false },
    armchair: { basePrice: 120, description: 'כורסה', isFragile: false, needsDisassemble: false },
    mattress: { basePrice: 80, description: 'מזרן', isFragile: true, needsDisassemble: false },
    wardrobe: { basePrice: 250, description: 'ארון בגדים', isFragile: false, needsDisassemble: true },
    desk: { basePrice: 180, description: 'שולחן עבודה', isFragile: false, needsDisassemble: true },
    dining_table: { basePrice: 200, description: 'שולחן אוכל', isFragile: false, needsDisassemble: true },
    dining_corner_small: { basePrice: 150, description: 'פינת אוכל קטנה', isFragile: false, needsDisassemble: true },
    dining_corner_medium: { basePrice: 500, description: 'פינת אוכל בינונית', isFragile: false, needsDisassemble: true },
    dining_corner_large: { basePrice: 700, description: 'פינת אוכל גדולה', isFragile: false, needsDisassemble: true },
    cabinet: { basePrice: 120, description: 'ארון', isFragile: false, needsDisassemble: true },
    cabinet_small: { basePrice: 100, description: 'ארון קטן', isFragile: false, needsDisassemble: true },
    cabinet_large: { basePrice: 150, description: 'ארון גדול', isFragile: false, needsDisassemble: true },
    bookshelf: { basePrice: 100, description: 'מדף ספרים', isFragile: false, needsDisassemble: true },
    drawer: { basePrice: 80, description: 'מגירה', isFragile: false, needsDisassemble: false },
    tv: { basePrice: 120, description: 'טלוויזיה', isFragile: true, needsDisassemble: false },
    computer: { basePrice: 80, description: 'מחשב', isFragile: true, needsDisassemble: false },
    refrigerator: { basePrice: 400, description: 'מקרר', isFragile: true, needsDisassemble: false },
    washing_machine: { basePrice: 200, description: 'מכונת כביסה', isFragile: true, needsDisassemble: false },
    dishwasher: { basePrice: 180, description: 'מדיח כלים', isFragile: true, needsDisassemble: false },
    microwave: { basePrice: 60, description: 'מיקרוגל', isFragile: true, needsDisassemble: false },
    toaster: { basePrice: 30, description: 'טוסטר', isFragile: true, needsDisassemble: false },
    coffee_machine: { basePrice: 50, description: 'מכונת קפה', isFragile: true, needsDisassemble: false },
    mirror: { basePrice: 40, description: 'מראה', isFragile: true, needsDisassemble: false },
    lamp: { basePrice: 30, description: 'מנורה', isFragile: true, needsDisassemble: false },
    rug: { basePrice: 40, description: 'שטיח', isFragile: false, needsDisassemble: false },
    bag: { basePrice: 20, description: 'שקית', isFragile: false, needsDisassemble: false },
    box: { basePrice: 20, description: 'קרטון', isFragile: false, needsDisassemble: false },
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

  const handleInventoryChange = (index: number, field: keyof FurnitureItemWithImage, value: any) => {
    const updatedInventory = [...inventory];
    updatedInventory[index] = { ...updatedInventory[index], [field]: value };
    setInventory(updatedInventory);
  };

  const addItem = () => {
    setInventory([...inventory, { type: 'other', quantity: 1, description: '', isFragile: false, needsDisassemble: false, needsReassemble: false, comments: '' }]);
  };

  const removeItem = (index: number) => {
    setInventory(inventory.filter((_, i) => i !== index));
  };

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newInventory = [...inventory];
      newInventory[index] = {
        ...newInventory[index],
        image: file,
        imagePreview: e.target?.result as string
      };
      setInventory(newInventory);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newInventory = [...inventory];
    newInventory[index] = {
      ...newInventory[index],
      image: undefined,
      imagePreview: undefined
    };
    setInventory(newInventory);
  };

  // חישוב מחיר לפריט
  const calculateItemPrice = (itemType: string, quantity: number, isFragile: boolean, needsDisassemble: boolean): number => {
    const pricing = furniturePricing[itemType] || furniturePricing.other;
    let price = pricing.basePrice * quantity;

    // מכפיל לפריטים שבירים
    if (isFragile) {
      price *= 1.5;
    }

    // מחיר פירוק והרכבה - מחירים שונים לארונות
    if (needsDisassemble) {
      let disassemblePrice = 100; // מחיר בסיס לפירוק
      let reassemblePrice = 150;  // מחיר בסיס להרכבה
      
      // מחירים מיוחדים לארונות
      if (itemType === 'cabinet_small') {
        disassemblePrice = 250; // פירוק ארון קטן
        reassemblePrice = 350;  // הרכבה ארון קטן
      } else if (itemType === 'cabinet_large') {
        disassemblePrice = 300; // פירוק ארון גדול
        reassemblePrice = 500;  // הרכבה ארון גדול
      } else if (itemType === 'cabinet') {
        disassemblePrice = 275; // פירוק ארון רגיל
        reassemblePrice = 425;  // הרכבה ארון רגיל
      }
      
      price += disassemblePrice + reassemblePrice;
    }

    return Math.round(price);
  };

  // חישוב מחיר כולל
  const calculateTotalPrice = (): number => {
    const basePrice = 500; // מחיר בסיס
    const apartmentPrice = apartmentPrices[formData.apartmentType] || 500;
    
    let furniturePrice = 0;
    inventory.forEach(item => {
      furniturePrice += calculateItemPrice(item.type, item.quantity, item.isFragile || false, item.needsDisassemble || false);
    });

    // מחיר קומות
    const floorDifference = Math.abs(formData.destinationFloor - formData.originFloor);
    let floorPrice = floorDifference * 50;
    if (formData.originHasElevator && formData.destinationHasElevator) {
      floorPrice *= 0.8; // הנחה במעלית
    }

    // מחיר מנוף
    let cranePrice = 0;
    if (formData.originHasCrane) {
      cranePrice += 800; // מנוף בכתובת הנוכחית
    }
    if (formData.destinationHasCrane) {
      cranePrice += 800; // מנוף בכתובת היעד
    }

    return basePrice + apartmentPrice + furniturePrice + floorPrice + cranePrice;
  };

  const totalPrice = calculateTotalPrice();
  const basePrice = 500; // מחיר בסיס
  const apartmentPrice = apartmentPrices[formData.apartmentType] || 500;
  let furniturePrice = 0;
  inventory.forEach(item => {
    furniturePrice += calculateItemPrice(item.type, item.quantity, item.isFragile || false, item.needsDisassemble || false);
  });
  const floorDifference = Math.abs(formData.destinationFloor - formData.originFloor);
  let floorPrice = floorDifference * 50;
  if (formData.originHasElevator && formData.destinationHasElevator) {
    floorPrice *= 0.8; // הנחה במעלית
  }
  let cranePrice = 0;
  if (formData.originHasCrane) {
    cranePrice += 800; // מנוף בכתובת הנוכחית
  }
  if (formData.destinationHasCrane) {
    cranePrice += 800; // מנוף בכתובת היעד
  }

  // אפקט אנימציה למחיר
  useEffect(() => {
    setShowPriceAnimation(true);
    const timer = setTimeout(() => setShowPriceAnimation(false), 300);
    return () => clearTimeout(timer);
  }, [totalPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // בדיקת ולידציה לפני שליחה
    if (!formData.name || !formData.phone || !formData.apartmentType || 
        !formData.currentAddress || !formData.destinationAddress || inventory.length === 0) {
      setError('אנא מלא את כל השדות הנדרשים ווודא שיש לפחות פריט אחד ברשימה');
      return;
    }

    // בדיקת סוג דירה
    const validApartmentTypes = ['1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+'];
    if (!validApartmentTypes.includes(formData.apartmentType)) {
      setError('אנא בחר סוג דירה מהרשימה');
      return;
    }

    // בדיקת פורמט טלפון
    const phoneRegex = /^05\d{8}$/;
    const formattedPhone = formData.phone.startsWith('05') ? formData.phone : `05${formData.phone}`;
    if (!phoneRegex.test(formattedPhone)) {
      setError('מספר טלפון לא תקין - חייב להתחיל ב-05 ולהכיל 10 ספרות');
      return;
    }

    // בדיקת כתובות
    if (formData.currentAddress.length < 5 || formData.destinationAddress.length < 5) {
      setError('כתובת חייבת להכיל לפחות 5 תווים');
      return;
    }

    // בדיקת קומות
    if (typeof formData.originFloor !== 'number' || typeof formData.destinationFloor !== 'number') {
      setError('אנא הזן מספר קומה תקין');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await MovingEstimateService.submitEstimateRequest(formData, inventory);
      
      // שליחת מייל אישור
      await sendConfirmationEmail(formData, inventory, result);
      
      setSuccess(true);
      console.log('הערכת מחיר נשלחה בהצלחה:', result);
      
      // מעבר לדף תודה אחרי 2 שניות
      setTimeout(() => {
        window.location.href = '/thank-you';
      }, 2000);
      
    } catch (err) {
      console.error('שגיאה בשליחת הערכת מחיר:', err);
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בשליחת הבקשה');
    } finally {
      setLoading(false);
    }
  };

  // פונקציה לשליחת מייל אישור
  const sendConfirmationEmail = async (customerData: FormData, furnitureItems: FurnitureItemWithImage[], result: any) => {
    try {
      const emailData = {
        to: customerData.email,
        subject: 'הערכת מחיר להובלה - דודו הובלות',
        html: generateEmailHTML(customerData, furnitureItems, result)
      };

      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        console.error('שגיאה בשליחת מייל אישור');
      }
    } catch (error) {
      console.error('שגיאה בשליחת מייל:', error);
    }
  };

  // יצירת תוכן המייל
  const generateEmailHTML = (customerData: FormData, furnitureItems: FurnitureItemWithImage[], result: any) => {
    const totalPrice = calculateTotalPrice();
    const furnitureList = furnitureItems.map(item => {
      const pricing = furniturePricing[item.type] || furniturePricing.other;
             const itemPrice = calculateItemPrice(item.type, item.quantity, item.isFragile || false, item.needsDisassemble || false);
      return `
        <tr>
          <td>${pricing.description}</td>
          <td>${item.quantity}</td>
          <td>₪${itemPrice}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>הערכת מחיר להובלה - דודו הובלות</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .price-summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: right; border-bottom: 1px solid #ddd; }
          th { background: #f3f4f6; font-weight: bold; }
          .total-price { font-size: 24px; font-weight: bold; color: #1f2937; }
          .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>דודו הובלות</h1>
            <h2>הערכת מחיר להובלה</h2>
          </div>
          
          <div class="content">
            <h3>שלום ${customerData.name},</h3>
            <p>תודה על פנייתך לדודו הובלות!</p>
            <p>הערכת המחיר שלך מוכנה. להלן הפרטים:</p>
            
            <div class="price-summary">
              <h4>פרטי המעבר:</h4>
              <p><strong>מכתובת:</strong> ${customerData.currentAddress}${customerData.originFloor > 0 ? ` (קומה ${customerData.originFloor})` : ''}${customerData.originHasElevator ? ' - יש מעלית' : ''}${customerData.originHasCrane ? ' - נדרש מנוף' : ''}</p>
              <p><strong>אל כתובת:</strong> ${customerData.destinationAddress}${customerData.destinationFloor > 0 ? ` (קומה ${customerData.destinationFloor})` : ''}${customerData.destinationHasElevator ? ' - יש מעלית' : ''}${customerData.destinationHasCrane ? ' - נדרש מנוף' : ''}</p>
              <p><strong>סוג דירה:</strong> ${customerData.apartmentType} חדרים</p>
              ${customerData.preferredMoveDate ? `<p><strong>תאריך מועדף:</strong> ${customerData.preferredMoveDate}</p>` : ''}
            </div>
            
            <h4>רשימת הפריטים:</h4>
            <table>
              <thead>
                <tr>
                  <th>פריט</th>
                  <th>כמות</th>
                  <th>מחיר</th>
                </tr>
              </thead>
              <tbody>
                ${furnitureList}
              </tbody>
            </table>
            
            <div class="price-summary">
              <h4>סיכום מחיר:</h4>
              <p class="total-price">₪${totalPrice.toLocaleString()}</p>
              <p><small>* המחיר הינו הערכה בלבד ועשוי להשתנות בהתאם לתנאים בפועל</small></p>
              <p><small>* כולל מחיר קומות: ₪${Math.abs(customerData.destinationFloor - customerData.originFloor) * 50}</small></p>
              ${(customerData.originHasElevator && customerData.destinationHasElevator) ? '<p><small>* הנחה במעלית: 20%</small></p>' : ''}
              ${(customerData.originHasCrane || customerData.destinationHasCrane) ? `<p><small>* מנוף: ₪${(customerData.originHasCrane ? 800 : 0) + (customerData.destinationHasCrane ? 800 : 0)}</small></p>` : ''}
            </div>
            
            <p><strong>מספר בקשה:</strong> ${result.id}</p>
            
            <h4>השלבים הבאים:</h4>
            <ol>
              <li>נציג שלנו יצור איתך קשר תוך 24 שעות</li>
              <li>נאשר את הפרטים ונקבע תאריך להובלה</li>
              <li>נגיע בזמן עם צוות מקצועי</li>
            </ol>
          </div>
          
          <div class="footer">
            <p><strong>דודו הובלות</strong></p>
            <p>טלפון: 03-1234567</p>
            <p>אימייל: info@dudu-move.co.il</p>
            <p>שעות פעילות: א'-ה' 8:00-20:00</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const apartmentTypes = [
    { value: '1.5', label: 'מספר חדרים' },
    { value: '2', label: '2 חדרים' },
    { value: '2.5', label: '2.5 חדרים' },
    { value: '3', label: '3 חדרים' },
    { value: '3.5', label: '3.5 חדרים' },
    { value: '4', label: '4 חדרים' },
    { value: '4.5', label: '4.5 חדרים' },
    { value: '5+', label: '5+ חדרים' },
  ];

  const furnitureTypes = {
    sofa: 'ספה',
    bed_single: 'מיטת יחיד',
    bed_double: 'מיטה זוגית',
    bed: 'מיטה',
    table: 'שולחן',
    chair: 'כיסא',
    armchair: 'כורסה',
    mattress: 'מזרן',
    wardrobe: 'ארון בגדים',
    desk: 'שולחן עבודה',
    dining_table: 'שולחן אוכל',
    dining_corner_small: 'פינת אוכל קטנה',
    dining_corner_medium: 'פינת אוכל בינונית',
    dining_corner_large: 'פינת אוכל גדולה',
    cabinet: 'ארון',
    cabinet_small: 'ארון קטן',
    cabinet_large: 'ארון גדול',
    bookshelf: 'מדף ספרים',
    drawer: 'מגירה',
    tv: 'טלוויזיה',
    computer: 'מחשב',
    refrigerator: 'מקרר',
    washing_machine: 'מכונת כביסה',
    dishwasher: 'מדיח כלים',
    microwave: 'מיקרוגל',
    toaster: 'טוסטר',
    coffee_machine: 'מכונת קפה',
    mirror: 'מראה',
    lamp: 'מנורה',
    rug: 'שטיח',
    bag: 'שקית',
    box: 'קרטון',
    other: 'אחר',
  };

  // פונקציה למעבר בין מצבים
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <Card className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Home className="h-6 w-6 text-blue-600" />
                <CardTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : ''}`}>
                  בקשת הערכת מחיר להובלה
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className={`${isDarkMode ? 'border-gray-600 text-white hover:bg-gray-700' : ''}`}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : ''}`}>
              מלא את הפרטים למטה ונשמח לספק לך הערכת מחיר מדויקת
            </CardDescription>
          </CardHeader>

          <CardContent className={`space-y-6 ${isDarkMode ? 'bg-gray-800 text-white' : ''}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* פרטי לקוח */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  פרטי לקוח
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="name">שם מלא</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>הזן את השם המלא כפי שמופיע בתעודת זהות</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="לדוגמה: יוסי כהן"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="phone">מספר טלפון</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>הזן מספר טלפון שמתחיל ב-05 ומכיל 10 ספרות</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="05XXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="email">כתובת אימייל</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>האימייל יישלח אליו הערכת המחיר המפורטת</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="apartmentType">סוג דירה</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>בחר את גודל הדירה - מספר החדרים כולל חדר שירותים</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {apartmentTypes.map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.apartmentType === type.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleInputChange('apartmentType', type.value)}
                        >
                          <div className="text-center">
                            <Building className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.value} חדרים</div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <Label htmlFor="currentAddress">כתובת נוכחית</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>הכתובת שממנה נעבור - רחוב, מספר בית, עיר</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                      placeholder="לדוגמה: הרצל 123, תל אביב"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destinationAddress">כתובת יעד</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>הכתובת שאליה נעבור - רחוב, מספר בית, עיר</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="destinationAddress"
                      value={formData.destinationAddress}
                      onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                      placeholder="לדוגמה: ויצמן 456, חיפה"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="apartmentType">סוג דירה</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>בחר את גודל הדירה - מספר החדרים כולל חדר שירותים</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="preferredMoveDate">תאריך מעבר מועדף</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>תאריך המעבר המועדף עליכם - לא מחייב</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="preferredMoveDate"
                        type="date"
                        value={formData.preferredMoveDate}
                        onChange={(e) => handleInputChange('preferredMoveDate', e.target.value)}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* קומות ומעליות */}
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>פרטי קומות ומעליות - עוזר לנו לחשב את המחיר המדויק</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* כתובת נוכחית */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900">כתובת נוכחית</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="originFloor">קומה</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>הקומה של הדירה הנוכחית (0 = קרקע)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Input
                            id="originFloor"
                            type="number"
                            min="0"
                            value={formData.originFloor}
                            onChange={(e) => handleInputChange('originFloor', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id="originHasElevator"
                            checked={formData.originHasElevator}
                            onCheckedChange={(checked) => handleInputChange('originHasElevator', checked as boolean)}
                          />
                          <Label htmlFor="originHasElevator">יש מעלית</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id="originHasCrane"
                            checked={formData.originHasCrane}
                            onCheckedChange={(checked) => handleInputChange('originHasCrane', checked as boolean)}
                          />
                          <Label htmlFor="originHasCrane">נדרש מנוף</Label>
                        </div>
                      </div>
                    </div>

                    {/* כתובת יעד */}
                    <div className="space-y-3 p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-900">כתובת יעד</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="destinationFloor">קומה</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>הקומה של הדירה החדשה (0 = קרקע)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Input
                            id="destinationFloor"
                            type="number"
                            min="0"
                            value={formData.destinationFloor}
                            onChange={(e) => handleInputChange('destinationFloor', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id="destinationHasElevator"
                            checked={formData.destinationHasElevator}
                            onCheckedChange={(checked) => handleInputChange('destinationHasElevator', checked as boolean)}
                          />
                          <Label htmlFor="destinationHasElevator">יש מעלית</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id="destinationHasCrane"
                            checked={formData.destinationHasCrane}
                            onCheckedChange={(checked) => handleInputChange('destinationHasCrane', checked as boolean)}
                          />
                          <Label htmlFor="destinationHasCrane">נדרש מנוף</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* רשימת רהיטים */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      רשימת רהיטים
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>הוסף את כל הרהיטים והפריטים שצריך להעביר</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                                                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                   <Plus className="h-4 w-4 ml-2" />
                   הוסף פריט נוסף
                 </Button>
                </div>

                <div className="space-y-3">
                  {inventory.map((item, index) => (
                    <Card key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">פריט {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`type-${index}`}>סוג פריט</Label>
                          <Select
                            value={item.type}
                            onValueChange={(value) => handleInventoryChange(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(furnitureTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`quantity-${index}`}>כמות</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleInventoryChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`description-${index}`}>תיאור (אופציונלי)</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={item.description}
                          onChange={(e) => handleInventoryChange(index, 'description', e.target.value)}
                          placeholder="תיאור מפורט של הפריט..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`fragile-${index}`}
                            checked={item.isFragile}
                            onCheckedChange={(checked) => handleInventoryChange(index, 'isFragile', checked as boolean)}
                          />
                          <Label htmlFor={`fragile-${index}`}>שביר</Label>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`disassemble-${index}`}
                            checked={item.needsDisassemble}
                            onCheckedChange={(checked) => handleInventoryChange(index, 'needsDisassemble', checked as boolean)}
                          />
                          <Label htmlFor={`disassemble-${index}`}>נדרש פירוק</Label>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={`reassemble-${index}`}
                            checked={item.needsReassemble}
                            onCheckedChange={(checked) => handleInventoryChange(index, 'needsReassemble', checked as boolean)}
                          />
                          <Label htmlFor={`reassemble-${index}`}>נדרש הרכבה</Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`comments-${index}`}>הערות נוספות</Label>
                        <Textarea
                          id={`comments-${index}`}
                          value={item.comments}
                          onChange={(e) => handleInventoryChange(index, 'comments', e.target.value)}
                          placeholder="הערות מיוחדות לפריט זה..."
                        />
                      </div>

                      {/* תמונה */}
                      <div>
                        <Label>תמונה של הפריט (אופציונלי)</Label>
                        <div className="mt-2 space-y-2">
                          {item.imagePreview ? (
                            <div className="relative">
                              <img
                                src={item.imagePreview}
                                                         alt={`תמונה של ${furnitureTypes[item.type as keyof typeof furnitureTypes] || 'פריט'}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <Label htmlFor={`image-${index}`} className="cursor-pointer text-blue-600 hover:text-blue-700">
                                לחץ להעלאת תמונה
                              </Label>
                              <Input
                                id={`image-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(index, file);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          מחיר משוער: ₪{calculateItemPrice(item.type, item.quantity, item.isFragile || false, item.needsDisassemble || false)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* הערות נוספות */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="additionalNotes">הערות נוספות</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>פרטים נוספים כמו חניה, גישה מיוחדת, שעות מועדפות וכו'</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      סיכום מחיר
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>הערכת מחיר משוערת - המחיר הסופי ייקבע לאחר בדיקה</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    <span className={`transition-all duration-300 ${showPriceAnimation ? 'scale-110 text-green-600' : ''}`}>
                      ₪{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* פירוט המחיר */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>מחיר בסיס:</span>
                    <span>₪{basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>מחיר דירה ({formData.apartmentType || 'לא נבחר'} חדרים):</span>
                    <span>₪{apartmentPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>מחיר רהיטים ({inventory.length} פריטים):</span>
                    <span>₪{furniturePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>מחיר קומות:</span>
                    <span>₪{floorPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>מחיר מנוף:</span>
                    <span>₪{cranePrice.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>סה"כ:</span>
                    <span>₪{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  * המחיר הינו הערכה בלבד ועשוי להשתנות בהתאם לתנאים בפועל
                  <br />
                  * מחיר קומות מחושב לפי הפרש הקומות (₪50 לקומה)
                  <br />
                  * הנחה של 20% במעלית בשתי הכתובות
                  <br />
                  * מנוף: ₪800 לכל כתובת שדורשת מנוף
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
                    בקשת הערכת המחיר נשלחה בהצלחה! המייל נשלח לכתובת שציינת. 
                    <br />
                    <span className="text-sm text-muted-foreground">
                      מעבר לדף תודה בעוד מספר שניות...
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* כפתור שליחה */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      תצוגה מקדימה
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>תצוגה מקדימה - בקשת הערכת מחיר</DialogTitle>
                      <DialogDescription>
                        בדוק את כל הפרטים לפני השליחה
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* פרטי לקוח */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            פרטי לקוח
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">שם מלא</Label>
                              <p className="text-sm text-muted-foreground">{formData.name || 'לא הוזן'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">טלפון</Label>
                              <p className="text-sm text-muted-foreground">{formData.phone || 'לא הוזן'}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">אימייל</Label>
                            <p className="text-sm text-muted-foreground">{formData.email || 'לא הוזן'}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* פרטי המעבר */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            פרטי המעבר
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">כתובת נוכחית</Label>
                              <p className="text-sm text-muted-foreground">{formData.currentAddress || 'לא הוזן'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">כתובת יעד</Label>
                              <p className="text-sm text-muted-foreground">{formData.destinationAddress || 'לא הוזן'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">סוג דירה</Label>
                              <p className="text-sm text-muted-foreground">{formData.apartmentType ? `${formData.apartmentType} חדרים` : 'לא נבחר'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">תאריך מועדף</Label>
                              <p className="text-sm text-muted-foreground">{formData.preferredMoveDate || 'לא נבחר'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">קומות ומעליות</Label>
                              <p className="text-sm text-muted-foreground">
                                קומה נוכחית: {formData.originFloor} | קומה יעד: {formData.destinationFloor}
                                <br />
                                מעלית נוכחית: {formData.originHasElevator ? 'כן' : 'לא'} | מעלית יעד: {formData.destinationHasElevator ? 'כן' : 'לא'}
                                <br />
                                מנוף נוכחי: {formData.originHasCrane ? 'כן' : 'לא'} | מנוף יעד: {formData.destinationHasCrane ? 'כן' : 'לא'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* רשימת רהיטים */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            רשימת רהיטים ({inventory.length} פריטים)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {inventory.length === 0 ? (
                            <p className="text-sm text-muted-foreground">לא נוספו פריטים</p>
                          ) : (
                            <div className="space-y-2">
                              {inventory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <p className="font-medium">{item.type}</p>
                                    <p className="text-sm text-muted-foreground">כמות: {item.quantity}</p>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                                                 ₪{calculateItemPrice(item.type, item.quantity, item.isFragile || false, item.needsDisassemble || false).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* הערות נוספות */}
                      {formData.additionalNotes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              הערות נוספות
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{formData.additionalNotes}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* סיכום מחיר */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            סיכום מחיר
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-primary">
                            ₪{totalPrice.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'שולח...' : 'שלח בקשת הערכת מחיר'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    const message = `שלום! אני מעוניין בהערכת מחיר להובלה:
                    
שם: ${formData.name}
טלפון: ${formData.phone}
אימייל: ${formData.email}

מכתובת: ${formData.currentAddress}
אל כתובת: ${formData.destinationAddress}
סוג דירה: ${formData.apartmentType} חדרים

הערכת מחיר משוערת: ₪${totalPrice.toLocaleString()}

אשמח לקבל הצעה מפורטת!`;
                    
                    const whatsappUrl = `https://wa.me/972501234567?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  שלח לוואטסאפ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
