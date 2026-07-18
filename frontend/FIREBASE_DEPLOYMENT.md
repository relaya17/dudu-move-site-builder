# הוראות פרסום ל-Firebase Hosting

## שלב 1: הגדרת Firebase CLI

```bash
# התקנת Firebase CLI גלובלית
npm install -g firebase-tools

# התחברות ל-Firebase
firebase login
```

## שלב 2: הגדרת פרויקט Firebase

1. **עדכן את `.firebaserc`** עם ה-ID של הפרויקט שלך:

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

2. **צור פרויקט חדש ב-Firebase Console** אם עוד לא יצרת:
   - לך ל-[Firebase Console](https://console.firebase.google.com/)
   - לחץ על "Add project"
   - תן שם לפרויקט
   - עקוב אחר ההוראות

## שלב 3: התקנת תלויות

```bash
cd frontend
npm install
```

## שלב 4: בנייה ופרסום

```bash
# בנייה ופרסום לפרודקשן
npm run deploy

# או לפרסום preview
npm run deploy:preview
```

## שלב 5: הגדרת משתני סביבה

צור קובץ `.env.local` בתיקיית `frontend`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## פתרון בעיות נפוצות

### שגיאה: "Firebase project not found"

- ודא שה-ID של הפרויקט ב-`.firebaserc` נכון
- ודא שיש לך הרשאות לפרויקט

### שגיאה: "Build failed"

- ודא שכל התלויות מותקנות: `npm install`
- בדוק שאין שגיאות TypeScript: `npm run lint`

### שגיאה: "Permission denied"

- ודא שהתחברת ל-Firebase: `firebase login`
- ודא שיש לך הרשאות לפרויקט

## פקודות שימושיות

```bash
# בדיקת סטטוס Firebase
firebase projects:list

# בדיקת הגדרות
firebase use

# ניהול פרויקטים
firebase projects:list
firebase use [PROJECT_ID]

# פרסום ידני
firebase deploy --only hosting
```
