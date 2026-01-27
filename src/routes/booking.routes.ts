import express from 'express';
import * as bookingController from '../controllers/booking.controller';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);

// Admin / Driver routes
router.get('/', restrictTo('admin', 'driver'), bookingController.getAllBookings);
router.patch('/:id/status', restrictTo('admin', 'driver', 'user'), bookingController.updateBookingStatus); // User can cancel too? Logic in controller handles it?

// Specific restriction refinement can be done in controller or separate routes
// e.g. User can only cancel own booking. Controller logic needed for that security check.

export default router;
