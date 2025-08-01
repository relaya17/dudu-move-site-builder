import React, { useState, useEffect, useRef } from 'react';
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

interface ItemForm {
  id: number;
  type: string;
  quantity: number;
  fragile: boolean;
  disassemble: boolean;
  assemble: boolean;
  note: string;
  img: File | null;
}

export const MovingEstimateForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [furnitureOptions, setFurnitureOptions] = useState<any[]>([]); // New state for dynamic furniture options
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
  const [success, setSuccess] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null); // New state for estimated price
  const successMessageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null); // New ref for the form

  useEffect(() => {
    if (successMessageRef.current) {
      successMessageRef.current.style.display = success ? 'block' : 'none';
    }
  }, [success]);

  useEffect(() => {
    // Scroll to the top of the form when the step changes
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]); // Dependency array includes currentStep

  useEffect(() => {
    const fetchFurnitureOptions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/api/pricing/furniture-items`);
        // Ensure response.data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setFurnitureOptions(data);
      } catch (error) {
        console.error('Failed to fetch furniture options:', error);
        setFurnitureOptions([]); // Set empty array on error
      }
    };
    fetchFurnitureOptions();
  }, []); // Empty dependency array means this runs once on mount

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
    setItems(prev => [...prev, { id: prev.length + 1, type: '', quantity: 1, fragile: false, disassemble: false, assemble: false, note: '', img: null }]);
  };

  const handleItemChange = (id: number, field: string, value: any) => {
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
        comments: item.note,
        // The 'description' field is optional on the backend and not available directly from the frontend ItemForm.
        // The 'id' and 'img' fields are not part of the backend schema and are omitted.
      })),
    };

    try {
      // Send the data to the backend
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/api/move-requests`, formattedData);
      console.log('Server response:', response.data);
      setSuccess(true);
      setEstimatedPrice(response.data.data.priceEstimate); // Set estimated price from backend response
    } catch (error: any) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      setSuccess(false);
      alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב מאוחר יותר.');
    }
  };

  const stepNames = ['פרטים אישיים', 'סוג דירה ותאריך', 'כתובות המעבר', 'רשימת פריטים', 'סיכום'];

  return (
    <Container maxWidth="sm" sx={{ mt: 4, direction: 'rtl' }}>
      <Card elevation={8} sx={{ borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="h5" component="h1" align="center" sx={{ mb: 1, color: '#2196f3', fontWeight: 'bold' }}>
                      בקשת הערכת מחיר להובלה
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            מלא/י את הפרטים ונחזור אליך עם הצעת מחיר משתלמת!
          </Typography>

          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 4 }}>
            {stepNames.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form id="move-estimate-form" aria-label="טופס הערכת מחיר להובלה" onSubmit={handleSubmit} dir="rtl" ref={formRef}> {/* Attach ref to the form */}
            {currentStep === 0 && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>שם מלא *</Typography>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    aria-required="true"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>מספר טלפון *</Typography>
                  <input
                          id="phone"
                    type="tel"
                    name="phone"
                          value={formData.phone}
                    onChange={handleInputChange}
                    required
                    pattern="^05\d{8}$"
                    aria-required="true"
                    placeholder=" "
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>כתובת אימייל</Typography>
                  <input
                          id="email"
                          type="email"
                    name="email"
                          value={formData.email}
                    onChange={handleInputChange}
                    placeholder=" "
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
                  <Typography variant="body1" sx={{ mb: 0.5 }}>סוג הובלה</Typography> {/* Changed from סוג דירה */}
                  <select
                    id="moveType" // Changed from apartmentType
                    name="moveType" // Changed from apartmentType
                    value={formData.moveType} // Changed from formData.apartmentType
                    onChange={handleInputChange}
                    required
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
                  <Typography variant="body1" sx={{ mb: 0.5 }}>תאריך מעבר מועדף</Typography>
                  <input
                            type="date"
                    id="moveDate"
                    name="moveDate"
                    value={formData.moveDate}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
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
                    <Typography variant="h6" sx={{ mb: 2 }}>כתובת נוכחית</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>כתובת מלאה</Typography>
                      <TextField
                        id="fromAddress"
                        name="fromAddress"
                        value={formData.fromAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="רחוב ירושלים 8/2" // Updated placeholder to example address
                        variant="outlined"
                        fullWidth // Re-added fullWidth
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <input
                        type="checkbox"
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
                    <Typography variant="h6" sx={{ mb: 2 }}>כתובת יעד</Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>כתובת מלאה</Typography>
                      <TextField
                        id="toAddress"
                        name="toAddress"
                        value={formData.toAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="רחוב ירושלים 8/2" // Updated placeholder to example address
                        variant="outlined"
                        fullWidth // Re-added fullWidth
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
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <input
                        type="checkbox"
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
                  {items.map((item) => (
                    <Card key={item.id} sx={{ mb: 2, p: 2, borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>סוג פריט</Typography>
                        <select
                          id={`itemType-${item.id}`}
                          name={`itemType-${item.id}`}
                                value={item.type}
                          onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                          <option disabled value="">בחר</option>
                          {Array.isArray(furnitureOptions) && furnitureOptions.map((option) => (
                            <option key={option.type} value={option.type}>{option.description}</option>
                          ))}
                        </select>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>כמות</Typography>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <input
                          type="checkbox"
                          name={`itemFragile-${item.id}`}
                          checked={item.fragile}
                          onChange={(e) => handleItemChange(item.id, 'fragile', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <Typography variant="body2">שביר</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <input
                          type="checkbox"
                          name={`itemDisassemble-${item.id}`}
                          checked={item.disassemble}
                          onChange={(e) => handleItemChange(item.id, 'disassemble', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <Typography variant="body2">נדרש פירוק</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <input
                          type="checkbox"
                          name={`itemAssemble-${item.id}`}
                          checked={item.assemble}
                          onChange={(e) => handleItemChange(item.id, 'assemble', e.target.checked)}
                          style={{ marginLeft: '8px' }}
                        />
                        <Typography variant="body2">נדרש הרכבה</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>הערות</Typography>
                        <input
                          type="text"
                          id={`itemNote-${item.id}`}
                          name={`itemNote-${item.id}`}
                          value={item.note}
                          onChange={(e) => handleItemChange(item.id, 'note', e.target.value)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>תמונה</Typography>
                        <input
                                    type="file"
                          id={`itemImg-${item.id}`}
                          name={`itemImg-${item.id}`}
                                    accept="image/*"
                          onChange={(e) => handleItemChange(item.id, 'img', e.target.files ? e.target.files[0] : null)}
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </Box>
                      <Button variant="outlined" color="error" onClick={() => removeItem(item.id)}>מחק פריט</Button>
                        </Card>
                      ))}
                </Box>
                <Button variant="contained" onClick={addItem} sx={{ mb: 3 }}>הוסף פריט</Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" onClick={nextStep}>המשך</Button>
                </Box>
              </Box>
            )}

            {currentStep === 4 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>סיכום</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>המחיר המשוער:</strong> <span id="estimated-price">{estimatedPrice !== null ? `₪${estimatedPrice}` : 'מחשב...'}</span>
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>הערות נוספות</Typography>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder=" "
                    rows={4}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  ></textarea>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" type="submit">שליחה</Button>
                </Box>
                  {success && (
                  <Typography ref={successMessageRef} color="success.main" sx={{ mt: 2 }}>
                    הטופס נשלח בהצלחה!
                  </Typography>
                )}
              </Box>
            )}
                </form>
              </CardContent>
        </Card>
    </Container>
  );
};

export default MovingEstimateForm;