import { Request, Response, NextFunction } from 'express';
import DriverProfile from '../models/driver_profile.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

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
