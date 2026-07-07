import mongoose, { Document, Schema } from 'mongoose';
import {
    TRACKING_STAGES,
    TrackingStage,
    StageHistoryEntry,
    TrackingLocation,
    EstimateStatus,
    ESTIMATE_STATUSES,
    FurnitureItem,
    QuoteDocumentInfo,
    InvoiceDocumentInfo
} from 'shared';

// מקור האמת לשלבי המעקב ולסטטוסים מוגדר בחבילת shared (נצרך גם ב-frontend).
export { TRACKING_STAGES, TrackingStage, ESTIMATE_STATUSES };

export type IStageHistoryEntry = StageHistoryEntry<Date>;
export type ITrackingLocation = TrackingLocation<Date>;
export type IQuoteDocumentInfo = QuoteDocumentInfo<Date>;
export type IInvoiceDocumentInfo = InvoiceDocumentInfo<Date>;

export interface IMoveEstimate extends Document {
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
    inventory: Array<Required<Omit<FurnitureItem, 'description' | 'comments'>> & Pick<FurnitureItem, 'description' | 'comments'>>;
    totalPrice: number;
    status: EstimateStatus;
    // --- מעקב הובלה ---
    trackingToken: string;
    stage: TrackingStage;
    stageHistory: IStageHistoryEntry[];
    location?: ITrackingLocation;
    reminderEmailSentAt?: Date;
    reminderSmsSentAt?: Date;
    // --- מסמכי חשבונאות ---
    quote?: IQuoteDocumentInfo;
    invoice?: IInvoiceDocumentInfo;
    createdAt: Date;
    updatedAt: Date;
}

const MoveEstimateSchema = new Schema<IMoveEstimate>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    apartmentType: {
        type: String,
        required: true,
        enum: ['1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5+']
    },
    preferredMoveDate: {
        type: String,
        required: true
    },
    currentAddress: {
        type: String,
        required: true,
        trim: true
    },
    destinationAddress: {
        type: String,
        required: true,
        trim: true
    },
    additionalNotes: {
        type: String,
        trim: true
    },
    originFloor: {
        type: Number,
        default: 0,
        min: 0
    },
    destinationFloor: {
        type: Number,
        default: 0,
        min: 0
    },
    originHasElevator: {
        type: Boolean,
        default: false
    },
    destinationHasElevator: {
        type: Boolean,
        default: false
    },
    originHasCrane: {
        type: Boolean,
        default: false
    },
    destinationHasCrane: {
        type: Boolean,
        default: false
    },
    inventory: [{
        type: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        description: String,
        isFragile: {
            type: Boolean,
            default: false
        },
        needsDisassemble: {
            type: Boolean,
            default: false
        },
        needsReassemble: {
            type: Boolean,
            default: false
        },
        needsDoorRemoval: {
            type: Boolean,
            default: false
        },
        comments: String
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ESTIMATE_STATUSES,
        default: 'pending'
    },
    // --- מעקב הובלה ---
    // unique: true כבר יוצר אינדקס - אין צורך גם ב-index: true (זה בדיוק מה שגרם
    // לאזהרת "Duplicate schema index" של Mongoose).
    trackingToken: {
        type: String,
        unique: true,
        sparse: true
    },
    stage: {
        type: String,
        enum: TRACKING_STAGES,
        default: 'order_placed'
    },
    stageHistory: [{
        stage: {
            type: String,
            enum: TRACKING_STAGES,
            required: true
        },
        at: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    location: {
        lat: Number,
        lng: Number,
        address: String,
        updatedAt: Date
    },
    reminderEmailSentAt: Date,
    reminderSmsSentAt: Date,
    // --- מסמכי חשבונאות ---
    // הצעת מחיר: מסמך לא-פיסקלי, מופק ומאוחסן מקומית בלבד.
    quote: {
        quoteNumber: String,
        generatedAt: Date
    },
    // חשבונית/קבלה: מסמך מס מוסדר - מופק אך ורק דרך ספק חשבוניות מורשה חיצוני (ר' shared/src/billing.ts).
    invoice: {
        docType: {
            type: String,
            enum: ['invoice_receipt', 'invoice', 'receipt']
        },
        providerId: String,
        documentNumber: String,
        allocationNumber: String,
        documentUrl: String,
        issuedAt: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
MoveEstimateSchema.index({ email: 1 });
MoveEstimateSchema.index({ phone: 1 });
MoveEstimateSchema.index({ status: 1 });
MoveEstimateSchema.index({ createdAt: -1 });
// נדרש ל-ReminderCronService שמריץ שאילתה יומית לפי תאריך הובלה מועדף.
MoveEstimateSchema.index({ preferredMoveDate: 1 });

export const MoveEstimate = mongoose.model<IMoveEstimate>('MoveEstimate', MoveEstimateSchema);
