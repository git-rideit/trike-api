import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
    key: string; // e.g., 'maintenance_mode', 'privacy_policy', 'terms_of_service'
    value: any; // Can be boolean, string, object
    updatedBy: mongoose.Types.ObjectId;
}

const SystemSettingSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export default mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
