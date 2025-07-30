import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface Consent {
    userId: string;
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
    version: string;
    timestamp: Date;
    ip?: string;
    userAgent?: string;
}

export class ConsentService {
    private static readonly COLLECTION = 'consents';

    static async recordConsent(consent: Omit<Consent, 'timestamp'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, this.COLLECTION), {
                ...consent,
                timestamp: Timestamp.now(),
            });

            // שמירת לוג נפרד להסכמות
            await addDoc(collection(db, 'consent_logs'), {
                consentId: docRef.id,
                userId: consent.userId,
                action: 'CONSENT_GIVEN',
                details: consent,
                timestamp: Timestamp.now(),
            });

            return docRef.id;
        } catch (error) {
            console.error('שגיאה בשמירת הסכמה:', error);
            throw error;
        }
    }

    static async getUserConsents(userId: string): Promise<Consent[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate(),
            })) as Consent[];
        } catch (error) {
            console.error('שגיאה בשליפת הסכמות:', error);
            throw error;
        }
    }

    static async hasValidConsent(userId: string, requiredVersion: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('userId', '==', userId),
                where('version', '==', requiredVersion)
            );

            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('שגיאה בבדיקת תוקף הסכמה:', error);
            return false;
        }
    }

    static async withdrawConsent(userId: string): Promise<void> {
        try {
            // שמירת לוג ביטול הסכמה
            await addDoc(collection(db, 'consent_logs'), {
                userId,
                action: 'CONSENT_WITHDRAWN',
                timestamp: Timestamp.now(),
            });

            // לא מוחקים הסכמות ישנות, רק מסמנים אותן כמבוטלות
            await addDoc(collection(db, this.COLLECTION), {
                userId,
                terms: false,
                privacy: false,
                marketing: false,
                version: 'WITHDRAWN',
                timestamp: Timestamp.now(),
            });
        } catch (error) {
            console.error('שגיאה בביטול הסכמה:', error);
            throw error;
        }
    }
}