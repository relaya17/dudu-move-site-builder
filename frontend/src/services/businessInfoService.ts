// src/services/businessInfoService.ts
// שולף את שם העסק המוצג בעמודי הלקוחות (Navbar/Footer) מתוך הגדרות העסק
// בבקאנד - כך שכל מוביל שמפעיל את המערכת יוכל להציג את השם שלו (נקבע במסך
// ההגדרות בפאנל הניהול) בלי לגעת בקוד. נתיב ציבורי בכוונה - ר' backend/src/routes/publicRoutes.ts.

const API_ROOT = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://dudu-move-backend.onrender.com');

// שם ברירת מחדל - רק למקרה שהשרת לא זמין (למשל בזמן טעינה ראשונה/ניתוק זמני),
// כדי שהנאב/פוטר לא יישארו ריקים. שם העסק ה"אמיתי" תמיד מגיע מהשרת.
export const FALLBACK_BUSINESS_NAME = 'David Move';

export async function fetchBusinessName(): Promise<string> {
  try {
    const response = await fetch(`${API_ROOT}/api/public/business-info`);
    if (!response.ok) return FALLBACK_BUSINESS_NAME;
    const result = await response.json();
    return result?.data?.businessName || FALLBACK_BUSINESS_NAME;
  } catch {
    return FALLBACK_BUSINESS_NAME;
  }
}
