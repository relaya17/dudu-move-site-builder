import mongoose, { Document, Schema } from 'mongoose';

/**
 * חשבון עסק (tenant) - הבסיס למעבר ממערכת "עסק יחיד" (BusinessSettings כ-singleton)
 * למערכת SaaS רב-דיירית: כל מוביל שנרשם מקבל מסמך Business משלו, וכל הנתונים
 * שלו (הצעות מחיר, לקוחות, הגדרות) ישויכו אליו דרך businessId (ר' migration בהמשך -
 * שלב זה מוסיף רק את מודל החשבון + הרשמה/התחברות, בלי לשייך עדיין את האוספים הקיימים).
 *
 * הסיסמה נשמרת כ-hash בלבד (bcrypt) - לעולם לא כטקסט גלוי.
 */
export interface IBusiness extends Document {
    ownerEmail: string;
    passwordHash: string;
    businessName: string;
    // מזהה ציבורי קצר לעסק (לדוגמה לצורך subdomain/URL עתידי: david-move.yourapp.com) -
    // ייחודי, נגזר משם העסק בהרשמה וניתן לשינוי מאוחר יותר דרך הגדרות.
    slug: string;
    // סטטוס המנוי - placeholder לקראת חיבור סליקה חוזרת (Stripe/Cardcom/Tranzila,
    // עוד לא הוחלט). 'trial' כברירת מחדל כדי שעסק חדש יוכל להתחיל להשתמש מיד.
    subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled';
    createdAt: Date;
    updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>({
    ownerEmail: { type: String, required: true, trim: true, lowercase: true, unique: true },
    // לא נבחר כברירת מחדל בשליפות (select: false) כדי שלא "יזלוג" בטעות בתשובת API רגילה.
    passwordHash: { type: String, required: true, select: false },
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'past_due', 'canceled'],
        default: 'trial'
    }
}, {
    timestamps: true
});

export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);
