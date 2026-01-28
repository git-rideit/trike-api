import { Request, Response, NextFunction } from 'express';
import Notification from '../models/notification.model';
import Announcement from '../models/announcement.model';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

// Notifications
export const getMyNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: {
            notifications
        }
    });
});

export const markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            notification
        }
    });
});

// Announcements
export const createAnnouncement = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, message, target } = req.body;

    const announcement = await Announcement.create({
        title,
        message,
        target,
        createdBy: req.user._id
    });

    // Optional: Fan-out to Notifications collection if we want them to show up in the individual feed
    // For now, we assume the frontend fetches Announcements separately or we do a simple check.

    res.status(201).json({
        status: 'success',
        data: {
            announcement
        }
    });
});

export const getAnnouncements = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Filter announcements relevant to the user
    // If user is 'student', get 'all' or 'student'
    const query = {
        target: { $in: ['all', req.user.role] }
    };

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: announcements.length,
        data: {
            announcements
        }
    });
});
