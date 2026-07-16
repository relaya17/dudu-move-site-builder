import { Request, Response } from 'express';
import { z } from 'zod';
import { BusinessSettings } from '../database/models/BusinessSettings';
import { EmailService } from '../services/EmailService';
import { tenantFilter } from '../lib/tenantFilter';

const contactSchema = z.object({
    name: z.string().min(2).max(80),
    phone: z.string().regex(/^05\d{8}$/, 'מספר טלפון לא תקין'),
    email: z.string().email().optional().or(z.literal('')),
    message: z.string().min(5).max(2000),
});

/**
 * POST /api/public/contact — פנייה מהאתר הציבורי למייל העסק.
 */
export async function submitContactForm(req: Request, res: Response): Promise<void> {
    try {
        const parsed = contactSchema.parse(req.body);
        const settings = await BusinessSettings.findOne(tenantFilter(undefined));
        const to = settings?.email || process.env.EMAIL_USER || 'davidgueta3232@gmail.com';

        await EmailService.sendContactMessage({
            to,
            fromName: parsed.name,
            fromPhone: parsed.phone,
            fromEmail: parsed.email || undefined,
            message: parsed.message,
            businessName: settings?.businessName,
        });

        res.status(200).json({ success: true, message: 'הפנייה נשלחה בהצלחה. נחזור אליך בהקדם.' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: 'נא למלא שם, טלפון תקין והודעה' });
            return;
        }
        console.error('Error submitting contact form:', error);
        res.status(500).json({ success: false, message: 'שליחת הפנייה נכשלה. נסו שוב או התקשרו אלינו.' });
    }
}
