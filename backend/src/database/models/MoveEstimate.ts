import mongoose, { Document, Schema } from 'mongoose';

// שלבי המעקב אחרי ההובלה, לפי סדר כרונולוגי
export const TRACKING_STAGES = [
    'order_placed',        // ההזמנה התקבלה
    'confirmed',           // ההזמנה אושרה
    'packing_disassembly', // פירוק ואריזה
    'in_transit',          // בדרך ליעד
    'unloading_assembly',  // פריקה והרכבה
    'completed'            // ההובלה הושלמה
] as const;

export type TrackingStage = typeof TRACKING_STAGES[number];

export interface IStageHistoryEntry {
    stage: TrackingStage;
    at: Date;
    note?: string;
}

export interface ITrackingLocation {
    lat: number;
    lng: number;
    address?: string;
    updatedAt: Date;
}

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
    inventory: Array<{
        type: string;
        quantity: number;
        description?: string;
        isFragile: boolean;
        needsDisassemble: boolean;
        needsReassemble: boolean;
        comments?: string;
    }>;
    totalPrice: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    // --- מעקב הובלה ---
    trackingToken: string;
    stage: TrackingStage;
    stageHistory: IStageHistoryEntry[];
    location?: ITrackingLocation;
    reminderEmailSentAt?: Date;
    reminderSmsSentAt?: Date;
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
        comments: String
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    // --- מעקב הובלה ---
    trackingToken: {
        type: String,
        unique: true,
        sparse: true,
        index: true
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
    reminderSmsSentAt: Date
}, {
    timestamps: true
});

// Indexes for better query performance
MoveEstimateSchema.index({ email: 1 });
MoveEstimateSchema.index({ phone: 1 });
MoveEstimateSchema.index({ status: 1 });
MoveEstimateSchema.index({ createdAt: -1 });

export const MoveEstimate = mongoose.model<IMoveEstimate>('MoveEstimate', MoveEstimateSchema);
