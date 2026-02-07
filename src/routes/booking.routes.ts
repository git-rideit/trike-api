import express from 'express';
import * as bookingController from '../controllers/booking.controller';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/fare', bookingController.calculateFare); // Calculation can be public or protected? Protected for now.
router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.get('/export', bookingController.exportBookings);
router.get('/nearby-drivers', bookingController.getNearbyDrivers);

// Admin / Driver routes
router.get('/available', restrictTo('driver', 'admin'), bookingController.getAvailableBookings);
router.get('/:id', bookingController.getBookingById);
router.get('/', restrictTo('admin'), bookingController.getAllBookings);
router.patch('/:id/status', restrictTo('admin', 'driver', 'user'), bookingController.updateBookingStatus);
router.patch('/:id/pay', restrictTo('admin', 'driver', 'user'), bookingController.markAsPaid);
router.post('/:id/rate', restrictTo('user'), bookingController.rateBooking);

// Specific restriction refinement can be done in controller or separate routes
// e.g. User can only cancel own booking. Controller logic needed for that security check.

export default router;
