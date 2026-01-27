import mongoose, { Schema, Document } from 'mongoose';

export interface IFareConfig extends Document {
    baseFare: number;
    ratePerKm: number; // For distances beyond base
    updatedBy: mongoose.Types.ObjectId;
}

const FareConfigSchema: Schema = new Schema({
    baseFare: { type: Number, required: true, default: 12 },
    ratePerKm: { type: Number, required: true, default: 2 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.model<IFareConfig>('FareConfig', FareConfigSchema);
