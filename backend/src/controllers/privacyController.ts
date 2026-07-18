import { Request, Response } from 'express';
import { z } from 'zod';
import { PrivacyRequest } from '../database/models/PrivacyRequest';
import { MoveEstimate } from '../database/models/MoveEstimate';
import { Customer } from '../database/models/Customer';
import { BusinessSettings } from '../database/models/BusinessSettings';
import { EmailService } from '../services/EmailService';
import { tenantFilter } from '../lib/tenantFilter';

const requestSchema = z.object({
    type: z.enum(['deletion', 'export', 'consent_withdraw']),
    name: z.string().min(2).max(80),
    phone: z.string().regex(/^05\d{8}$/),
    email: z.string().email().optional().or(z.literal('')),
    details: z.string().max(2000).optional(),
});

export async function submitPrivacyRequest(req: Request, res: Response): Promise<void> {
    try {
        const parsed = requestSchema.parse(req.body);
        const doc = await PrivacyRequest.create({
            type: parsed.type,
            name: parsed.name,
            phone: parsed.phone,
            email: parsed.email || undefined,
            details: parsed.details,
            status: 'received',
        });

        const settings = await BusinessSettings.findOne(tenantFilter(undefined));
        const to = settings?.email || process.env.EMAIL_USER;
        if (to) {
            await EmailService.sendContactMessage({
                to,
                fromName: parsed.name,
                fromPhone: parsed.phone,
                fromEmail: parsed.email || undefined,
                message:
                    `בקשת פרטיות מסוג: ${parsed.type}\n` +
                    `מזהה בקשה: ${doc.id}\n` +
                    (parsed.details || ''),
                businessName: settings?.businessName,
            });
        }

        res.status(200).json({
            success: true,
            message: 'בקשת הפרטיות נרשמה. נטפל בה תוך 30 יום כנדרש בחוק.',
            data: { requestId: doc.id, type: doc.type },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: 'נא למלא שם, טלפון תקין וסוג בקשה' });
            return;
        }
        console.error('submitPrivacyRequest:', error);
        res.status(500).json({ success: false, message: 'שגיאה ברישום בקשת הפרטיות' });
    }
}

/** ייצוא נתונים לפי טלפון/אימייל (זכות עיון/ניידות — GDPR / חוק הגנת הפרטיות). */
export async function exportMyData(req: Request, res: Response): Promise<void> {
    try {
        const phone = typeof req.body.phone === 'string' ? req.body.phone : '';
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        if (!/^05\d{8}$/.test(phone) && !email) {
            res.status(400).json({ success: false, message: 'נא לספק טלפון או אימייל' });
            return;
        }

        const filter: Record<string, unknown> = {};
        if (/^05\d{8}$/.test(phone)) filter.phone = phone;
        if (email) filter.email = email;

        const estimates = await MoveEstimate.find(filter).limit(50).lean();
        const customers = await Customer.find(filter).limit(20).lean();

        const payload = {
            exportedAt: new Date().toISOString(),
            estimates: estimates.map(e => ({
                name: e.name,
                phone: e.phone,
                email: e.email,
                addresses: { from: e.currentAddress, to: e.destinationAddress },
                totalPrice: e.totalPrice,
                status: e.status,
                createdAt: e.createdAt,
                consents: e.consents,
                paymentStatus: e.payment?.status,
            })),
            customers: customers.map(c => ({
                name: c.name,
                phone: c.phone,
                email: c.email,
                createdAt: (c as any).createdAt,
            })),
        };

        res.status(200).json({ success: true, data: payload });
    } catch (error) {
        console.error('exportMyData:', error);
        res.status(500).json({ success: false, message: 'שגיאה בייצוא הנתונים' });
    }
}
