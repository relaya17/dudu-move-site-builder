import mongoose, { Document, Schema } from 'mongoose';

export type PrivacyRequestType = 'deletion' | 'export' | 'consent_withdraw';

export interface IPrivacyRequest extends Document {
    type: PrivacyRequestType;
    name: string;
    email?: string;
    phone: string;
    details?: string;
    status: 'received' | 'in_progress' | 'completed' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const PrivacyRequestSchema = new Schema<IPrivacyRequest>({
    type: { type: String, enum: ['deletion', 'export', 'consent_withdraw'], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    status: { type: String, enum: ['received', 'in_progress', 'completed', 'rejected'], default: 'received' },
}, { timestamps: true });

PrivacyRequestSchema.index({ phone: 1, createdAt: -1 });

export const PrivacyRequest = mongoose.model<IPrivacyRequest>('PrivacyRequest', PrivacyRequestSchema);
