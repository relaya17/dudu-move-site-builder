import { EstimateStatus } from './estimateStatus';
import { TrackingStage, StageHistoryEntry, TrackingLocation } from './tracking';
import { FurnitureItem } from './furniture';
import { QuoteDocumentInfo, InvoiceDocumentInfo } from './billing';

/**
 * צורת ה-JSON ("על-החוט") של בקשת הערכת מחיר, כפי שהיא מוחזרת מנתיבי ה-API
 * (/api/mongo/estimates, /api/move-requests) ונצרכת ב-frontend.
 * תואם במדויק למבנה השטוח שמוחזר מ-Mongoose (IMoveEstimate) לאחר סריאליזציה ל-JSON.
 */
export interface MoveEstimateDTO {
    _id: string;
    name: string;
    email: string;
    phone: string;
    apartmentType: string;
    preferredMoveDate: string;
    currentAddress: string;
    destinationAddress: string;
    additionalNotes?: string;
    originFloor: number;
    destinationFloor: number;
    originHasElevator: boolean;
    destinationHasElevator: boolean;
    originHasCrane: boolean;
    destinationHasCrane: boolean;
    inventory: FurnitureItem[];
    totalPrice: number;
    status: EstimateStatus;
    trackingToken: string;
    stage: TrackingStage;
    stageHistory: StageHistoryEntry[];
    location?: TrackingLocation;
    reminderEmailSentAt?: string;
    reminderSmsSentAt?: string;
    quote?: QuoteDocumentInfo;
    invoice?: InvoiceDocumentInfo;
    createdAt: string;
    updatedAt: string;
}
