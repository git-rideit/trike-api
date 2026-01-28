import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'booking' | 'system';
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['booking', 'system'], default: 'system' },
    isRead: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
