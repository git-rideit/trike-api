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
    cancellationReason: { type: String }
}, {
    timestamps: true
});

BookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

export default mongoose.model<IBooking>('Booking', BookingSchema);
