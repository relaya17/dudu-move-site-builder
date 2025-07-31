import React, { useState, useEffect, useRef } from 'react';
// Consider moving these styles to a separate CSS file (e.g., App.css or a new MaterialForm.css)
// and importing it. For now, they are embedded for direct translation.
const formStyles = `
  body {
    font-family: 'Heebo', Arial, sans-serif;
    background: #f5f5f5;
    margin: 0; padding: 0;
    color: #212121;
  }
  .material-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(58, 58, 90, 0.07);
    margin: 40px auto;
    max-width: 460px;
    padding: 2em;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .material-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2196f3;
    text-align: center; /* Added to center the title */
  }
  .material-description {
    text-align: center;
    margin-top: 10px; /* Adjust as needed */
    color: #757575; /* A softer color than the title */
    font-size: 0.9em;
  }
  .material-field {
    position: relative;
    margin: 16px 0;
  }
  .material-field input,
  .material-field select,
  .material-field textarea {
    font-size: 1rem;
    padding: 20px 12px 8px 12px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: none;
    outline: none;
    transition: border 0.2s;
    box-sizing: border-box;
  }
  .material-field input:focus,
  .material-field select:focus,
  .material-field textarea:focus {
    border: 2px solid #2196f3;
  }
  .material-field label {
    position: absolute;
    top: 18px; right: 16px;
    font-size: 1rem;
    color: #888;
    background: #fff;
    padding: 0 4px;
    pointer-events: none;
    transition: 0.2s;
  }
  .material-field input:focus ~ label,
  .material-field input:not(:placeholder-shown) ~ label,
  .material-field select:focus ~ label,
  .material-field select:not([value=""]) ~ label,
  .material-field textarea:focus ~ label,
  .material-field textarea:not(:placeholder-shown) ~ label {
    top: 2px;
    font-size: 0.91em;
    color: #2196f3;
  }
  .material-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 28px;
    background: #2196f3;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(33, 150, 243, 0.10);
    margin-top: 8px;
    position: relative;
    overflow: hidden;
    transition: background 0.1s;
  }
  .material-btn:active {
    background: #1976d2;
  }
  .material-btn:focus { outline: 2px solid #1976d2; }
  .step-indicator { color: #757575; margin-bottom: 8px; font-size: 0.95em; }

  /* Additional styles from first HTML snippet */
  .step { display: none; }
  .step.active { display: block; }
  /* Overridden by .material-field label for floating effect - keeping it in case of elements outside .material-field */
  label { display: block; margin-top: 0.75em; } 
  /* Overridden by .material-field input - keeping it in case of elements outside .material-field */
  input, select, textarea { width: 100%; padding: 0.5em; margin-top: 0.25em; } 
  .step-indicator { margin-bottom: 1em; } /* Overridden in .material-card context */
  .buttons { margin-top: 1em; }
  /* Overridden by .material-btn - keeping it in case of elements outside .material-btn */
  button { padding: 0.5em 1.5em; margin-left: 0.5em; } 
  .error { color: red; }
  .item-card { background: #fff; margin-bottom: 1em; padding: 1em; border-radius: 6px; box-shadow: 0 1px 6px rgba(0,0,0,0.03);}

  /* Styles for Progress Bar / Stepper */
.progress-bar {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin: 1em 0;
  counter-reset: step-counter;
  direction: rtl; /* לעברית */
}

.progress-bar .step {
  position: relative;
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: #999;
  cursor: default;
  padding-bottom: 0.75em;
}

.progress-bar .step::before {
  counter-increment: step-counter;
  content: counter(step-counter);
  display: inline-block;
  margin-bottom: 0.25em;
  width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 50%;
  background: #ccc;
  color: white;
  font-weight: bold;
  user-select: none;
}

/* פס מחבר בין השלבים */
.progress-bar .step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px; /* להתאמת גובה */
  right: 50%; /* Changed from left: 50% for RTL */
  width: 100%;
  height: 4px;
  background: #ccc;
  z-index: -1;
  margin-left: 50%; /* Added to align with RTL */
  transform: translateX(50%); /* Adjusted for RTL centering */
}

/* הצמדת הפס בין השלבים (בלבד ממשמאל) */
.progress-bar .step:last-child::after {
  display: none;
}

/* שלב פעיל ונוכחי */
.progress-bar .step[aria-current="step"]::before,
.progress-bar .step.completed::before {
  background-color: #2196f3; /* כחול מטריאל */
}

.progress-bar .step[aria-current="step"],
.progress-bar .step.completed {
  color: #2196f3;
  font-weight: 700;
}

/* פס המחבר בין השלבים שהושלמו */
.progress-bar .step.completed:not(:last-child)::after {
  background-color: #2196f3;
}

/* רספונסיביות למובייל: גלילה אופקית */
@media (max-width: 600px) {
  .progress-bar {
    overflow-x: auto;
    padding-bottom: 0.5em;
  }
  .progress-bar .step {
    flex: 0 0 auto;
    min-width: 110px;
  }
}
`;

// Simplified FormData interface to match the new HTML structure.
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

// ItemForm interface for dynamically added items
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
  const [items, setItems] = useState<ItemForm[]>([]); // To store dynamic items based on new HTML structure
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
  const [success, setSuccess] = useState(false); // Used for success message

  // progressRef and successMessageRef are now managed directly in JSX or removed if not needed.
  // const progressRef = useRef<HTMLSpanElement>(null);
  const successMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The logic to update the progress bar text content is now handled directly in JSX.
    // if (progressRef.current) {
    //   progressRef.current.textContent = `שלב ${currentStep + 1} מתוך 5`;
    // }
  }, [currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const nextStep = () => {
    // Basic validation before moving to the next step
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

    if (currentStep < 4) { // 5 steps, 0-indexed means max 4
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
    if (successMessageRef.current) {
      successMessageRef.current.style.display = 'block';
    }
    // Here you would add data submission to the server, potentially using MovingEstimateService
    console.log("Form submitted!", formData, items);
    // You might want to integrate the existing MovingEstimateService.submitEstimateRequest here
    // but the `formData` and `inventory` types would need to be re-aligned.
    // For now, keeping it simple as per the provided HTML/JS example.
  };

  const stepNames = ['פרטים אישיים', 'סוג דירה ותאריך', 'כתובות המעבר', 'רשימת פריטים', 'סיכום'];

  return (
    <div className="material-card" dir="rtl">
      <style>{formStyles}</style>
      {/* TODO: This font link should ideally be in public/index.html or a global CSS file, not here. */}
      <link href="https://fonts.googleapis.com/css?family=Heebo:400,700&display=swap" rel="stylesheet" />

      <form id="move-estimate-form" aria-label="טופס הערכת מחיר להובלה" onSubmit={handleSubmit}>
        <div className="material-title">בקשת הערכת מחיר להובלה</div>
        <p className="material-description">מלא/י את הפרטים ונחזור אליך עם הצעת מחיר משתלמת!</p>
        {/* Progress Bar / Stepper */}
        <nav aria-label="שלבי טופס">
          <ol className="progress-bar">
            {stepNames.map((stepName, /* index */) => (
              <li
                key={stepName}
                className={`step ${stepNames.indexOf(stepName) < currentStep ? 'completed' : ''} ${stepNames.indexOf(stepName) === currentStep ? 'active' : ''}`}
                aria-current={stepNames.indexOf(stepName) === currentStep ? 'step' : undefined}
              >
                {stepName}
              </li>
            ))}
          </ol>
        </nav>
        {/* The original step-indicator div can be removed or repurposed if needed */}
        {/* <div className="step-indicator"><strong ref={progressRef}></strong></div> */}

        {/* שלב 1: פרטים אישיים */}
        <div className={`step ${currentStep === 0 ? 'active' : ''}`} id="step-1">
          <div className="material-field">
            <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder=" " aria-required="true" />
            <label htmlFor="fullName">שם מלא <span aria-label="חובה">*</span></label>
                      </div>
          <div className="material-field">
            <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required pattern="^05\d{8}$" aria-required="true" placeholder=" " />
            <label htmlFor="phone">מספר טלפון <span aria-label="חובה">*</span></label>
                      </div>
          <div className="material-field">
            <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder=" " />
            <label htmlFor="email">כתובת אימייל</label>
                    </div>
          <div className="buttons">
            <button className="material-btn" type="button" onClick={nextStep}>המשך</button>
                        </div>
                      </div>

        {/* שלב 2: פרטי דירה ותאריך מעבר */}
        <div className={`step ${currentStep === 1 ? 'active' : ''}`} id="step-2">
          <div className="material-field">
            <select id="apartmentType" name="apartmentType" value={formData.apartmentType} onChange={handleInputChange} required>
              <option disabled value="">בחר</option>
              <option value="דירה">דירה</option>
              <option value="בית פרטי">בית פרטי</option>
              <option value="דירת גן">דירת גן</option>
              <option value="דירת גג">דירת גג</option>
              <option value="אחר">אחר</option>
            </select>
            <label htmlFor="apartmentType">סוג דירה</label>
                        </div>
          <div className="material-field">
            <select id="rooms" name="rooms" value={formData.rooms} onChange={handleInputChange} required>
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
            <label htmlFor="rooms">מספר חדרים</label>
                        </div>
          <div className="material-field">
            <input type="date" id="moveDate" name="moveDate" value={formData.moveDate} onChange={handleInputChange} required placeholder=" "/>
            <label htmlFor="moveDate">תאריך מעבר מועדף</label>
                    </div>

          <div className="buttons">
            <button className="material-btn" type="button" onClick={prevStep}>חזור</button>
            <button className="material-btn" type="button" onClick={nextStep}>המשך</button>
                          </div>
                        </div>

        {/* שלב 3: כתובת נוכחית ויעד */}
        <div className={`step ${currentStep === 2 ? 'active' : ''}`} id="step-3">
          <h2>כתובת נוכחית</h2>
          <div className="material-field">
            <input type="text" name="fromAddress" value={formData.fromAddress} onChange={handleInputChange} required placeholder=" "/>
            <label htmlFor="fromAddress">כתובת מלאה</label>
                              </div>
          <div className="material-field">
            <input type="number" name="fromFloor" min="0" value={formData.fromFloor} onChange={handleInputChange} placeholder=" "/>
            <label htmlFor="fromFloor">קומה</label>
                            </div>
          <label>
            <input type="checkbox" name="fromElevator" checked={formData.fromElevator} onChange={handleInputChange} />
            יש מעלית
          </label>
          <label>
            <input type="checkbox" name="fromLift" checked={formData.fromLift} onChange={handleInputChange} />
            נדרש מנוף
          </label>

          <h2>כתובת יעד</h2>
          <div className="material-field">
            <input type="text" name="toAddress" value={formData.toAddress} onChange={handleInputChange} required placeholder=" "/>
            <label htmlFor="toAddress">כתובת מלאה</label>
                      </div>
          <div className="material-field">
            <input type="number" name="toFloor" min="0" value={formData.toFloor} onChange={handleInputChange} placeholder=" "/>
            <label htmlFor="toFloor">קומה</label>
                    </div>
          <label>
            <input type="checkbox" name="toElevator" checked={formData.toElevator} onChange={handleInputChange} />
            יש מעלית
          </label>
          <label>
            <input type="checkbox" name="toLift" checked={formData.toLift} onChange={handleInputChange} />
            נדרש מנוף
          </label>

          <div className="buttons">
            <button className="material-btn" type="button" onClick={prevStep}>חזור</button>
            <button className="material-btn" type="button" onClick={nextStep}>המשך</button>
                          </div>
                            </div>

        {/* שלב 4: פריטים להובלה */}
        <div className={`step ${currentStep === 3 ? 'active' : ''}`} id="step-4">
          <div id="items-container">
            {items.map((item) => (
              <div key={item.id} className="item-card">
                <label htmlFor={`itemType-${item.id}`}>סוג פריט
                  <select id={`itemType-${item.id}`} name={`itemType-${item.id}`} value={item.type} onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}>
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
                </label>
                <label htmlFor={`itemQty-${item.id}`}>כמות
                  <input type="number" min="1" id={`itemQty-${item.id}`} name={`itemQty-${item.id}`} value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                </label>
                <label htmlFor={`itemDesc-${item.id}`}>תיאור
                  <input type="text" id={`itemDesc-${item.id}`} name={`itemDesc-${item.id}`} value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                </label>
                <label>
                    <input type="checkbox" name={`itemFragile-${item.id}`} checked={item.fragile} onChange={(e) => handleItemChange(item.id, 'fragile', e.target.checked)} /> שביר
                </label>
                <label>
                    <input type="checkbox" name={`itemDisassemble-${item.id}`} checked={item.disassemble} onChange={(e) => handleItemChange(item.id, 'disassemble', e.target.checked)} /> נדרש פירוק
                </label>
                <label>
                    <input type="checkbox" name={`itemAssemble-${item.id}`} checked={item.assemble} onChange={(e) => handleItemChange(item.id, 'assemble', e.target.checked)} /> נדרש הרכבה
                </label>
                <label htmlFor={`itemNote-${item.id}`}>הערות
                  <input type="text" id={`itemNote-${item.id}`} name={`itemNote-${item.id}`} value={item.note} onChange={(e) => handleItemChange(item.id, 'note', e.target.value)} />
                </label>
                <label htmlFor={`itemImg-${item.id}`}>תמונה
                  <input type="file" id={`itemImg-${item.id}`} name={`itemImg-${item.id}`} accept="image/*" onChange={(e) => handleItemChange(item.id, 'img', e.target.files ? e.target.files[0] : null)} />
                </label>
                <button className="material-btn" type="button" onClick={() => removeItem(item.id)}>מחק פריט</button>
                            </div>
                      ))}
                    </div>
          <button className="material-btn" type="button" onClick={addItem}>הוסף פריט</button>

          <div className="buttons">
            <button className="material-btn" type="button" onClick={prevStep}>חזור</button>
            <button className="material-btn" type="button" onClick={nextStep}>המשך</button>
                    </div>
                  </div>

        {/* שלב 5: סיכום */}
        <div className={`step ${currentStep === 4 ? 'active' : ''}`} id="step-5">
          <h2>סיכום</h2>
          {/* Estimated price will need calculation logic */}
          <p><strong>המחיר המשוער:</strong> <span id="estimated-price">₪0</span></p>
          <div className="material-field">
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder=" "></textarea>
            <label htmlFor="notes">הערות נוספות</label>
                    </div>
                    
          <div className="buttons">
            <button className="material-btn" type="button" onClick={prevStep}>חזור</button>
            <button className="material-btn" type="submit">שליחה</button>
                      </div>
          <div ref={successMessageRef} id="success-message" style={{ color: 'green', display: success ? 'block' : 'none' }}>הטופס נשלח בהצלחה!</div>
                  </div>
                </form>
    </div>
  );
};

export default MovingEstimateForm;