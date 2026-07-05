import { MoveEstimate, TRACKING_STAGES, TrackingStage } from '../database/models/MoveEstimate';

export class TrackingService {
    static isValidStage(stage: string): stage is TrackingStage {
        return (TRACKING_STAGES as readonly string[]).includes(stage);
    }

    static async getByToken(token: string) {
        const estimate = await MoveEstimate.findOne({ trackingToken: token });
        if (!estimate) {
            return null;
        }
        return TrackingService.toPublicView(estimate);
    }

    static async updateStage(token: string, stage: string, note?: string) {
        if (!TrackingService.isValidStage(stage)) {
            throw new Error('שלב מעקב לא תקין');
        }

        const estimate = await MoveEstimate.findOneAndUpdate(
            { trackingToken: token },
            {
                $set: { stage },
                $push: { stageHistory: { stage, at: new Date(), note } }
            },
            { new: true }
        );

        if (!estimate) {
            return null;
        }
        return TrackingService.toPublicView(estimate);
    }

    static async updateLocation(token: string, lat: number, lng: number, address?: string) {
        const estimate = await MoveEstimate.findOneAndUpdate(
            { trackingToken: token },
            { $set: { location: { lat, lng, address, updatedAt: new Date() } } },
            { new: true }
        );

        if (!estimate) {
            return null;
        }
        return TrackingService.toPublicView(estimate);
    }

    /**
     * מחזיר תצוגה ציבורית ומצומצמת של ההזמנה - ללא חשיפת מזהי מסד הנתונים הפנימיים.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static toPublicView(estimate: any) {
        return {
            trackingToken: estimate.trackingToken,
            name: estimate.name,
            apartmentType: estimate.apartmentType,
            preferredMoveDate: estimate.preferredMoveDate,
            currentAddress: estimate.currentAddress,
            destinationAddress: estimate.destinationAddress,
            status: estimate.status,
            stage: estimate.stage,
            stages: TRACKING_STAGES,
            stageHistory: estimate.stageHistory,
            location: estimate.location || null,
            reminderEmailSentAt: estimate.reminderEmailSentAt || null,
            reminderSmsSentAt: estimate.reminderSmsSentAt || null,
            createdAt: estimate.createdAt
        };
    }
}
