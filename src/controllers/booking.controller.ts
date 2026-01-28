import { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking.model';
import DriverProfile from '../models/driver_profile.model';
import { FareService } from '../services/fare.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const calculateFare = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { pickup, dropoff } = req.body;
    const calculation = await FareService.calculateFare(pickup, dropoff);

    res.status(200).json({
        status: 'success',
        data: calculation
    });
});

export const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { pickupLocation, dropoffLocation, paymentMethod, fare, distance } = req.body;

    // Calculate Fare
    // Expect pickupLocation.barangay and dropoffLocation.barangay to be present for calculation
    // If not, we might need a fallback or error.
    // If fare/distance not provided by frontend (should be), recalculate
    let finalFare = fare;
    let finalDistance = distance;

    if (!finalFare || !finalDistance) {
        if (pickupLocation.barangay && dropoffLocation.barangay) {
            const calculation = await FareService.calculateFare(pickupLocation.barangay, dropoffLocation.barangay);
            finalFare = calculation.fare;
            finalDistance = calculation.distance;
        } else {
            // Fallback default
            finalFare = 12;
            finalDistance = 0;
        }
    }

    const newBooking = await Booking.create({
        user: req.user._id,
        pickupLocation,
        dropoffLocation,
        fare: finalFare,
        distance: finalDistance,
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
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

export const getAvailableBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // For Polling: Drivers look for pending bookings nearby
    // In a real app, use maxDistance. For now, just return all pending.

    // Optional: Filter by vicinity if coords are passed
    // const { lat, lng } = req.query;

    const bookings = await Booking.find({ status: 'pending' }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});

export const getNearbyDrivers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return next(new AppError('Please provide lat and lng', 400));
    }

    const drivers = await DriverProfile.find({
        isOnline: true,
        currentLocation: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
                },
                $maxDistance: 5000 // 5km radius
            }
        }
    }).select('user currentLocation tricyclePlateNumber');

    res.status(200).json({
        status: 'success',
        results: drivers.length,
        data: {
            drivers
        }
    });
});

export const updateBookingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body; // status: 'accepted', 'completed', 'cancelled'

    // If cancelling, might want reason
    const { cancellationReason } = req.body;

    // Logic for State Transitions
    // 1. Accept: Assign driver
    if (status === 'accepted') {
        if (!req.user || req.user.role !== 'driver') {
            return next(new AppError('Only drivers can accept bookings', 403));
        }
        // Check if already taken
        const existing = await Booking.findById(req.params.id);
        if (!existing) return next(new AppError('Booking not found', 404));
        if (existing.status !== 'pending') {
            return next(new AppError('Booking is no longer pending', 400));
        }

        // Update
        const booking = await Booking.findByIdAndUpdate(req.params.id, {
            status: 'accepted',
            driver: req.user._id
        }, { new: true });

        return res.status(200).json({ status: 'success', data: { booking } });
    }

    // 2. Arrived / In Progress / Completed
    // Ensure the updating user is the assigned driver
    if (['arrived', 'in_progress', 'completed'].includes(status)) {
        const existing = await Booking.findById(req.params.id);
        if (!existing) return next(new AppError('Booking not found', 404));

        // Cast to string for comparison
        if (existing.driver?.toString() !== req.user._id.toString()) {
            return next(new AppError('You are not the assigned driver', 403));
        }
    }

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

export const markAsPaid = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Check if booking exists
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return next(new AppError('No booking found with that ID', 404));
    }

    // Authorization: Who can mark as paid?
    // Driver: "I received cash"
    // User: "I paid via GCash" (In real app, verified via callback)
    // For now, allow both to mark as paid
    if (booking.driver?.toString() !== req.user._id.toString() && booking.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to access this booking', 403));
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(200).json({
        status: 'success',
        data: {
            booking
        }
    });
});
