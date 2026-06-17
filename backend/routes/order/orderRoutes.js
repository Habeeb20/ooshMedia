import express from 'express';
import { verifyToken, sellerOnly } from '../../middleware/verifyToken.js';

import {
  checkout, verifyPayment, paystackWebhook,
  verifyDeliveryCode, getBuyerOrders, getOrderById,
  getSellerOrders
} from '../../controllers/order/orderController.js';

const router = express.Router();

// Webhook (no auth — verified by Paystack signature)
router.post('/webhook', paystackWebhook);

router.use(verifyToken);
router.post('/checkout', checkout);
router.get('/verify-payment/:reference', verifyPayment);
router.post('/:orderId/verify-delivery', verifyDeliveryCode);
router.get('/my', getBuyerOrders);
router.get('/seller', sellerOnly, getSellerOrders);
router.post('/:orderId/verify-delivery', verifyDeliveryCode);
router.get('/:orderId', getOrderById);

export default router;
