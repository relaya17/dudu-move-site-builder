import { db } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface ConsentReport {
    totalConsents: number;
    activeConsents: number;
    marketingConsents: number;
    consentsByVersion: Record<string, number>;
    recentWithdrawals: number;
    conversionRate: number;
}

interface ConsentTrend {
    date: string;
    total: number;
    active: number;
    marketing: number;
}

export class ConsentReportService {
    static async generateReport(startDate: Date, endDate: Date): Promise<ConsentReport> {
        try {
            const consentsRef = collection(db, 'consents');
            const q = query(
                consentsRef,
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                where('timestamp', '<=', Timestamp.fromDate(endDate))
            );

            const querySnapshot = await getDocs(q);
            const consents = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Array<{
                id: string;
                version: string;
                marketing: boolean;
                timestamp: any;
            }>;

            // חישוב סטטיסטיקות
            const versionCount: Record<string, number> = {};
            let marketingConsents = 0;
            let activeConsents = 0;

            consents.forEach(consent => {
                const version = consent.version;
                versionCount[version] = (versionCount[version] || 0) + 1;

                if (consent.marketing) marketingConsents++;
                if (consent.version !== 'WITHDRAWN') activeConsents++;
            });

            // חישוב ביטולים אחרונים
            const withdrawalsQ = query(
                consentsRef,
                where('version', '==', 'WITHDRAWN'),
                where('timestamp', '>=', Timestamp.fromDate(startDate))
            );
            const withdrawals = (await getDocs(withdrawalsQ)).size;

            return {
                totalConsents: consents.length,
                activeConsents,
                marketingConsents,
                consentsByVersion: versionCount,
                recentWithdrawals: withdrawals,
                conversionRate: (activeConsents / consents.length) * 100
            };
        } catch (error) {
            console.error('שגיאה בהפקת דוח הסכמות:', error);
            throw error;
        }
    }

    static async getTrends(days: number = 30): Promise<ConsentTrend[]> {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const consentsRef = collection(db, 'consents');
            const q = query(
                consentsRef,
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                orderBy('timestamp', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const consents = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate()
            })) as Array<{
                version: string;
                marketing: boolean;
                timestamp: Date;
            }>;

            // ארגון לפי תאריכים
            const trendsByDate = new Map<string, ConsentTrend>();

            consents.forEach(consent => {
                const date = consent.timestamp.toISOString().split('T')[0];
                const existing = trendsByDate.get(date) || {
                    date,
                    total: 0,
                    active: 0,
                    marketing: 0
                };

                existing.total++;
                if (consent.version !== 'WITHDRAWN') existing.active++;
                if (consent.marketing) existing.marketing++;

                trendsByDate.set(date, existing);
            });

            return Array.from(trendsByDate.values());
        } catch (error) {
            console.error('שגיאה בהפקת מגמות הסכמה:', error);
            throw error;
        }
    }

    static async exportToExcel(startDate: Date, endDate: Date): Promise<Blob> {
        try {
            const consentsRef = collection(db, 'consents');
            const q = query(
                consentsRef,
                where('timestamp', '>=', Timestamp.fromDate(startDate)),
                where('timestamp', '<=', Timestamp.fromDate(endDate))
            );

            const querySnapshot = await getDocs(q);
            const consents = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    'מזהה הסכמה': doc.id,
                    'מזהה משתמש': data.userId,
                    'תאריך': data.timestamp.toDate().toLocaleDateString('he-IL'),
                    'גרסה': data.version,
                    'הסכמה לתנאים': data.terms ? 'כן' : 'לא',
                    'הסכמה לפרטיות': data.privacy ? 'כן' : 'לא',
                    'הסכמה לשיווק': data.marketing ? 'כן' : 'לא',
                    'סטטוס': data.version === 'WITHDRAWN' ? 'בוטל' : 'פעיל'
                };
            });

            const ws = XLSX.utils.json_to_sheet(consents, { header: Object.keys(consents[0]) });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'הסכמות');

            // הוספת סיכום
            const summaryData = await this.generateReport(startDate, endDate);
            const summaryWs = XLSX.utils.json_to_sheet([
                { 'מדד': 'סה"כ הסכמות', 'ערך': summaryData.totalConsents },
                { 'מדד': 'הסכמות פעילות', 'ערך': summaryData.activeConsents },
                { 'מדד': 'הסכמות שיווק', 'ערך': summaryData.marketingConsents },
                { 'מדד': 'ביטולים אחרונים', 'ערך': summaryData.recentWithdrawals },
                { 'מדד': 'אחוז המרה', 'ערך': `${summaryData.conversionRate.toFixed(2)}%` }
            ]);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'סיכום');

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        } catch (error) {
            console.error('שגיאה בייצוא דוח הסכמות:', error);
            throw error;
        }
    }
}