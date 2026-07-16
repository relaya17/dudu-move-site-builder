import { Request, Response } from 'express';
import { TrackingService } from '../services/TrackingService';

export const getTrackingByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const view = await TrackingService.getByToken(token);

        if (!view) {
            res.status(404).json({ success: false, message: 'לא נמצא מעקב עבור קישור זה' });
            return;
        }

        res.status(200).json({ success: true, data: view });
    } catch (error) {
        console.error('שגיאה בשליפת מעקב הובלה:', error);
        res.status(500).json({ success: false, message: 'אירעה שגיאה בשליפת נתוני המעקב' });
    }
};

/** מסמכים להדפסה/הורדה ללקוח לפי טוקן מעקב. */
export const getTrackingDocuments = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const data = await TrackingService.getPrintableDocuments(token);

        if (!data) {
            res.status(404).json({ success: false, message: 'לא נמצא מעקב עבור קישור זה' });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('שגיאה בשליפת מסמכי מעקב:', error);
        res.status(500).json({ success: false, message: 'אירעה שגיאה בטעינת המסמכים' });
    }
};

export const updateTrackingStage = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { stage, note } = req.body;

        if (!stage || typeof stage !== 'string') {
            res.status(400).json({ success: false, message: 'יש לספק שלב מעקב' });
            return;
        }

        const view = await TrackingService.updateStage(token, stage, note);

        if (!view) {
            res.status(404).json({ success: false, message: 'לא נמצא מעקב עבור קישור זה' });
            return;
        }

        res.status(200).json({ success: true, data: view });
    } catch (error) {
        console.error('שגיאה בעדכון שלב מעקב:', error);
        const message = error instanceof Error ? error.message : 'אירעה שגיאה בעדכון שלב המעקב';
        const statusCode = message === 'שלב מעקב לא תקין' ? 400 : 500;
        res.status(statusCode).json({ success: false, message });
    }
};

export const updateTrackingLocation = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { lat, lng, address } = req.body;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            res.status(400).json({ success: false, message: 'יש לספק קואורדינטות lat/lng תקינות' });
            return;
        }

        const view = await TrackingService.updateLocation(token, lat, lng, address);

        if (!view) {
            res.status(404).json({ success: false, message: 'לא נמצא מעקב עבור קישור זה' });
            return;
        }

        res.status(200).json({ success: true, data: view });
    } catch (error) {
        console.error('שגיאה בעדכון מיקום מעקב:', error);
        res.status(500).json({ success: false, message: 'אירעה שגיאה בעדכון המיקום' });
    }
};
