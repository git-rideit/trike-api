import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { emailService } from '../services/email.service';
import { env } from '../config/env';
import User from '../models/user.model';
import StudentProfile from '../models/student_profile.model';
import DriverProfile from '../models/driver_profile.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const signToken = (id: string) => {
    return jwt.sign({ id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
    });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
    const token = signToken(user._id);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        data: {
            user,
            token,
        },
    });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
    });

    createSendToken(newUser, 201, res);
});

export const registerStudent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Create User
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'student',
        isVerified: false // Requires additional verification if needed
    });

    // 2. Create Student Profile
    const newProfile = await StudentProfile.create({
        user: newUser._id,
        studentId: req.body.studentId,
        course: req.body.course,
        year: req.body.year,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber,
        emergencyContact: req.body.emergencyContact,
        schoolIdPhoto: req.body.schoolIdPhoto
    });

    // 3. Send Token
    createSendToken(newUser, 201, res);
});

export const registerDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Create User
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'driver',
        status: 'pending', // Driver requires approval
        isVerified: false
    });

    // 2. Create Driver Profile
    const newProfile = await DriverProfile.create({
        user: newUser._id,
        licenseNumber: req.body.licenseNumber,
        licenseExpiry: req.body.licenseExpiry,
        tricyclePlateNumber: req.body.tricyclePlateNumber,
        documents: req.body.documents // Array of { type, url }
    });

    // 3. Send Token
    createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Convert to object to attach profile
    const userObj = user.toObject();

    if (user.role === 'driver') {
        const driverProfile = await DriverProfile.findOne({ user: user._id });
        if (driverProfile) {
            (userObj as any).driverProfile = driverProfile;
        }
    } else if (user.role === 'student') {
        const studentProfile = await StudentProfile.findOne({ user: user._id });
        if (studentProfile) {
            (userObj as any).studentProfile = studentProfile;
        }
    }

    createSendToken(userObj, 200, res);
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) return next(new AppError('Please provide email', 400));

    const user = await User.findOne({ email });
    if (!user) return next(new AppError('No user found with that email', 404));

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

    // Send email (best effort)
    await emailService.sendPasswordResetEmail(user.email, (user as any).name || 'User', resetUrl);

    res.status(200).json({ status: 'success', message: 'Password reset token sent', data: { resetToken } });
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;
    if (!token || !password) return next(new AppError('Token and new password are required', 400));

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Token is invalid or has expired', 400));

    user.password = password;
    user.resetPasswordToken = undefined as any;
    user.resetPasswordExpires = undefined as any;
    await user.save();

    // Log the user in after resetting password
    createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    // The user is already attached to req.user by the protect middleware
    const user = await User.findById((req as any).user.id).select('+password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2) Check if current password is correct
    if (!(await user.correctPassword(req.body.currentPassword))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) Update password
    user.password = req.body.newPassword;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});
