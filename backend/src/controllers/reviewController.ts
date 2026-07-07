import { Request, Response } from 'express';
import { Review } from '../database/models/Review';

export class ReviewController {
    /** GET /api/reviews — public, all approved reviews */
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const filter: Record<string, unknown> = { approved: true };
            if (req.query.tenantId) filter.tenantId = req.query.tenantId;

            const reviews = await Review.find(filter)
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            res.json({ success: true, data: reviews });
        } catch (err) {
            res.status(500).json({ success: false, message: 'שגיאה בטעינת הביקורות' });
        }
    }

    /** POST /api/reviews — public, submit a review */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const { customerName, text, rating, photoUrl, tenantId } = req.body;

            if (!customerName || !text || !rating) {
                res.status(400).json({ success: false, message: 'שם, טקסט ודירוג הם שדות חובה' });
                return;
            }
            if (rating < 1 || rating > 5) {
                res.status(400).json({ success: false, message: 'דירוג חייב להיות בין 1 ל-5' });
                return;
            }

            const review = await Review.create({
                customerName: String(customerName).slice(0, 80),
                text: String(text).slice(0, 1000),
                rating: Number(rating),
                photoUrl: photoUrl ? String(photoUrl).slice(0, 500) : undefined,
                tenantId: tenantId || undefined,
                approved: true,
            });

            res.status(201).json({ success: true, data: review });
        } catch (err) {
            res.status(500).json({ success: false, message: 'שגיאה בשמירת הביקורת' });
        }
    }

    /** POST /api/reviews/:id/reply — admin only, add business reply */
    static async reply(req: Request, res: Response): Promise<void> {
        try {
            const { reply } = req.body;
            if (!reply) {
                res.status(400).json({ success: false, message: 'תגובה ריקה' });
                return;
            }

            const review = await Review.findByIdAndUpdate(
                req.params.id,
                { reply: String(reply).slice(0, 1000), repliedAt: new Date() },
                { new: true }
            );

            if (!review) {
                res.status(404).json({ success: false, message: 'ביקורת לא נמצאה' });
                return;
            }

            res.json({ success: true, data: review });
        } catch (err) {
            res.status(500).json({ success: false, message: 'שגיאה בשמירת התגובה' });
        }
    }

    /** DELETE /api/reviews/:id — admin only */
    static async remove(req: Request, res: Response): Promise<void> {
        try {
            await Review.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: 'שגיאה במחיקת הביקורת' });
        }
    }
}
