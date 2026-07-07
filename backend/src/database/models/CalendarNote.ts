import mongoose, { Document, Schema } from 'mongoose';

// הערה חופשית שהנהלה יכולה לרשום על יום מסוים בלוח השנה (לא קשורה בהכרח להובלה קיימת) -
// למשל תזכורת לחזור ללקוח, הזמנת רכב/צוות, וכו'.
export interface ICalendarNote extends Document {
    date: string; // YYYY-MM-DD
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const CalendarNoteSchema = new Schema<ICalendarNote>({
    date: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{4}-\d{2}-\d{2}$/
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

CalendarNoteSchema.index({ date: 1 });

export const CalendarNote = mongoose.model<ICalendarNote>('CalendarNote', CalendarNoteSchema);
