import express from 'express';
import {
  initiateVideoSubscription,
  verifyVideoSubscriptionPayment,
  getVideoSubscriptionStatus,
} from '../controllers/videoSubscriptionController.js';
import { verifyToken } from '../../middleware/verifyToken.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: VideoSubscription
 *   description: Paid video-upload credits (₦5000 for 10 videos, via Paystack)
 */

/**
 * @swagger
 * /api/rentals/video-subscription/initiate:
 *   post:
 *     summary: Start a Paystack payment for a batch of 10 video-upload credits
 *     tags: [VideoSubscription]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paystack authorization URL returned }
 */
router.post('/initiate', verifyToken, initiateVideoSubscription);

/**
 * @swagger
 * /api/rentals/video-subscription/verify/{reference}:
 *   get:
 *     summary: Verify payment and credit 10 video-upload slots to the user
 *     tags: [VideoSubscription]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Credits added }
 */
router.get('/verify/:reference', verifyVideoSubscriptionPayment);

/**
 * @swagger
 * /api/rentals/video-subscription/status:
 *   get:
 *     summary: Get the current user's remaining video-upload credits
 *     tags: [VideoSubscription]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current subscription status }
 */
router.get('/status', verifyToken, getVideoSubscriptionStatus);

export default router;