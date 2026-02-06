import { Request, Response, NextFunction } from 'express';
import DriverProfile from '../models/driver_profile.model';
import Booking from '../models/booking.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { contactNumber, address, age } = req.body;
    // Note: To update user fields like name, we would need to update the User model as well.
    // For now, let's allow updating Driver specific fields.

    const driver = await DriverProfile.findOneAndUpdate(
        { user: req.user._id },
        {
            contactNumber,
            address,
            age
        },
        { new: true, runValidators: true }
    );

    if (!driver) {
        return next(new AppError('Driver profile not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            driver
        }
    });
});

export const updateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return next(new AppError('Please provide latitude and longitude', 400));
    }

    // Assuming req.user.id is the User ID. DriverProfile is linked via 'user' field.
    const driver = await DriverProfile.findOneAndUpdate(
        { user: req.user._id },
        {
            currentLocation: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON expects [lng, lat]
            }
        },
        { new: true }
    );

    if (!driver) {
        return next(new AppError('Driver profile not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            location: driver.currentLocation
        }
    });
});

export const updateStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { isOnline } = req.body;

    const driver = await DriverProfile.findOneAndUpdate(
        { user: req.user._id },
        { isOnline },
        { new: true }
    );

    if (!driver) {
        return next(new AppError('Driver profile not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            isOnline: driver.isOnline
        }
    });
});

export const getDriver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const driver = await DriverProfile.findById(req.params.id).populate('user');

    if (!driver) {
        return next(new AppError('Driver not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            driver
        }
    });
});

export const getDriverStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Aggregation for Total Earnings and Trip Count
    const stats = await Booking.aggregate([
        {
            $match: {
                driver: req.user._id,
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: '$fare' },
                tripCount: { $sum: 1 }
            }
        }
    ]);

    const recentTrips = await Booking.find({
        driver: req.user._id,
        status: 'completed'
    })
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json({
        status: 'success',
        data: {
            totalEarnings: stats.length > 0 ? stats[0].totalEarnings : 0,
            tripCount: stats.length > 0 ? stats[0].tripCount : 0,
            recentTrips
        }
    });
});

export const getEarningsHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Group by Date (Daily)
    const history = await Booking.aggregate([
        {
            $match: {
                driver: req.user._id,
                status: 'completed'
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                dailyEarnings: { $sum: '$fare' },
                tripCount: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            history
        }
    });
});
