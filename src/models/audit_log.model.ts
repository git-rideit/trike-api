import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    user: mongoose.Types.ObjectId;
    action: string; // e.g., 'UPDATE_FARE', 'SUSPEND_DRIVER'
    details: string; // Description or JSON string
    ipAddress?: string;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
