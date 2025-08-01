import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
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
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ createdAt: -1 });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema); 