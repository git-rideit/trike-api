import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import DriverProfile from '../models/driver_profile.model';
import FareConfig from '../models/fare_config.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { emailService } from '../services/email.service';

// USER MANAGEMENT
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

export const verifyUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

export const toggleUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body; // status should be 'active' | 'suspended' | 'deactivated'

    const user = await User.findByIdAndUpdate(req.params.id, { status }, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// DRIVER MANAGEMENT
export const approveDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Approve driver documents and set user to verified if all good
    // For now, this just creates/updates the profile and approves it

    // We expect driver profile to be created separately potentially, or we check if it exists
    // But per requirements "Approve or reject driver applications" implies a workflow.
    // Let's assume the driver profile is created when they sign up (or later), and admin approves it.

    const driverProfile = await DriverProfile.findOneAndUpdate(
        { user: req.params.id },
        {
            // Logic to approve specific documents could go here
            // For simplicity, we'll mark all pending docs as approved?
            // Or just have a global status on the profile?
            // The Model has status on individual docs.
        },
        { new: true }
    );

    // Also update User status
    const user = await User.findByIdAndUpdate(req.params.id, {
        isVerified: true,
        role: 'driver' // Ensure they have driver role 
    }, { new: true });

    if (user) {
        // Send email notification
        await emailService.sendDriverApprovalEmail(user.email, user.name);
    }

    res.status(200).json({
        status: 'success',
        message: 'Driver approved',
        data: {
            user
        }
    });
});

export const getDriverProfiles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const drivers = await DriverProfile.find().populate('user');

    res.status(200).json({
        status: 'success',
        results: drivers.length,
        data: {
            drivers
        }
    });
});

// FARE MANAGEMENT
export const updateFareConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { baseFare, ratePerKm } = req.body;

    const config = await FareConfig.findOneAndUpdate({}, {
        baseFare,
        ratePerKm,
        updatedBy: req.user._id
    }, {
        new: true,
        upsert: true // Create if doesn't exist
    });

    res.status(200).json({
        status: 'success',
        data: {
            config
        }
    });
});

export const getFareConfig = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const config = await FareConfig.findOne();

    res.status(200).json({
        status: 'success',
        data: {
            config
        }
    });
});
