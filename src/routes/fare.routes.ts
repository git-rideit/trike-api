import express from 'express';
import * as bookingController from '../controllers/booking.controller';

const router = express.Router();

// GET /api/v1/fare/calculate?pickup=Barangay1&dropoff=Barangay2
router.get('/calculate', bookingController.calculateFare);

export default router;
