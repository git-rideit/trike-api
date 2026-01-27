import { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking.model';
import { FareService } from '../services/fare.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { pickupLocation, dropoffLocation, paymentMethod } = req.body;

    // Calculate Fare
    // Expect pickupLocation.barangay and dropoffLocation.barangay to be present for calculation
    // If not, we might need a fallback or error.
    let fare = 12;
    let distance = 0;

    if (pickupLocation.barangay && dropoffLocation.barangay) {
        const calculation = await FareService.calculateFare(pickupLocation.barangay, dropoffLocation.barangay);
        fare = calculation.fare;
        distance = calculation.distance;
    }

    const newBooking = await Booking.create({
        user: req.user._id,
        pickupLocation,
        dropoffLocation,
        fare,
        distance,
        paymentMethod,
        status: 'pending'
    });

    res.status(201).json({
        status: 'success',
        data: {
            booking: newBooking
        }
    });
});

export const getMyBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

export const getAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Admin only or Driver view available bookings?
    // Determine context or use filtering
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

export const updateBookingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body; // status: 'accepted', 'completed', 'cancelled'

    // If cancelling, might want reason
    const { cancellationReason } = req.body;

    const booking = await Booking.findByIdAndUpdate(req.params.id, {
        status,
        cancellationReason,
        ...(status === 'cancelled' ? { cancelledBy: req.user.role } : {})
    }, { new: true });

    if (!booking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            booking
        }
    });
});
