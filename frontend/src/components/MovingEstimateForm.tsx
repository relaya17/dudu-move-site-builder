import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import { NumberInputWithControls } from './ui/NumberInputWithControls'; // New import

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

interface PriceRangeEstimate {
  minEstimate: number;
  maxEstimate: number;
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
        const response = await axios.get(`${API_URL}/api/pricing/furniture-items`);
        // Ensure response.data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setFurnitureOptions(data);
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

        const response = await axios.post(`${API_URL}/api/pricing/estimate-preview`, {
          furnitureItems: itemsWithType.map(item => ({
            type: item.type,
            quantity: item.quantity,
            needsDoorRemoval: item.doorRemoval
          })),
          floorDifference,
          hasElevator,
          originHasCrane: formData.fromLift,
          destinationHasCrane: formData.toLift
        });
        if (response.data?.success) {
          setPriceRange(response.data.data);
        }
      } catch (error) {
        console.error('Failed to preview estimate:', error);
      }
    }, 400); // דיבאונס קל כדי לא להפציץ את השרת בכל הקשת מקלדת

    return () => clearTimeout(timeoutId);
  }, [items, formData.fromFloor, formData.toFloor, formData.fromElevator, formData.toElevator, formData.fromLift, formData.toLift, API_URL]);

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
        alert('אנא מלא את כל שדות כתובות המעבר, קומות, מספר חדרים ומספר מעליות באופן תקין.'); // Updated alert message
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
      const response = await axios.post(`${API_URL}/api/move-requests`, formattedData);
      const trackingToken = response.data?.data?.trackingToken;
      navigate('/thank-you', { state: { trackingToken } });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown }; message?: string };
      console.error('Error submitting form:', axiosError.response ? axiosError.response.data : axiosError.message);
      alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
    }
  };

  const stepNames = ['פרטים', 'דירה', 'כתובות', 'פריטים', 'סיכום'];

  return (
    <Container maxWidth="sm" sx={{ mt: 4, direction: 'rtl', px: { xs: 1, sm: 2 } }}>
      <Card elevation={8} sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h5" component="h2" align="center" sx={{ mb: 1, color: 'primary.main', fontWeight: 'bold' }}>
            בקשת הערכת מחיר להובלה
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            מלא/י את הפרטים ונחזור אליך עם הצעת מחיר משתלמת!
          </Typography>

          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
            {stepNames.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      mt: '4px !important'
                    }
                  }}
                >{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form id="move-estimate-form" aria-label="טופס הערכת מחיר להובלה" onSubmit={handleSubmit} dir="rtl" ref={formRef}> {/* Attach ref to the form */}
            {currentStep === 0 && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="fullName" variant="body1" sx={{ mb: 0.5, display: 'block' }}>שם מלא *</Typography>
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
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="phone" variant="body1" sx={{ mb: 0.5, display: 'block' }}>מספר טלפון *</Typography>
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
                  <Typography id="phone-hint" variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                    לדוגמה: 0501234567
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="email" variant="body1" sx={{ mb: 0.5, display: 'block' }}>כתובת אימייל</Typography>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button variant="contained" onClick={nextStep}>המשך</Button>
                </Box>
              </Box>
            )}

            {currentStep === 1 && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="moveType" variant="body1" sx={{ mb: 0.5, display: 'block' }}>סוג הובלה</Typography>
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
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="moveDate" variant="body1" sx={{ mb: 0.5, display: 'block' }}>תאריך מעבר מועדף</Typography>
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
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" onClick={nextStep}>המשך</Button>
                </Box>
              </Box>
            )}

            {currentStep === 2 && (
              <Box>
                <Card elevation={4} sx={{ mb: 4, borderRadius: '8px' }}> {/* Card for current address */}
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>כתובת נוכחית</Typography>
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        id="fromAddress"
                        name="fromAddress"
                        label="כתובת מלאה"
                        value={formData.fromAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="רחוב ירושלים 8/2"
                        variant="outlined"
                        fullWidth
                      />
                    </Box>
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
                    { (formData.fromElevator > 0 || formData.toElevator > 0) && (
                      <NumberInputWithControls
                        label="קוטר מעלית"
                        value={formData.elevatorDiameter}
                        onChange={(value) => handleNumberInputChange('elevatorDiameter', value)}
                        min={0}
                        unit="סמ" // Changed from "ס\"מ" to "סמ"
                      />
                    )}
                    <Box component="label" htmlFor="fromLift" sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        id="fromLift"
                        name="fromLift"
                        checked={formData.fromLift}
                        onChange={handleInputChange}
                        style={{ marginLeft: '8px' }}
                      />
                      <Typography variant="body2">נדרש מנוף</Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={4} sx={{ mb: 4, borderRadius: '8px' }}> {/* Card for destination address */}
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>כתובת יעד</Typography>
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        id="toAddress"
                        name="toAddress"
                        label="כתובת מלאה"
                        value={formData.toAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="רחוב ירושלים 8/2"
                        variant="outlined"
                        fullWidth
                      />
                    </Box>
                    <NumberInputWithControls
                      label="מספר חדרים"
                      value={formData.toRooms} // No parseInt needed anymore
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
                    <Box component="label" htmlFor="toLift" sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        id="toLift"
                        name="toLift"
                        checked={formData.toLift}
                        onChange={handleInputChange}
                        style={{ marginLeft: '8px' }}
                      />
                      <Typography variant="body2">נדרש מנוף</Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" onClick={nextStep}>המשך</Button>
                </Box>
              </Box>
            )}

            {currentStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>רשימת פריטים להובלה</Typography> {/* Added title */}
                <Box sx={{ mb: 2 }}>
                  {items.map((item, itemIndex) => (
                    <Card key={item.id} sx={{ mb: 2, p: 2, borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <Typography variant="subtitle2" component="h4" sx={{ mb: 1 }}>פריט {itemIndex + 1}</Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography component="label" htmlFor={`itemType-${item.id}`} variant="body2" sx={{ mb: 0.5, display: 'block' }}>סוג פריט</Typography>
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
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                            מחיר בסיס: ₪{getFurnitureOption(item.type)!.basePrice} לפריט
                            {getFurnitureOption(item.type)!.isFragile && ' · פריט שביר - מטופל בזהירות מיוחדת'}
                            {getFurnitureOption(item.type)!.needsDisassemble &&
                              ` · פירוק + הרכבה: ₪${getFurnitureOption(item.type)!.disassemblePrice + getFurnitureOption(item.type)!.reassemblePrice}`}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography component="label" htmlFor={`itemQty-${item.id}`} variant="body2" sx={{ mb: 0.5, display: 'block' }}>כמות</Typography>
                        <input
                          type="number"
                          min="1"
                          id={`itemQty-${item.id}`}
                          name={`itemQty-${item.id}`}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </Box>
                      <Box component="label" htmlFor={`itemFragile-${item.id}`} sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          id={`itemFragile-${item.id}`}
                          name={`itemFragile-${item.id}`}
                          checked={item.fragile}
                          onChange={(e) => handleItemChange(item.id, 'fragile', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <Typography variant="body2">שביר</Typography>
                      </Box>
                      <Box component="label" htmlFor={`itemDisassemble-${item.id}`} sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          id={`itemDisassemble-${item.id}`}
                          name={`itemDisassemble-${item.id}`}
                          checked={item.disassemble}
                          onChange={(e) => handleItemChange(item.id, 'disassemble', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <Typography variant="body2">נדרש פירוק</Typography>
                      </Box>
                      <Box component="label" htmlFor={`itemAssemble-${item.id}`} sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          id={`itemAssemble-${item.id}`}
                          name={`itemAssemble-${item.id}`}
                          checked={item.assemble}
                          onChange={(e) => handleItemChange(item.id, 'assemble', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <Typography variant="body2">נדרש הרכבה</Typography>
                      </Box>
                      {getFurnitureOption(item.type)?.needsDisassemble && (
                        <Box component="label" htmlFor={`itemDoorRemoval-${item.id}`} sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            id={`itemDoorRemoval-${item.id}`}
                            name={`itemDoorRemoval-${item.id}`}
                            checked={item.doorRemoval}
                            onChange={(e) => handleItemChange(item.id, 'doorRemoval', e.target.checked)}
                            style={{ marginLeft: '8px' }}
                          />
                          <Typography variant="body2">
                            הסרת דלתות בלבד (₪{getFurnitureOption(item.type)!.doorRemovalPrice}) - חלופה זולה יותר לפירוק מלא, למשל למעבר בפתח צר
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 1 }}>
                        <Typography component="label" htmlFor={`itemNote-${item.id}`} variant="body2" sx={{ mb: 0.5, display: 'block' }}>
                          {item.type === 'other' ? 'מהו הפריט? (חובה) *' : 'הערות'}
                        </Typography>
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
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#b45309' }}>
                            המחיר שמוצג (₪{getFurnitureOption('other')?.basePrice ?? 50}) הוא הערכה כללית בלבד לפריט לא-סטנדרטי - המחיר הסופי יאושר טלפונית לפי הפרטים שתכתוב/י כאן.
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography component="label" htmlFor={`itemImg-${item.id}`} variant="body2" sx={{ mb: 0.5, display: 'block' }}>תמונה</Typography>
                        <input
                          type="file"
                          id={`itemImg-${item.id}`}
                          name={`itemImg-${item.id}`}
                          accept="image/*"
                          onChange={(e) => handleItemChange(item.id, 'img', e.target.files ? e.target.files[0] : null)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </Box>
                      <Button variant="outlined" color="error" onClick={() => removeItem(item.id)} aria-label={`מחק פריט ${itemIndex + 1}`}>מחק פריט</Button>
                        </Card>
                      ))}
                </Box>
                <Button variant="contained" onClick={addItem} sx={{ mb: 3 }}>הוסף פריט</Button>

                {priceRange && (
                  <Box sx={{ mb: 3, p: 2, borderRadius: '8px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                      הערכת מחיר משוערת: ₪{priceRange.minEstimate} - ₪{priceRange.maxEstimate}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1e40af' }}>
                      המחיר הסופי המדויק ייקבע לאחר אישור טלפוני
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" onClick={nextStep}>המשך</Button>
                </Box>
              </Box>
            )}

            {currentStep === 4 && (
              <Box>
                <Typography variant="h6" component="h3" sx={{ mb: 2 }}>סיכום</Typography>

                {priceRange && (
                  <Box sx={{ mb: 3, p: 2, borderRadius: '8px', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                      הערכת מחיר משוערת: ₪{priceRange.minEstimate} - ₪{priceRange.maxEstimate}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1e40af' }}>
                      ההערכה מבוססת על הפריטים, הקומות והמעליות שציינת. המחיר הסופי המדויק ייקבע לאחר אישור טלפוני.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography component="label" htmlFor="notes" variant="body1" sx={{ mb: 0.5, display: 'block' }}>הערות נוספות</Typography>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  ></textarea>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" type="submit">שליחה</Button>
                </Box>
              </Box>
            )}
                </form>
              </CardContent>
        </Card>
    </Container>
  );
};

export default MovingEstimateForm;