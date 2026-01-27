import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../services/cloudinary.service';
import User from '../models/user.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});

export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { user: newUser },
    });
});

export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

export const updateProfilePicture = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next(new AppError('Please upload a file', 400));
    }

    // Process upload
    const result = await uploadToCloudinary(req.file.buffer, 'trike-users');

    // Update user
    const user = await User.findByIdAndUpdate(
        (req as any).user.id,
        { profilePicture: result.secure_url },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});
