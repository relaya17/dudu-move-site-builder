import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';

export async function getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
        const payment = await PaymentService.getOrInitPayment(req.params.token);
        if (!payment) {
            res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
            return;
        }
        res.json({
            success: true,
            data: {
                payment,
                providerMode: PaymentService.getProviderMode(),
            },
        });
    } catch (error) {
        console.error('getPaymentStatus:', error);
        res.status(500).json({ success: false, message: 'שגיאה בטעינת סטטוס תשלום' });
    }
}

export async function initiateCardPayment(req: Request, res: Response): Promise<void> {
    try {
        const result = await PaymentService.initiateCardPayment(req.params.token);
        if (!result) {
            res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
            return;
        }
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('initiateCardPayment:', error);
        res.status(500).json({ success: false, message: 'שגיאה ביצירת תשלום' });
    }
}

export async function confirmDemoPayment(req: Request, res: Response): Promise<void> {
    try {
        const payment = await PaymentService.confirmCardDemoPayment(req.params.token);
        if (!payment) {
            res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
            return;
        }
        res.json({ success: true, data: { payment } });
    } catch (error) {
        console.error('confirmDemoPayment:', error);
        res.status(500).json({ success: false, message: 'שגיאה באישור תשלום' });
    }
}

export async function markBankTransfer(req: Request, res: Response): Promise<void> {
    try {
        const payment = await PaymentService.markBankTransferPending(req.params.token);
        if (!payment) {
            res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
            return;
        }
        res.json({ success: true, data: { payment } });
    } catch (error) {
        console.error('markBankTransfer:', error);
        res.status(500).json({ success: false, message: 'שגיאה בסימון העברה' });
    }
}

export async function requestOpenBanking(req: Request, res: Response): Promise<void> {
    try {
        const payment = await PaymentService.requestOpenBankingLink(req.params.token);
        if (!payment) {
            res.status(404).json({ success: false, message: 'הזמנה לא נמצאה' });
            return;
        }
        res.json({
            success: true,
            data: {
                payment,
                message:
                    'בקשת חיבור Open Banking נרשמה. בישראל נדרש ספק Open Finance מורשה להשלמת החיבור לבנק.',
            },
        });
    } catch (error) {
        console.error('requestOpenBanking:', error);
        res.status(500).json({ success: false, message: 'שגיאה בבקשת Open Banking' });
    }
}
