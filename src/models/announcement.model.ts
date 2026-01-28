import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    message: string;
    target: 'all' | 'student' | 'driver';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    target: { type: String, enum: ['all', 'student', 'driver'], default: 'all' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
