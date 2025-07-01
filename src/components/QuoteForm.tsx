// components/QuoteForm.tsx
import * as React from 'react';
import { useState } from 'react';
import axios from 'axios';

export const QuoteForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    move_type: '',
    move_date: '',
    from_address: '',
    to_address: '',
    details: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/quotes', formData);
      alert('הטופס נשלח בהצלחה!');
    } catch (error) {
      console.error(error);
      alert('אירעה שגיאה בשליחה');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <input name="name" placeholder="שם" onChange={handleChange} required />
      <input name="email" placeholder="אימייל" onChange={handleChange} />
      <input name="phone" placeholder="טלפון" onChange={handleChange} required />
      <input name="move_type" placeholder="סוג ההובלה" onChange={handleChange} />
      <input type="date" name="move_date" onChange={handleChange} />
      <input name="from_address" placeholder="כתובת מוצא" onChange={handleChange} />
      <input name="to_address" placeholder="כתובת יעד" onChange={handleChange} />
      <textarea name="details" placeholder="הערות נוספות" onChange={handleChange} />
      <button type="submit">שלח</button>
    </form>
  );
};
