import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentProfile extends Document {
    user: mongoose.Types.ObjectId;
    studentId: string;
    course: string;
    year: string;
    birthDate: Date;
    address: {
        province: string;
        municipality: string;
        barangay: string;
        purok?: string;
    };
    contactNumber: string;
    emergencyContact: {
        name: string;
        relationship: string;
        contactNumber: string;
    };
    schoolIdPhoto: string;
    isVerified: boolean;
}

const StudentProfileSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    course: { type: String, required: true },
    year: { type: String, required: true },
    birthDate: { type: Date, required: true },
    address: {
        province: { type: String, required: true },
        municipality: { type: String, required: true },
        barangay: { type: String, required: true },
        purok: { type: String }
    },
    contactNumber: { type: String, required: true },
    emergencyContact: {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        contactNumber: { type: String, required: true }
    },
    schoolIdPhoto: { type: String, required: true }, // URL to uploaded image
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
