// routes/videoSubscriptionRoutes.js
import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { getVideoSubscriptionStatus, initiateVideoSubscriptionPayment,
  verifyVideoSubscriptionPayment,
  paystackWebhook, } from '../../controllers/videoSubscriptionController.js';


const router = express.Router();

router.get('/status', verifyToken, getVideoSubscriptionStatus);
router.post('/initiate', verifyToken, initiateVideoSubscriptionPayment);
router.get('/verify', verifyToken, verifyVideoSubscriptionPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), paystackWebhook); // no `verifyToken`

export default router;