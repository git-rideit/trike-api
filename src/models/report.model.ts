import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedUser?: mongoose.Types.ObjectId; // Optional if not reporting a specific user
    type: 'complaint' | 'incident' | 'emergency_alert';
    category: string; // e.g. 'rude_behavior', 'unsafe_driving', 'accident', 'theft'
    description: string;
    location?: {
        type: string;
        coordinates: number[];
    };
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    evidence?: string[]; // URLs
    resolutionNotes?: string;
    createdAt: Date;
}

const ReportSchema: Schema = new Schema({
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        required: true,
        enum: ['complaint', 'incident', 'emergency_alert']
    },
    category: { type: String, required: true },
    description: { type: String },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number] }
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'investigating', 'resolved', 'dismissed']
    },
    evidence: [{ type: String }],
    resolutionNotes: { type: String }
}, {
    timestamps: true
});

ReportSchema.set('toJSON', {
    transform: (doc, ret: any) => {
        if (ret.location && Array.isArray(ret.location.coordinates)) {
            const [lng, lat] = ret.location.coordinates;
            ret.location.coordinates = { lat, lng };
        }
        return ret;
    }
});

ReportSchema.index({ location: '2dsphere' });

export default mongoose.model<IReport>('Report', ReportSchema);
