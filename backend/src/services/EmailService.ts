import nodemailer, { Transporter } from 'nodemailer';

function getFrontendUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function buildTrackingUrl(trackingToken: string): string {
    return `${getFrontendUrl()}/tracking/${trackingToken}`;
}

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
    if (transporter !== undefined) {
        return transporter;
    }

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️  EMAIL_USER/EMAIL_PASS לא מוגדרים - שליחת מיילים מושבתת (רק לוג לקונסולה)');
        transporter = null;
        return transporter;
    }

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    return transporter;
}

export class EmailService {
    static async sendConfirmationEmail(params: { to: string; name: string; trackingToken: string }): Promise<void> {
        const { to, name, trackingToken } = params;
        const trackingUrl = buildTrackingUrl(trackingToken);
        const subject = 'בקשתך להערכת מחיר התקבלה - דוד הובלות';
        const html = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>תודה, ${name}!</h2>
                <p>בקשתך להערכת מחיר להובלה התקבלה בהצלחה. נציג שלנו יצור איתך קשר בקרוב.</p>
                <p>תוכל/י לעקוב אחרי סטטוס ההובלה שלך בכל שלב - כולל תזכורת יומיים לפני מועד ההובלה ומיקום הצוות ביום ההובלה עצמו - דרך הקישור האישי הבא:</p>
                <p><a href="${trackingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">מעקב אחרי ההובלה שלי</a></p>
                <p style="color:#666;font-size:13px;">${trackingUrl}</p>
                <p>בברכה,<br/>צוות דוד הובלות</p>
            </div>
        `;

        await EmailService.send({ to, subject, html });
    }

    static async sendReminderEmail(params: { to: string; name: string; trackingToken: string; moveDate: string }): Promise<void> {
        const { to, name, trackingToken, moveDate } = params;
        const trackingUrl = buildTrackingUrl(trackingToken);
        const subject = `תזכורת: ההובלה שלך בעוד יומיים (${moveDate}) - דוד הובלות`;
        const html = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>שלום ${name},</h2>
                <p>זוהי תזכורת ידידותית - ההובלה שלך מתוכננת בעוד יומיים, בתאריך <strong>${moveDate}</strong>.</p>
                <p>מומלץ להתחיל להתארגן מראש. ניתן לעקוב אחרי סטטוס ההובלה ומיקום הצוות ביום ההובלה דרך הקישור:</p>
                <p><a href="${trackingUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">מעקב אחרי ההובלה שלי</a></p>
                <p style="color:#666;font-size:13px;">${trackingUrl}</p>
                <p>בברכה,<br/>צוות דוד הובלות</p>
            </div>
        `;

        await EmailService.send({ to, subject, html });
    }

    private static async send(params: { to: string; subject: string; html: string }): Promise<void> {
        const t = getTransporter();
        if (!t) {
            console.log(`[EmailService] (מדומה - לא הוגדר SMTP) היה נשלח מייל אל ${params.to}: ${params.subject}`);
            return;
        }

        try {
            await t.sendMail({
                from: process.env.EMAIL_USER,
                to: params.to,
                subject: params.subject,
                html: params.html
            });
        } catch (error) {
            console.error('שגיאה בשליחת מייל:', error);
            throw error;
        }
    }
}
