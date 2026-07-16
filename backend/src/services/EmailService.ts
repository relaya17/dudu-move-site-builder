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

    static async sendQuoteEmail(params: {
        to: string;
        name: string;
        quoteNumber: string;
        totalPrice: number;
        fromAddress: string;
        toAddress: string;
        moveDate: string;
    }): Promise<void> {
        const { to, name, quoteNumber, totalPrice, fromAddress, toAddress, moveDate } = params;
        const subject = `הצעת מחיר ${quoteNumber} - דוד הובלות`;
        const html = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background: #1d4ed8; color: #fff; padding: 24px;">
                    <h1 style="margin:0; font-size:22px;">🚛 דוד הובלות</h1>
                    <p style="margin:4px 0 0; opacity:.8;">הצעת מחיר</p>
                </div>
                <div style="padding: 24px;">
                    <p>שלום ${name},</p>
                    <p>להלן הצעת המחיר שהוכנה עבורך:</p>
                    <table style="width:100%; border-collapse:collapse; margin:16px 0;">
                        <tr style="background:#f3f4f6;"><td style="padding:8px 12px; font-weight:bold;">מספר הצעה</td><td style="padding:8px 12px;">${quoteNumber}</td></tr>
                        <tr><td style="padding:8px 12px; font-weight:bold;">כתובת מוצא</td><td style="padding:8px 12px;">${fromAddress}</td></tr>
                        <tr style="background:#f3f4f6;"><td style="padding:8px 12px; font-weight:bold;">כתובת יעד</td><td style="padding:8px 12px;">${toAddress}</td></tr>
                        <tr><td style="padding:8px 12px; font-weight:bold;">תאריך משוער</td><td style="padding:8px 12px;">${moveDate}</td></tr>
                        <tr style="background:#eff6ff;"><td style="padding:12px; font-weight:bold; font-size:16px;">סה"כ לתשלום</td><td style="padding:12px; font-size:18px; font-weight:bold; color:#1d4ed8;">₪${totalPrice.toLocaleString('he-IL')}</td></tr>
                    </table>
                    <p style="color:#6b7280; font-size:13px;">* הצעת מחיר זו תקפה ל-14 ימים. המחיר הסופי עשוי להשתנות בהתאם לממצאים בשטח.</p>
                    <p>לשאלות ופרטים נוספים: <a href="tel:0547777623">054-7777623</a></p>
                    <p>בברכה,<br/>צוות דוד הובלות</p>
                </div>
            </div>`;
        await EmailService.send({ to, subject, html });
    }

    /** הודעת יצירת קשר מהאתר הציבורי → למייל העסק. */
    static async sendContactMessage(params: {
        to: string;
        fromName: string;
        fromPhone: string;
        fromEmail?: string;
        message: string;
        businessName?: string;
    }): Promise<void> {
        const { to, fromName, fromPhone, fromEmail, message, businessName } = params;
        const subject = `פנייה חדשה מהאתר${businessName ? ` - ${businessName}` : ''}`;
        const html = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>פנייה חדשה מהאתר</h2>
                <p><strong>שם:</strong> ${fromName}</p>
                <p><strong>טלפון:</strong> <a href="tel:${fromPhone}">${fromPhone}</a></p>
                ${fromEmail ? `<p><strong>אימייל:</strong> <a href="mailto:${fromEmail}">${fromEmail}</a></p>` : ''}
                <hr/>
                <p style="white-space:pre-wrap;">${message}</p>
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
