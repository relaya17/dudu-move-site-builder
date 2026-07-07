import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
    // חשבון העסק (tenant) - ר' MoveEstimate.ts להסבר מלא. שים לב: email כבר
    // אינו ייחודי גלובלית (זה היה שובר בין דיירים שונים) - הייחודיות עברה
    // לצירוף (tenantId, email), ר' האינדקס בתחתית הקובץ.
    tenantId?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
    totalMoves: number;
    totalSpent: number;
    lastMoveDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        index: true
    },
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
    address: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    totalMoves: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    lastMoveDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for better query performance
// הייחודיות עכשיו על הצירוף (tenantId, email) - כך ששני דיירים שונים יכולים
// לכל אחד להיות לקוח עם אותה כתובת מייל, בלי להתנגש (unique: true על email
// לבד היה שובר את זה ברגע שיש יותר מדייר אחד באוסף המשותף).
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ createdAt: -1 });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema); 