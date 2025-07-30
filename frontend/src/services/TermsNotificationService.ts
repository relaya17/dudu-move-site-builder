import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';

interface TermsUpdate {
    version: string;
    type: 'terms' | 'privacy' | 'accessibility';
    summary: string;
    majorChanges: boolean;
    effectiveDate: Date;
    requiresReConsent: boolean;
    changes: {
        section: string;
        oldText?: string;
        newText: string;
        explanation: string;
    }[];
}

export class TermsNotificationService {
    static async announceUpdate(update: Omit<TermsUpdate, 'effectiveDate'> & { effectiveDate: string }): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, 'terms_updates'), {
                ...update,
                effectiveDate: new Date(update.effectiveDate),
                announcedAt: Timestamp.now(),
                notifiedUsers: 0,
                acceptedUsers: 0
            });

            // שליחת התראות למשתמשים מושפעים
            if (update.requiresReConsent) {
                await this.notifyAffectedUsers(update);
            }

            return docRef.id;
        } catch (error) {
            console.error('שגיאה בהכרזה על עדכון תנאים:', error);
            throw error;
        }
    }

    private static async notifyAffectedUsers(update: TermsUpdate) {
        try {
            // מציאת משתמשים שצריכים לאשר מחדש
            const consentsRef = collection(db, 'consents');
            const q = query(
                consentsRef,
                where('version', '<', update.version),
                where('type', '==', update.type)
            );

            const affectedUsers = await getDocs(q);

            // יצירת התראות למשתמשים
            const notifications = affectedUsers.docs.map(doc => ({
                userId: doc.data().userId,
                type: 'TERMS_UPDATE',
                title: 'עדכון תנאי שימוש',
                message: `חלו שינויים מהותיים ב${this.getTypeDisplay(update.type)}. נדרש אישור מחדש.`,
                termsVersion: update.version,
                createdAt: Timestamp.now(),
                read: false,
                acted: false
            }));

            // שמירת ההתראות במסד הנתונים
            for (const notification of notifications) {
                await addDoc(collection(db, 'notifications'), notification);
            }

            // עדכון מונה המשתמשים שקיבלו התראה
            await this.updateNotificationCount(update.version, notifications.length);
        } catch (error) {
            console.error('שגיאה בשליחת התראות למשתמשים:', error);
            throw error;
        }
    }

    private static getTypeDisplay(type: string): string {
        switch (type) {
            case 'terms': return 'תנאי השימוש';
            case 'privacy': return 'מדיניות הפרטיות';
            case 'accessibility': return 'הצהרת הנגישות';
            default: return 'המסמך';
        }
    }

    private static async updateNotificationCount(version: string, count: number) {
        try {
            const updatesRef = collection(db, 'terms_updates');
            const q = query(
                updatesRef,
                where('version', '==', version),
                orderBy('announcedAt', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const updateDoc = querySnapshot.docs[0];
                await updateDoc.ref.update({
                    notifiedUsers: count
                });
            }
        } catch (error) {
            console.error('שגיאה בעדכון מונה התראות:', error);
        }
    }

    static async getLatestUpdates(): Promise<TermsUpdate[]> {
        try {
            const updatesRef = collection(db, 'terms_updates');
            const q = query(
                updatesRef,
                orderBy('effectiveDate', 'desc'),
                limit(5)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                effectiveDate: doc.data().effectiveDate.toDate()
            })) as TermsUpdate[];
        } catch (error) {
            console.error('שגיאה בשליפת עדכונים אחרונים:', error);
            throw error;
        }
    }

    static async markUpdateAsRead(userId: string, updateId: string): Promise<void> {
        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                where('termsVersion', '==', updateId)
            );

            const querySnapshot = await getDocs(q);
            const batch = db.batch();

            querySnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error('שגיאה בסימון עדכון כנקרא:', error);
            throw error;
        }
    }
}