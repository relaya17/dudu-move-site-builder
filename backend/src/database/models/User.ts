import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'owner' | 'manager' | 'driver';

/**
 * עובד/מנהל/נהג השייך לחשבון עסק (Business).
 * ה-owner עצמו נמצא ב-Business.ownerEmail; כאן יושבים העובדים הנוספים.
 */
export interface IUser extends Document {
    businessId: mongoose.Types.ObjectId;  // מצביע ל-Business._id
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'manager', 'driver'], default: 'manager' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
}, { timestamps: true });

// אימייל ייחודי בתוך אותו עסק
UserSchema.index({ businessId: 1, email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
