# דודו הובלות - מערכת ניהול

מערכת לניהול חברת הובלות הכוללת ממשק משתמש מתקדם, מערכת הערכת מחירים אוטומטית, ומערכת ניהול לקוחות.

## תכונות עיקריות

- 🚛 טופס הערכת מחיר אוטומטי
- 📊 דשבורד ניהול מתקדם
- 🤖 המלצות AI לייעול העסק
- 📱 ממשק מותאם למובייל
- 🔔 התראות בזמן אמת
- 📈 דוחות וניתוח נתונים

## התקנה

1. התקן את הדרישות המקדימות:
   ```bash
   node -v  # נדרש Node.js 18 ומעלה
   pnpm -v  # נדרש pnpm 8 ומעלה
   ```

2. התקן את התלויות:
   ```bash
   pnpm install
   ```

3. העתק את קובץ הסביבה:
   ```bash
   cp .env.example .env
   ```
   והגדר את המשתנים הנדרשים

4. הפעל את הפרויקט:
   ```bash
   # פיתוח
   pnpm dev

   # בנייה
   pnpm build

   # הפעלה
   pnpm start
   ```

## מבנה הפרויקט

```
dudu-move-site-builder/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── ...
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── routes/
│   └── ...
└── ...
```

## טכנולוגיות

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - shadcn/ui
  - Firebase
  - React Query

- **Backend:**
  - Node.js
  - Express
  - TypeScript
  - Firebase Admin
  - OpenAI

## רישוי

כל הזכויות שמורות © 2024