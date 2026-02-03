import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverProfile extends Document {
    user: mongoose.Types.ObjectId;
    licenseNumber: string;
    licenseExpiry: Date;
    tricyclePlateNumber: string;
    documents: {
        type: string;
        url: string;
        status: 'pending' | 'approved' | 'rejected';
    }[];
    isOnline: boolean;
    currentLocation?: {
        type: string;
        coordinates: number[];
    };
    violationCount: number;
}

const DriverProfileSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    tricyclePlateNumber: { type: String, required: true },
    documents: [{
        type: { type: String, required: true },
        url: { type: String, required: true },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'approved', 'rejected']
        }
    }],
    isOnline: { type: Boolean, default: false },
    currentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    violationCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

DriverProfileSchema.set('toJSON', {
    transform: (doc, ret: any) => {
        if (ret.currentLocation && Array.isArray(ret.currentLocation.coordinates)) {
            const [lng, lat] = ret.currentLocation.coordinates;
            ret.currentLocation.coordinates = { lat, lng };
        }
        return ret;
    }
});

// Index for geospatial queries
DriverProfileSchema.index({ currentLocation: '2dsphere' });

export default mongoose.model<IDriverProfile>('DriverProfile', DriverProfileSchema);
