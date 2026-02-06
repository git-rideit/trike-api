import express from 'express';
import * as driverController from '../controllers/driver.controller';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

// Driver only routes
router.patch('/profile', restrictTo('driver'), driverController.updateProfile);
router.patch('/location', restrictTo('driver'), driverController.updateLocation);
router.patch('/status', restrictTo('driver'), driverController.updateStatus);
router.get('/stats', restrictTo('driver'), driverController.getDriverStats);
router.get('/earnings-history', restrictTo('driver'), driverController.getEarningsHistory);

// Public / User routes (or restricted as needed)
router.get('/:id', driverController.getDriver);

export default router;
