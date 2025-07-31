import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  apartmentType: string;
  rooms: string;
  moveDate: string;
  fromAddress: string;
  fromFloor: number;
  fromElevator: boolean;
  fromLift: boolean;
  toAddress: string;
  toFloor: number;
  toElevator: boolean;
  toLift: boolean;
  notes: string;
}

interface ItemForm {
  id: number;
  type: string;
  quantity: number;
  description: string;
  fragile: boolean;
  disassemble: boolean;
  assemble: boolean;
  note: string;
  img: File | null;
}

export const MovingEstimateForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    apartmentType: '',
    rooms: '',
    moveDate: '',
    fromAddress: '',
    fromFloor: 0,
    fromElevator: false,
    fromLift: false,
    toAddress: '',
    toFloor: 0,
    toElevator: false,
    toLift: false,
    notes: ''
  });
  const [success, setSuccess] = useState(false);
  const successMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (successMessageRef.current) {
      successMessageRef.current.style.display = success ? 'block' : 'none';
    }
  }, [success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!formData.fullName || !formData.phone || !/^05\d{8}$/.test(formData.phone)) {
        alert('אנא מלא את השדות הנדרשים כראוי (שם מלא ומספר טלפון תקין).');
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.apartmentType || !formData.rooms || !formData.moveDate) {
        alert('אנא בחר סוג דירה, מספר חדרים ותאריך מעבר.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.fromAddress || !formData.toAddress) {
        alert('אנא מלא כתובת נוכחית וכתובת יעד.');
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
    setItems(prev => [...prev, { id: prev.length + 1, type: '', quantity: 1, description: '', fragile: false, disassemble: false, assemble: false, note: '', img: null }]);
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    console.log("Form submitted!", formData, items);
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

          <form id="move-estimate-form" aria-label="טופס הערכת מחיר להובלה" onSubmit={handleSubmit} dir="rtl">
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
                  <Typography variant="body1" sx={{ mb: 0.5 }}>סוג דירה</Typography>
                  <select
                    id="apartmentType"
                    name="apartmentType"
                    value={formData.apartmentType}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option disabled value="">בחר</option>
                    <option value="דירה">דירה</option>
                    <option value="בית פרטי">בית פרטי</option>
                    <option value="דירת גן">דירת גן</option>
                    <option value="דירת גג">דירת גג</option>
                    <option value="אחר">אחר</option>
                  </select>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>מספר חדרים</Typography>
                  <select
                    id="rooms"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option disabled value="">בחר</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3</option>
                    <option value="3.5">3.5</option>
                    <option value="4">4</option>
                    <option value="4.5">4.5</option>
                    <option value="5+">5+</option>
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
                <Typography variant="h6" sx={{ mb: 2 }}>כתובת נוכחית</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>כתובת מלאה</Typography>
                  <input
                    type="text"
                    name="fromAddress"
                    value={formData.fromAddress}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>קומה</Typography>
                  <input
                    type="number"
                    name="fromFloor"
                    min="0"
                    value={formData.fromFloor}
                    onChange={handleInputChange}
                    placeholder=" "
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <input
                    type="checkbox"
                    name="fromElevator"
                    checked={formData.fromElevator}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                  <Typography variant="body2">יש מעלית</Typography>
                </Box>
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

                <Typography variant="h6" sx={{ mb: 2 }}>כתובת יעד</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>כתובת מלאה</Typography>
                  <input
                    type="text"
                    name="toAddress"
                    value={formData.toAddress}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>קומה</Typography>
                  <input
                    type="number"
                    name="toFloor"
                    min="0"
                    value={formData.toFloor}
                    onChange={handleInputChange}
                    placeholder=" "
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <input
                    type="checkbox"
                    name="toElevator"
                    checked={formData.toElevator}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                  <Typography variant="body2">יש מעלית</Typography>
                </Box>
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button variant="outlined" onClick={prevStep}>חזור</Button>
                  <Button variant="contained" onClick={nextStep}>המשך</Button>
                </Box>
              </Box>
            )}

            {currentStep === 3 && (
              <Box>
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
                          <option value="מיטה זוגית">מיטה זוגית</option>
                          <option value="ספה">ספה</option>
                          <option value="מיטת יחיד">מיטת יחיד</option>
                          <option value="שולחן">שולחן</option>
                          <option value="כיסא">כיסא</option>
                          <option value="ארון בגדים">ארון בגדים</option>
                          <option value="מקרר">מקרר</option>
                          <option value="טלוויזיה">טלוויזיה</option>
                          <option value="מכונת כביסה">מכונת כביסה</option>
                          <option value="אחר">אחר</option>
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
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>תיאור</Typography>
                        <input
                          type="text"
                          id={`itemDesc-${item.id}`}
                          name={`itemDesc-${item.id}`}
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
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
                  <strong>המחיר המשוער:</strong> <span id="estimated-price">₪0</span>
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