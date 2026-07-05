import cron from 'node-cron';
import { MoveEstimate } from '../database/models/MoveEstimate';
import { EmailService } from './EmailService';
import { SmsService } from './SmsService';

function formatDateYYYYMMDD(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/**
 * מוצא הזמנות שמועד ההובלה שלהן בעוד יומיים בדיוק, ששלוחת אליהן עדיין לא נשלחה,
 * ושולח תזכורת במייל וב-SMS/WhatsApp (בהתאם למה שמוגדר בסביבה).
 */
export async function runReminderCheck(): Promise<void> {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const targetDate = formatDateYYYYMMDD(twoDaysFromNow);

    try {
        const candidates = await MoveEstimate.find({
            preferredMoveDate: targetDate,
            status: { $ne: 'rejected' },
            reminderEmailSentAt: { $exists: false }
        });

        if (candidates.length === 0) {
            return;
        }

        console.log(`[ReminderCronService] נמצאו ${candidates.length} הזמנות לתזכורת ליום ${targetDate}`);

        for (const estimate of candidates) {
            try {
                if (estimate.email) {
                    await EmailService.sendReminderEmail({
                        to: estimate.email,
                        name: estimate.name,
                        trackingToken: estimate.trackingToken,
                        moveDate: estimate.preferredMoveDate
                    });
                }

                if (estimate.phone) {
                    await SmsService.sendReminderSms({
                        to: estimate.phone,
                        name: estimate.name,
                        trackingToken: estimate.trackingToken,
                        moveDate: estimate.preferredMoveDate
                    });
                    await SmsService.sendReminderWhatsapp({
                        to: estimate.phone,
                        name: estimate.name,
                        trackingToken: estimate.trackingToken,
                        moveDate: estimate.preferredMoveDate
                    });
                }

                estimate.reminderEmailSentAt = new Date();
                estimate.reminderSmsSentAt = new Date();
                estimate.stageHistory.push({ stage: estimate.stage, at: new Date(), note: 'נשלחה תזכורת יומיים לפני ההובלה' });
                await estimate.save();
            } catch (err) {
                console.error(`[ReminderCronService] שגיאה בשליחת תזכורת עבור הזמנה ${estimate._id}:`, err);
            }
        }
    } catch (error) {
        console.error('[ReminderCronService] שגיאה בבדיקת תזכורות:', error);
    }
}

/**
 * מתחיל את משימת הרקע היומית (כל יום ב-08:00).
 */
export function startReminderCron(): void {
    cron.schedule('0 8 * * *', () => {
        runReminderCheck();
    });
    console.log('🕗 ReminderCronService פעיל - בדיקה יומית ב-08:00');
}
