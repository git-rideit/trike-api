import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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

    createSendToken(user, 200, res);
});
