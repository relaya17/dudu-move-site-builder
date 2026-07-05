// שירות שליחת SMS / WhatsApp תזכורות דרך Twilio.
// פועל רק אם הוגדרו משתני הסביבה הרלוונטיים; אחרת מתעד לוג בלבד ולא נכשל.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let twilioClient: any | null | undefined;

function getFrontendUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any | null {
    if (twilioClient !== undefined) {
        return twilioClient;
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!sid || !authToken) {
        console.warn('⚠️  TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN לא מוגדרים - שליחת SMS/WhatsApp מושבתת (רק לוג לקונסולה)');
        twilioClient = null;
        return twilioClient;
    }

    try {
        // require דינמי כדי לא להפיל את השרת אם החבילה לא מותקנת בסביבה מסוימת
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const twilio = require('twilio');
        twilioClient = twilio(sid, authToken);
    } catch (error) {
        console.warn('⚠️  לא ניתן היה לטעון את חבילת twilio - שליחת SMS/WhatsApp מושבתת', error);
        twilioClient = null;
    }

    return twilioClient;
}

export class SmsService {
    static async sendReminderSms(params: { to: string; name: string; trackingToken: string; moveDate: string }): Promise<void> {
        const body = SmsService.buildReminderText(params);
        await SmsService.sendSms(params.to, body);
    }

    static async sendReminderWhatsapp(params: { to: string; name: string; trackingToken: string; moveDate: string }): Promise<void> {
        const body = SmsService.buildReminderText(params);
        await SmsService.sendWhatsapp(params.to, body);
    }

    private static buildReminderText(params: { name: string; trackingToken: string; moveDate: string }): string {
        const trackingUrl = `${getFrontendUrl()}/tracking/${params.trackingToken}`;
        return `שלום ${params.name}, תזכורת מדוד הובלות: ההובלה שלך מתוכננת בעוד יומיים (${params.moveDate}). מעקב: ${trackingUrl}`;
    }

    private static toE164(phone: string): string {
        // ממיר מספר ישראלי מקומי (05XXXXXXXX) לפורמט בינלאומי (+972...)
        const digits = phone.replace(/\D/g, '');
        if (digits.startsWith('0')) {
            return `+972${digits.slice(1)}`;
        }
        if (phone.startsWith('+')) {
            return phone;
        }
        return `+${digits}`;
    }

    private static async sendSms(to: string, body: string): Promise<void> {
        const client = getClient();
        const from = process.env.TWILIO_FROM_NUMBER;

        if (!client || !from) {
            console.log(`[SmsService] (מדומה - Twilio לא מוגדר) היה נשלח SMS אל ${to}: ${body}`);
            return;
        }

        try {
            await client.messages.create({ from, to: SmsService.toE164(to), body });
        } catch (error) {
            console.error('שגיאה בשליחת SMS:', error);
        }
    }

    private static async sendWhatsapp(to: string, body: string): Promise<void> {
        const client = getClient();
        const from = process.env.TWILIO_WHATSAPP_FROM;

        if (!client || !from) {
            console.log(`[SmsService] (מדומה - WhatsApp לא מוגדר) היה נשלח WhatsApp אל ${to}: ${body}`);
            return;
        }

        try {
            await client.messages.create({
                from: `whatsapp:${from}`,
                to: `whatsapp:${SmsService.toE164(to)}`,
                body
            });
        } catch (error) {
            console.error('שגיאה בשליחת WhatsApp:', error);
        }
    }
}
