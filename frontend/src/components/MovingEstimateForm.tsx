// components/MovingEstimateForm.tsx
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';

export const MovingEstimateForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartmentType: '',
    preferredMoveDate: '',
    currentAddress: '',
    destinationAddress: '',
    additionalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/moving-estimates', formData);
      alert('בקשת הערכת מחיר נשלחה בהצלחה!');
    } catch (error) {
      console.error(error);
      alert('אירעה שגיאה בשליחת הבקשה');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <input name="name" placeholder="שם מלא" onChange={handleChange} required />
      <input name="email" type="email" placeholder="אימייל" onChange={handleChange} />
      <input name="phone" type="tel" placeholder="טלפון" onChange={handleChange} required />
      <select name="apartmentType" onChange={handleChange as any}>
        <option value="">בחר סוג דירה</option>
        <option value="1.5">1.5 חדרים</option>
        <option value="2">2 חדרים</option>
        <option value="2.5">2.5 חדרים</option>
        <option value="3">3 חדרים</option>
        <option value="3.5">3.5 חדרים</option>
        <option value="4">4 חדרים</option>
        <option value="4.5">4.5 חדרים</option>
        <option value="5+">5+ חדרים</option>
      </select>
      <input type="date" name="preferredMoveDate" onChange={handleChange} />
      <input name="currentAddress" placeholder="כתובת נוכחית" onChange={handleChange} />
      <input name="destinationAddress" placeholder="כתובת יעד" onChange={handleChange} />
      <textarea name="additionalNotes" placeholder="פרטים נוספים (קומה, מעלית, חניה וכו')" onChange={handleChange} />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        קבל הערכת מחיר
      </button>
    </form>
  );
};
