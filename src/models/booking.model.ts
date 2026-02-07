import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    user: mongoose.Types.ObjectId;
    driver?: mongoose.Types.ObjectId;
    pickupLocation: {
        address: string;
        coordinates: number[]; // [lng, lat]
    };
    dropoffLocation: {
        address: string;
        coordinates: number[]; // [lng, lat]
    };
    fare: number;
    distance: number;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'gcash' | 'paymaya';
    paymentStatus: 'pending' | 'paid';
    cancelledBy?: 'user' | 'driver' | 'admin';
    cancellationReason?: string;
    rating?: number;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User' }, // Driver acts as User in auth but has DriverProfile
    pickupLocation: {
        address: { type: String, required: true },
        barangay: { type: String }, // Optional, for fare lookup
        coordinates: { type: [Number], required: true }
    },
    dropoffLocation: {
        address: { type: String, required: true },
        barangay: { type: String }, // Optional, for fare lookup
        coordinates: { type: [Number], required: true }
    },
    fare: { type: Number, required: true },
    distance: { type: Number, required: true }, // in km
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'gcash', 'paymaya']
    },
    paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'paid']
    },
    cancelledBy: { type: String, enum: ['user', 'driver', 'admin'] },
    cancellationReason: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String }
}, {
    timestamps: true
});

BookingSchema.set('toJSON', {
    transform: (doc, ret: any) => {
        if (ret.pickupLocation && Array.isArray(ret.pickupLocation.coordinates)) {
            const [lng, lat] = ret.pickupLocation.coordinates;
            ret.pickupLocation.coordinates = { lat, lng };
        }
        if (ret.dropoffLocation && Array.isArray(ret.dropoffLocation.coordinates)) {
            const [lng, lat] = ret.dropoffLocation.coordinates;
            ret.dropoffLocation.coordinates = { lat, lng };
        }
        return ret;
    }
});

BookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

export default mongoose.model<IBooking>('Booking', BookingSchema);
