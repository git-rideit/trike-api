import { Request, Response, NextFunction } from 'express';
import Booking from '../models/booking.model';
import DriverProfile from '../models/driver_profile.model';
import Notification from '../models/notification.model'; // NEW
import { Parser } from 'json2csv'; // NEW
import FareConfig from '../models/fare_config.model'; // NEW
import { FareService } from '../services/fare.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

export const calculateFare = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Support both POST body and GET query params
    const params = req.method === 'GET' ? req.query : req.body;
    const { pickup, dropoff, distance } = params;

    let calculation;

    // Get config for fare calculation
    const config = await FareConfig.findOne().sort({ createdAt: -1 });
    const baseFare = config ? config.baseFare : 12;
    const ratePerKm = config ? config.ratePerKm : 2;

    // If distance is provided directly, use it
    if (distance !== undefined) {
        const dist = parseFloat(distance as string);
        if (isNaN(dist) || dist < 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid distance parameter'
            });
        }

        const fare = baseFare + (dist * ratePerKm);
        calculation = {
            calculatedFare: Math.ceil(fare),
            baseFare,
            ratePerKm,
            distance: dist
        };
    } else if (pickup && dropoff) {
        // Use barangay-based calculation
        const result = await FareService.calculateFare(pickup as string, dropoff as string);
        calculation = {
            calculatedFare: result.fare,
            baseFare,
            ratePerKm,
            distance: result.distance
        };
    } else {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide either distance or both pickup and dropoff locations'
        });
    }

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

        if (!booking) {
            return next(new AppError('Booking could not be updated', 500));
        }

        // Create Notification for Student
        await Notification.create({
            user: booking.user,
            title: 'Ride Accepted',
            message: 'A driver has accepted your ride request.',
            type: 'booking'
        });

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

    // Create Notification
    const recipient = req.user.role === 'driver' ? booking.user : booking.driver;
    // Only send if recipient exists (e.g. if driver cancels, tell user. If user cancels, tell driver?)
    // Actually booking.driver might be null if cancelled before acceptance, but here we are in "assigned driver" block usually.
    if (recipient) {
        await Notification.create({
            user: recipient,
            title: `Ride Update: ${status}`,
            message: `Your ride status has been updated to ${status}.`,
            type: 'booking'
        });
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

export const exportBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get bookings
    const bookings = await Booking.find({
        $or: [{ driver: req.user._id }, { user: req.user._id }],
        status: 'completed'
    }).populate('driver user');

    if (bookings.length === 0) {
        return next(new AppError('No completed bookings found to export', 404));
    }

    // 2. Define fields
    const fields = ['_id', 'pickupLocation.name', 'dropoffLocation.name', 'fare', 'status', 'createdAt'];
    const opts = { fields };

    // 3. Convert to CSV
    try {
        const parser = new Parser(opts);
        const csv = parser.parse(bookings);

        // 4. Send File
        res.header('Content-Type', 'text/csv');
        res.attachment('ride_history.csv');
        return res.send(csv);
    } catch (err) {
        return next(new AppError('Error generating CSV', 500));
    }
});
