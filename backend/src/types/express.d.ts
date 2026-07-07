import 'express';

// מרחיב את הטיפוס של Express Request כדי לצרף את מזהה החשבון (business) המחובר,
// אחרי שעבר אימות JWT ב-businessAuth.ts. כל controller שרץ אחרי אותו middleware
// יכול להשתמש ב-req.tenantId כדי לסנן/לשייך נתונים לעסק הנכון בלבד.
declare global {
    namespace Express {
        interface Request {
            // מזהה חשבון העסק (Business) המחובר - שם שונה בכוונה מ-businessId
            // (שכבר תפוס ב-BusinessSettings למספר עוסק מורשה/ח.פ) כדי למנוע בלבול.
            tenantId?: string;
        }
    }
}
