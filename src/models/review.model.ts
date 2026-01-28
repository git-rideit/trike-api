import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    booking: mongoose.Types.ObjectId;
    driver: mongoose.Types.ObjectId;
    passenger: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
}

const ReviewSchema: Schema = new Schema({
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IReview>('Review', ReviewSchema);
