import { Request, Response, NextFunction } from 'express';
import SystemSetting from '../models/setting.model';
import AuditLog from '../models/audit_log.model';
import { catchAsync } from '../utils/catchAsync';

export const getSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const settings = await SystemSetting.find();
    res.status(200).json({
        status: 'success',
        results: settings.length,
        data: { settings }
    });
});

export const updateSetting = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { key, value } = req.body;

    const setting = await SystemSetting.findOneAndUpdate(
        { key },
        {
            value,
            updatedBy: req.user._id
        },
        { new: true, upsert: true }
    );

    // Log this action
    await AuditLog.create({
        user: req.user._id,
        action: 'UPDATE_SETTING',
        details: `Updated ${key} to ${JSON.stringify(value)}`,
        ipAddress: req.ip
    });

    res.status(200).json({
        status: 'success',
        data: { setting }
    });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const logs = await AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
    });
});

export const exportData = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Determine what to export based on query param ?type=users|bookings|drivers
    const { type } = req.query;

    // This is a stub for CSV export. In real app, use json2csv or similar.
    // Here we just return JSON that FE can convert, or a simple text response.

    let data;
    if (type === 'users') {
        data = await import('../models/user.model').then(m => m.default.find());
    } else if (type === 'bookings') {
        data = await import('../models/booking.model').then(m => m.default.find());
    } else {
        data = { message: 'Invalid type requested' };
    }

    // Log export
    await AuditLog.create({
        user: req.user._id,
        action: 'DATA_EXPORT',
        details: `Exported ${type}`,
        ipAddress: req.ip
    });

    res.status(200).json({
        status: 'success',
        data
    });
});
