import { Router } from 'express';
import moveRequestRoutes from './moveRequestRoutes';
import aiRoutes from './aiRoutes';
import { PricingService } from '../services/PricingService';
import nodemailer from 'nodemailer';

const router = Router();

// הגדרת routes
router.use('/move-requests', moveRequestRoutes);
router.use('/ai', aiRoutes);

// Route לקבלת מחירי רהיטים
router.get('/furniture-pricing', (req, res) => {
    try {
        const pricing = PricingService.getAllFurniturePricing();
        const minPrice = PricingService.getMinimumPrice();
        const maxPrice = PricingService.getMaximumPrice();

        res.json({
            success: true,
            data: {
                furniture: pricing,
                priceRange: {
                    min: minPrice,
                    max: maxPrice
                }
            }
        });
    } catch (error) {
        console.error('שגיאה בקבלת מחירי רהיטים:', error);
        res.status(500).json({
            success: false,
            message: 'אירעה שגיאה בקבלת מחירי רהיטים'
        });
    }
});

// Route לחישוב מחיר פריט ספציפי
router.post('/calculate-item-price', (req, res) => {
    try {
        const { itemType, quantity = 1 } = req.body;

        if (!itemType) {
            return res.status(400).json({
                success: false,
                message: 'נדרש סוג פריט'
            });
        }

        const priceInfo = PricingService.getItemPrice(itemType, quantity);

        res.json({
            success: true,
            data: priceInfo
        });
    } catch (error) {
        console.error('שגיאה בחישוב מחיר פריט:', error);
        res.status(500).json({
            success: false,
            message: 'אירעה שגיאה בחישוב מחיר הפריט'
        });
    }
});

// נתיב לשליחת מייל
router.post('/send-email', async (req, res) => {
    try {
        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({
                success: false,
                message: 'נדרשים כל הפרטים לשליחת מייל'
            });
        }

        // יצירת transporter לשליחת מייל
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'david.move.test@gmail.com',
                pass: process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'david.move.test@gmail.com',
            to: to,
            subject: subject,
            html: html
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'המייל נשלח בהצלחה'
        });
    } catch (error) {
        console.error('שגיאה בשליחת מייל:', error);
        res.status(500).json({
            success: false,
            message: 'אירעה שגיאה בשליחת המייל'
        });
    }
});

export default router;
