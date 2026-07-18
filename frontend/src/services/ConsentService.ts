import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

export interface ConsentData {
    userId?: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    marketingAccepted: boolean;
    timestamp: Date;
    version: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}

export interface ConsentRecord {
    id: string;
    userId: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
    marketingAccepted: boolean;
    timestamp: Date;
    version: string;
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    revokedAt?: Date;
    revokedReason?: string;
}

export class ConsentService {
    private static readonly COLLECTION_NAME = 'consents';

    /**
     * שמירת הסכמת משתמש
     */
    static async saveConsent(consentData: ConsentData): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
                ...consentData,
                timestamp: Timestamp.fromDate(consentData.timestamp),
                createdAt: Timestamp.now(),
                status: 'active'
            });

            console.log('הסכמה נשמרה בהצלחה:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('שגיאה בשמירת הסכמה:', error);
            throw new Error('לא ניתן לשמור את ההסכמה');
        }
    }

    /**
     * בדיקה אם משתמש הסכים לתנאים
     */
    static async hasValidConsent(userId: string, version: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('userId', '==', userId),
                where('version', '==', version),
                where('termsAccepted', '==', true),
                where('privacyAccepted', '==', true),
                where('status', '==', 'active')
            );

            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('שגיאה בבדיקת הסכמה:', error);
            return false;
        }
    }

    /**
     * קבלת היסטוריית הסכמות של משתמש
     */
    static async getUserConsents(userId: string): Promise<ConsentRecord[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('userId', '==', userId),
                where('status', '==', 'active')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate(),
                revokedAt: doc.data().revokedAt?.toDate()
            })) as ConsentRecord[];
        } catch (error) {
            console.error('שגיאה בקבלת הסכמות משתמש:', error);
            throw new Error('לא ניתן לקבל את היסטוריית ההסכמות');
        }
    }

    /**
     * ביטול הסכמה
     */
    static async revokeConsent(consentId: string, reason?: string): Promise<void> {
        try {
            const consentRef = doc(db, this.COLLECTION_NAME, consentId);
            await updateDoc(consentRef, {
                status: 'revoked',
                revokedAt: Timestamp.now(),
                revokedReason: reason || 'ביטול על ידי המשתמש'
            });

            console.log('הסכמה בוטלה בהצלחה:', consentId);
        } catch (error) {
            console.error('שגיאה בביטול הסכמה:', error);
            throw new Error('לא ניתן לבטל את ההסכמה');
        }
    }

    /**
     * עדכון הסכמה קיימת
     */
    static async updateConsent(consentId: string, updates: Partial<ConsentData>): Promise<void> {
        try {
            const consentRef = doc(db, this.COLLECTION_NAME, consentId);
            const updateData: any = {
                ...updates,
                updatedAt: Timestamp.now()
            };

            if (updates.timestamp) {
                updateData.timestamp = Timestamp.fromDate(updates.timestamp);
            }

            await updateDoc(consentRef, updateData);
            console.log('הסכמה עודכנה בהצלחה:', consentId);
        } catch (error) {
            console.error('שגיאה בעדכון הסכמה:', error);
            throw new Error('לא ניתן לעדכן את ההסכמה');
        }
    }

    /**
     * בדיקה אם נדרשת הסכמה חדשה
     */
    static async requiresNewConsent(userId: string, currentVersion: string): Promise<boolean> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('userId', '==', userId),
                where('version', '==', currentVersion),
                where('status', '==', 'active')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (error) {
            console.error('שגיאה בבדיקת צורך בהסכמה חדשה:', error);
            return true; // בטוח יותר לדרוש הסכמה חדשה
        }
    }

    /**
     * קבלת סטטיסטיקות הסכמות
     */
    static async getConsentStats(): Promise<{
        totalConsents: number;
        activeConsents: number;
        revokedConsents: number;
        marketingOptIns: number;
    }> {
        try {
            const [totalQuery, activeQuery, revokedQuery, marketingQuery] = await Promise.all([
                getDocs(collection(db, this.COLLECTION_NAME)),
                getDocs(query(collection(db, this.COLLECTION_NAME), where('status', '==', 'active'))),
                getDocs(query(collection(db, this.COLLECTION_NAME), where('status', '==', 'revoked'))),
                getDocs(query(collection(db, this.COLLECTION_NAME), where('marketingAccepted', '==', true)))
            ]);

            return {
                totalConsents: totalQuery.size,
                activeConsents: activeQuery.size,
                revokedConsents: revokedQuery.size,
                marketingOptIns: marketingQuery.size
            };
        } catch (error) {
            console.error('שגיאה בקבלת סטטיסטיקות הסכמות:', error);
            throw new Error('לא ניתן לקבל סטטיסטיקות');
        }
    }

    /**
     * ניקוי הסכמות ישנות (יותר מ-7 שנים)
     */
    static async cleanupOldConsents(): Promise<number> {
        try {
            const sevenYearsAgo = new Date();
            sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('timestamp', '<', Timestamp.fromDate(sevenYearsAgo))
            );

            const querySnapshot = await getDocs(q);
            let deletedCount = 0;

            for (const docSnapshot of querySnapshot.docs) {
                await updateDoc(docSnapshot.ref, {
                    status: 'archived',
                    archivedAt: Timestamp.now(),
                    archivedReason: 'ניקוי אוטומטי - הסכמה ישנה'
                });
                deletedCount++;
            }

            console.log(`נוקו ${deletedCount} הסכמות ישנות`);
            return deletedCount;
        } catch (error) {
            console.error('שגיאה בניקוי הסכמות ישנות:', error);
            throw new Error('לא ניתן לנקות הסכמות ישנות');
        }
    }
}