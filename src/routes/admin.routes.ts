import express from 'express';
import * as adminController from '../controllers/admin.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import * as settingController from '../controllers/setting.controller';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
// Restrict to admin
router.use(restrictTo('admin'));

router.get('/dashboard', dashboardController.getDashboardStats);
router.get('/reports', dashboardController.getReports);
router.patch('/reports/:id', dashboardController.updateReportStatus);

router.get('/settings', settingController.getSettings);
router.patch('/settings', settingController.updateSetting);
router.get('/audit-logs', settingController.getAuditLogs);
router.get('/export', settingController.exportData);

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/verify', adminController.verifyUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);

router.get('/drivers', adminController.getDriverProfiles);
router.patch('/drivers/:id/approve', adminController.approveDriver);

router.get('/fare-config', adminController.getFareConfig);
router.patch('/fare-config', adminController.updateFareConfig);

export default router;
