import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    tenantId?: string;
    customerName: string;
    text: string;
    rating: number; // 1–5
    photoUrl?: string;
    reply?: string;
    repliedAt?: Date;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        tenantId: { type: String, index: true },
        customerName: { type: String, required: true, trim: true, maxlength: 80 },
        text: { type: String, required: true, trim: true, maxlength: 1000 },
        rating: { type: Number, required: true, min: 1, max: 5 },
        photoUrl: { type: String },
        reply: { type: String, maxlength: 1000 },
        repliedAt: { type: Date },
        approved: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
