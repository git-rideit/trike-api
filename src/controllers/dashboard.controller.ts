import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import Booking from '../models/booking.model';
import Report from '../models/report.model';
import { catchAsync } from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Counts
    const studentCount = await User.countDocuments({ role: 'student' });
    const driverCount = await User.countDocuments({ role: 'driver' });
    const activeDrivers = await User.countDocuments({ role: 'driver', status: 'active' });

    // 2. Booking Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRides = await Booking.countDocuments({
        createdAt: { $gte: today },
        status: { $ne: 'cancelled' }
    });

    const activeBookings = await Booking.countDocuments({
        status: { $in: ['pending', 'accepted', 'in_progress'] }
    });

    // 3. Earnings (Total completed rides fare)
    const earningsAgg = await Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fare' } } }
    ]);
    const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    // 4. Incident Reports
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.status(200).json({
        status: 'success',
        data: {
            students: studentCount,
            drivers: {
                total: driverCount,
                active: activeDrivers
            },
            rides: {
                today: dailyRides,
                active: activeBookings
            },
            earnings: totalEarnings,
            pendingReports
        }
    });
});

export const getReports = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const reports = await Report.find().populate('reporter', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: reports.length,
        data: {
            reports
        }
    });
});

export const updateReportStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status, resolutionNotes } = req.body;

    const report = await Report.findByIdAndUpdate(req.params.id, {
        status,
        resolutionNotes
    }, { new: true });

    res.status(200).json({
        status: 'success',
        data: {
            report
        }
    });
});
