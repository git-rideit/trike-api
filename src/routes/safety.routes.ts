import express from 'express';
import * as safetyController from '../controllers/safety.controller';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /safety/sos:
 *   post:
 *     summary: Trigger SOS alert
 *     tags: [Safety]
 *     responses:
 *       200:
 *         description: Alert sent
 */
router.post('/sos', safetyController.triggerSOS);

/**
 * @swagger
 * /safety/review:
 *   post:
 *     summary: Submit a review for a completed booking
 *     tags: [Safety]
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/review', safetyController.submitReview);

export default router;
