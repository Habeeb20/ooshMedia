import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';

import { getAdPlans,initiateAdPayment, verifyAdPayment,
  paystackWebhook, getMySubscriptions, cancelSubscription,
  getActiveAds, trackAdClick, getSubscriptionStats } from '../controllers/adController.js';

const router = express.Router();

router.get('/plans', getAdPlans);
router.get('/active', getActiveAds);
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), paystackWebhook);

router.use(verifyToken);
router.post('/subscribe', initiateAdPayment);
router.get('/verify', verifyAdPayment);
router.get('/my-subscriptions', getMySubscriptions);
router.get('/stats', getSubscriptionStats);
router.patch('/:id/cancel', cancelSubscription);
router.post('/:id/click', trackAdClick);

export default router;