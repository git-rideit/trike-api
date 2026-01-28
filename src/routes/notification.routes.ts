import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

// Notifications
router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);

// Announcements (Users view)
router.get('/announcements', notificationController.getAnnouncements);

// Announcements (Admin create)
router.post('/announcements', restrictTo('admin'), notificationController.createAnnouncement);

export default router;
