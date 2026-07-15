import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { NumberInputWithControls } from './ui/NumberInputWithControls';
import { PriceEstimateBreakdown, type DetailedPriceEstimate } from './PriceEstimateBreakdown';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  moveType: string; // Changed from apartmentType
  moveDate: string;
  fromAddress: string;
  fromFloor: number;
  fromRooms: number; // Changed from string to number
  fromElevator: number; // Changed from boolean to number
  fromLift: boolean;
  elevatorDiameter: number; // Changed from string to number
  toAddress: string;
  toFloor: number;
  toRooms: number; // Changed from string to number
  toElevator: number; // Changed from boolean to number
  toLift: boolean;
  notes: string;
}

interface FurnitureOption {
  type: string;
  basePrice: number;
  description: string;
  isFragile: boolean;
  needsDisassemble: boolean;
  maxQuantity: number;
  category?: string;
  disassemblePrice: number;
  reassemblePrice: number;
  doorRemovalPrice: number;
}

interface ItemForm {
  id: number;
  type: string;
  quantity: number;
  fragile: boolean;
  disassemble: boolean;
  assemble: boolean;
  doorRemoval: boolean;
  note: string;
  img: File | null;
}

interface PriceRangeEstimate extends DetailedPriceEstimate {}

const STEP_NAMES = ['פרטים', 'דירה', 'כתובות', 'פריטים', 'סיכום'];

/**
 * מחוון שלבים פשוט - שוחזר בלי MUI Stepper (ר' הערה למעלה בקובץ על הסרת MUI
 * מהאתר לגמרי). עיגולים ממוספרים מחוברים בקו, השלב הנוכחי/שהושלמו מודגשים בכחול.
 */
function StepIndicator({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="flex items-start mb-8" role="list" aria-label="שלבי הטופס">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 shrink-0" role="listitem" aria-current={i === current ? 'step' : undefined}>
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i <= current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[10px] sm:text-xs text-center whitespace-nowrap ${
                i === current ? 'text-blue-700 font-semibold' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export const MovingEstimateForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<ItemForm[]>([
    { id: 1, type: '', quantity: 1, fragile: false, disassemble: false, assemble: false, doorRemoval: false, note: '', img: null }
  ]);
  const navigate = useNavigate();
  const [furnitureOptions, setFurnitureOptions] = useState<FurnitureOption[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRangeEstimate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    moveType: '', // Changed from apartmentType
    moveDate: '',
    fromAddress: '',
    fromFloor: 0,
    fromRooms: 0, // Changed from string to number
    fromElevator: 0, // Changed from false to 0
    fromLift: false,
    elevatorDiameter: 0, // Changed from string to number
    toAddress: '',
    toFloor: 0,
    toRooms: 0, // Changed from string to number
    toElevator: 0, // Changed from false to 0
    toLift: false,
    notes: ''
  });
  const formRef = useRef<HTMLFormElement>(null);

  const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3001'
      : 'https://dudu-move-backend.onrender.com');

  useEffect(() => {
    // Scroll to the top of the form when the step changes
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]); // Dependency array includes currentStep

  useEffect(() => {
    const fetchFurnitureOptions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pricing/furniture-items`);
        const data = await response.json();
        // Ensure data is an array
        setFurnitureOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch furniture options:', error);
        setFurnitureOptions([]); // Set empty array on error
      }
    };
    fetchFurnitureOptions();
  }, [API_URL]);

  // מקבץ את רשימת סוגי הפריטים לפי קטגוריה (תת-קטגוריות), לתצוגה כ-optgroup בתפריט הבחירה.
  const groupedFurnitureOptions = useMemo(() => {
    const groups = new Map<string, FurnitureOption[]>();
    for (const option of furnitureOptions) {
      const category = option.category || 'אחר';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(option);
    }
    return Array.from(groups.entries());
  }, [furnitureOptions]);

  const getFurnitureOption = (type: string): FurnitureOption | undefined =>
    furnitureOptions.find(option => option.type === type);

  // הערכת מחיר "חיה" - מחושבת בשרת (אותה נוסחה שתקבע את המחיר בפועל), ומוצגת
  // כטווח (לא נקודה בודדת) כדי לשקף שזו הערכה בלבד לפני אישור טלפוני סופי.
  useEffect(() => {
    const itemsWithType = items.filter(item => item.type);
    if (itemsWithType.length === 0) {
      setPriceRange(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const floorDifference = Math.abs((formData.toFloor || 0) - (formData.fromFloor || 0));
        const hasElevator = formData.fromElevator > 0 && formData.toElevator > 0;

        const response = await fetch(`${API_URL}/api/pricing/estimate-preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rooms: formData.fromRooms || undefined,
            furnitureItems: itemsWithType.map(item => ({
              type: item.type,
              quantity: item.quantity,
              needsDoorRemoval: item.doorRemoval
            })),
            floorDifference,
            hasElevator,
            originHasCrane: formData.fromLift,
            destinationHasCrane: formData.toLift,
            hasAddresses: !!(formData.fromAddress && formData.toAddress),
            moveDateKnown: !!formData.moveDate,
          })
        });
        const data = await response.json();
        if (data?.success) {
          setPriceRange(data.data);
        }
      } catch (error) {
        console.error('Failed to preview estimate:', error);
      }
    }, 400); // דיבאונס קל כדי לא להפציץ את השרת בכל הקשת מקלדת

    return () => clearTimeout(timeoutId);
  }, [items, formData.fromFloor, formData.toFloor, formData.fromElevator, formData.toElevator, formData.fromLift, formData.toLift, formData.fromRooms, formData.fromAddress, formData.toAddress, formData.moveDate, API_URL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNumberInputChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!formData.fullName || !formData.phone || !/^05\d{8}$/.test(formData.phone)) {
        alert('אנא מלא את השדות הנדרשים כראוי (שם מלא ומספר טלפון תקין).');
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.moveType || !formData.moveDate) {
        alert('אנא בחר סוג הובלה ותאריך מעבר.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.fromAddress || !formData.fromRooms || isNaN(formData.fromFloor) || isNaN(formData.fromElevator) ||
          !formData.toAddress || !formData.toRooms || isNaN(formData.toFloor) || isNaN(formData.toElevator)) {
        alert('אנא מלא את כל שדות כתובות המעבר, קומות, מספר חדרים ומספר מעליות באופן תקין.');
        return;
      }
    } else if (currentStep === 3) {
      if (items.length === 0) {
        alert('אנא הוסף לפחות פריט אחד להובלה.');
        return;
      }
      const missingOtherDescription = items.some(item => item.type === 'other' && !item.note.trim());
      if (missingOtherDescription) {
        alert('אנא תאר/י בשדה ההערות מהו הפריט שנבחר כ"אחר".');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: prev.length + 1, type: '', quantity: 1, fragile: false, disassemble: false, assemble: false, doorRemoval: false, note: '', img: null }]);
  };

  const handleItemChange = (id: number, field: keyof ItemForm, value: ItemForm[keyof ItemForm]) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      customerData: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      },
      moveData: {
        apartment_type: formData.moveType,
        preferred_move_date: formData.moveDate,
        current_address: formData.fromAddress,
        destination_address: formData.toAddress,
        additional_notes: formData.notes,
        origin_floor: formData.fromFloor,
        destination_floor: formData.toFloor,
        origin_has_elevator: formData.fromElevator > 0, // Convert number to boolean
        destination_has_elevator: formData.toElevator > 0, // Convert number to boolean
        origin_has_crane: formData.fromLift,
        destination_has_crane: formData.toLift,
        origin_rooms: formData.fromRooms || undefined,
      },
      furnitureItems: items.map(item => ({
        name: item.type,
        quantity: item.quantity,
        isFragile: item.fragile,
        needsDisassemble: item.disassemble,
        needsReassemble: item.assemble,
        needsDoorRemoval: item.doorRemoval,
        comments: item.note,
        // The 'description' field is optional on the backend and not available directly from the frontend ItemForm.
        // The 'id' and 'img' fields are not part of the backend schema and are omitted.
      })),
    };

    try {
      const response = await fetch(`${API_URL}/api/move-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.error('Error submitting form:', errorBody);
        alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
        return;
      }
      const data = await response.json();
      const trackingToken = data?.data?.trackingToken;
      navigate('/thank-you', { state: { trackingToken } });
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 px-2 sm:px-4" dir="rtl">
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-center text-blue-600 mb-1">
            בקשת הערכת מחיר להובלה
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            מלא/י את הפרטים ונחזור אליך עם הצעת מחיר משתלמת!
          </p>

          <StepIndicator current={currentStep} labels={STEP_NAMES} />

          <form id="move-estimate-form" aria-label="טופס הערכת מחיר להובלה" onSubmit={handleSubmit} dir="rtl" ref={formRef}>
            {currentStep === 0 && (
              <div>
                <div className="mb-4">
                  <label htmlFor="fullName" className="mb-1 block text-sm text-gray-700">שם מלא *</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="mb-1 block text-sm text-gray-700">מספר טלפון *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="^05\d{8}$"
                    aria-required="true"
                    aria-describedby="phone-hint"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <p id="phone-hint" className="block mt-1 text-xs text-gray-500">
                    לדוגמה: 0501234567
                  </p>
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="mb-1 block text-sm text-gray-700">כתובת אימייל</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={nextStep}>המשך</Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <div className="mb-4">
                  <label htmlFor="moveType" className="mb-1 block text-sm text-gray-700">סוג הובלה</label>
                  <select
                    id="moveType"
                    name="moveType"
                    value={formData.moveType}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option disabled value="">בחר</option>
                    <option value="פינוי מחסן">פינוי מחסן</option>
                    <option value="שירותי אריזה">שירותי אריזה</option>
                    <option value="הובלת דירה">הובלת דירה</option>
                    <option value="הובלת כלי ממונע">הובלת כלי ממונע</option>
                    <option value="עגלות להשכרה">עגלות להשכרה</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="moveDate" className="mb-1 block text-sm text-gray-700">תאריך מעבר מועדף</label>
                  <input
                    type="date"
                    id="moveDate"
                    name="moveDate"
                    value={formData.moveDate}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep}>חזור</Button>
                  <Button type="button" onClick={nextStep}>המשך</Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <Card className="mb-6 rounded-lg shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">כתובת נוכחית</h3>
                    <div className="mb-4 space-y-1">
                      <label htmlFor="fromAddress" className="block text-sm text-gray-700">כתובת מלאה</label>
                      <Input
                        id="fromAddress"
                        name="fromAddress"
                        value={formData.fromAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="רחוב ירושלים 8/2"
                      />
                    </div>
                    <NumberInputWithControls
                      label="מספר חדרים"
                      value={formData.fromRooms}
                      onChange={(value) => handleNumberInputChange('fromRooms', value)}
                      min={0}
                    />
                    <NumberInputWithControls
                      label="קומה"
                      value={formData.fromFloor}
                      onChange={(value) => handleNumberInputChange('fromFloor', value)}
                      min={0}
                    />
                    <NumberInputWithControls
                      label="מספר מעליות"
                      value={formData.fromElevator}
                      onChange={(value) => handleNumberInputChange('fromElevator', value)}
                      min={0}
                    />
                    {(formData.fromElevator > 0 || formData.toElevator > 0) && (
                      <NumberInputWithControls
                        label="קוטר מעלית"
                        value={formData.elevatorDiameter}
                        onChange={(value) => handleNumberInputChange('elevatorDiameter', value)}
                        min={0}
                        unit="סמ"
                      />
                    )}
                    <label htmlFor="fromLift" className="flex items-center mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="fromLift"
                        name="fromLift"
                        checked={formData.fromLift}
                        onChange={handleInputChange}
                        style={{ marginLeft: '8px' }}
                      />
                      <span className="text-sm">נדרש מנוף</span>
                    </label>
                  </CardContent>
                </Card>

                <Card className="mb-6 rounded-lg shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">כתובת יעד</h3>
                    <div className="mb-4 space-y-1">
                      <label htmlFor="toAddress" className="block text-sm text-gray-700">כתובת מלאה</label>
                      <Input
                        id="toAddress"
                        name="toAddress"
                        value={formData.toAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="רחוב ירושלים 8/2"
                      />
                    </div>
                    <NumberInputWithControls
                      label="מספר חדרים"
                      value={formData.toRooms}
                      onChange={(value) => handleNumberInputChange('toRooms', value)}
                      min={0}
                    />
                    <NumberInputWithControls
                      label="קומה"
                      value={formData.toFloor}
                      onChange={(value) => handleNumberInputChange('toFloor', value)}
                      min={0}
                    />
                    <NumberInputWithControls
                      label="מספר מעליות"
                      value={formData.toElevator}
                      onChange={(value) => handleNumberInputChange('toElevator', value)}
                      min={0}
                    />
                    <label htmlFor="toLift" className="flex items-center mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        id="toLift"
                        name="toLift"
                        checked={formData.toLift}
                        onChange={handleInputChange}
                        style={{ marginLeft: '8px' }}
                      />
                      <span className="text-sm">נדרש מנוף</span>
                    </label>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep}>חזור</Button>
                  <Button type="button" onClick={nextStep}>המשך</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">רשימת פריטים להובלה</h3>
                <div className="mb-4">
                  {items.map((item, itemIndex) => (
                    <Card key={item.id} className="mb-4 p-4 rounded-lg shadow-sm">
                      <h4 className="text-sm font-semibold mb-2">פריט {itemIndex + 1}</h4>
                      <div className="mb-2">
                        <label htmlFor={`itemType-${item.id}`} className="mb-1 block text-sm text-gray-700">סוג פריט</label>
                        <select
                          id={`itemType-${item.id}`}
                          name={`itemType-${item.id}`}
                          value={item.type}
                          onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option disabled value="">בחר</option>
                          {groupedFurnitureOptions.map(([category, options]) => (
                            <optgroup key={category} label={category}>
                              {options.map((option) => (
                                <option key={option.type} value={option.type}>
                                  {option.description} — ₪{option.basePrice}{option.isFragile ? ' (שביר)' : ''}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {item.type && getFurnitureOption(item.type) && (
                          <p className="block mt-1 text-xs text-gray-500">
                            מחיר בסיס: ₪{getFurnitureOption(item.type)!.basePrice} לפריט
                            {getFurnitureOption(item.type)!.isFragile && ' · פריט שביר - מטופל בזהירות מיוחדת'}
                            {getFurnitureOption(item.type)!.needsDisassemble &&
                              ` · פירוק + הרכבה: ₪${getFurnitureOption(item.type)!.disassemblePrice + getFurnitureOption(item.type)!.reassemblePrice}`}
                          </p>
                        )}
                      </div>
                      <div className="mb-2">
                        <label htmlFor={`itemQty-${item.id}`} className="mb-1 block text-sm text-gray-700">כמות</label>
                        <input
                          type="number"
                          min="1"
                          id={`itemQty-${item.id}`}
                          name={`itemQty-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <label htmlFor={`itemFragile-${item.id}`} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`itemFragile-${item.id}`}
                          name={`itemFragile-${item.id}`}
                          checked={item.fragile}
                          onChange={(e) => handleItemChange(item.id, 'fragile', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <span className="text-sm">שביר</span>
                      </label>
                      <label htmlFor={`itemDisassemble-${item.id}`} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`itemDisassemble-${item.id}`}
                          name={`itemDisassemble-${item.id}`}
                          checked={item.disassemble}
                          onChange={(e) => handleItemChange(item.id, 'disassemble', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <span className="text-sm">נדרש פירוק</span>
                      </label>
                      <label htmlFor={`itemAssemble-${item.id}`} className="flex items-center mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`itemAssemble-${item.id}`}
                          name={`itemAssemble-${item.id}`}
                          checked={item.assemble}
                          onChange={(e) => handleItemChange(item.id, 'assemble', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <span className="text-sm">נדרש הרכבה</span>
                      </label>
                      {getFurnitureOption(item.type)?.needsDisassemble && (
                        <label htmlFor={`itemDoorRemoval-${item.id}`} className="flex items-center mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            id={`itemDoorRemoval-${item.id}`}
                            name={`itemDoorRemoval-${item.id}`}
                            checked={item.doorRemoval}
                            onChange={(e) => handleItemChange(item.id, 'doorRemoval', e.target.checked)}
                            style={{ marginLeft: '8px' }}
                          />
                          <span className="text-sm">
                            הסרת דלתות בלבד (₪{getFurnitureOption(item.type)!.doorRemovalPrice}) - חלופה זולה יותר לפירוק מלא, למשל למעבר בפתח צר
                          </span>
                        </label>
                      )}
                      <div className="mb-2">
                        <label htmlFor={`itemNote-${item.id}`} className="mb-1 block text-sm text-gray-700">
                          {item.type === 'other' ? 'מהו הפריט? (חובה) *' : 'הערות'}
                        </label>
                        <input
                          type="text"
                          id={`itemNote-${item.id}`}
                          name={`itemNote-${item.id}`}
                          value={item.note}
                          onChange={(e) => handleItemChange(item.id, 'note', e.target.value)}
                          placeholder={item.type === 'other' ? 'לדוגמה: פסנתר, כספת ישנה, ציוד ספורט מיוחד...' : ''}
                          required={item.type === 'other'}
                          aria-required={item.type === 'other'}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: item.type === 'other' ? '1px solid #f59e0b' : '1px solid #ccc' }}
                        />
                        {item.type === 'other' && (
                          <p className="block mt-1 text-xs" style={{ color: '#b45309' }}>
                            המחיר שמוצג (₪{getFurnitureOption('other')?.basePrice ?? 50}) הוא הערכה כללית בלבד לפריט לא-סטנדרטי - המחיר הסופי יאושר טלפונית לפי הפרטים שתכתוב/י כאן.
                          </p>
                        )}
                      </div>
                      <div className="mb-4">
                        <label htmlFor={`itemImg-${item.id}`} className="mb-1 block text-sm text-gray-700">תמונה</label>
                        <input
                          type="file"
                          id={`itemImg-${item.id}`}
                          name={`itemImg-${item.id}`}
                          accept="image/*"
                          onChange={(e) => handleItemChange(item.id, 'img', e.target.files ? e.target.files[0] : null)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                        aria-label={`מחק פריט ${itemIndex + 1}`}
                      >
                        מחק פריט
                      </Button>
                    </Card>
                  ))}
                </div>
                <Button type="button" onClick={addItem} className="mb-6">הוסף פריט</Button>

                {priceRange && (
                  <div className="mb-6">
                    <PriceEstimateBreakdown estimate={priceRange} compact />
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep}>חזור</Button>
                  <Button type="button" onClick={nextStep}>המשך</Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">סיכום</h3>

                {priceRange && (
                  <div className="mb-6">
                    <PriceEstimateBreakdown estimate={priceRange} />
                  </div>
                )}

                <div className="mb-6">
                  <label htmlFor="notes" className="mb-1 block text-sm text-gray-700">הערות נוספות</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  ></textarea>
                </div>
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep}>חזור</Button>
                  <Button type="submit">שליחה</Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovingEstimateForm;
