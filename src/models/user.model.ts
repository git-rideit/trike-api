import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    role: 'user' | 'admin' | 'driver' | 'student';
    isVerified: boolean;
    status: 'active' | 'suspended' | 'deactivated' | 'pending';
    createdAt: Date;
    correctPassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        default: 'student',
        enum: ['user', 'admin', 'driver', 'student']
    },
    isVerified: { type: Boolean, default: false },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'suspended', 'deactivated', 'pending']
    },
    profilePicture: {
        type: String,
        default: ''
    },
    notificationPreferences: {
        pushNotifications: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false }
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true,
});

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password!, 12);
    next();
});

UserSchema.methods.correctPassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password!);
};

export default mongoose.model<IUser>('User', UserSchema);
