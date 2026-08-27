import express from 'express';
import {   getSellersFeeStatus,
  toggleBlockSeller,
  getSellerPaymentHistory,
  initializeFeePayment,
  verifyFeePayment, } from '../controllers/platformfeeController.js';
import { verifyToken, isAdmin } from '../middleware/verifyToken.js';

const router = express.Router();

// ==================== SELLER ROUTES ====================

// Initiate Paystack fee payment from seller dashboard
router.post('/pay-fee/init', verifyToken, initializeFeePayment);

// Verify payment and deduct debt from seller profile
router.post('/pay-fee/verify', verifyToken, verifyFeePayment);


// ==================== ADMIN ROUTES ====================

// Get all sellers with fee status, duration, and overdue alerts
router.get('/platform-fees', verifyToken, getSellersFeeStatus);

// Block or Unblock a seller
router.put('/:sellerId/toggle-block', verifyToken, isAdmin, toggleBlockSeller);

// View payment history logs for a specific seller
router.get('/:sellerId/payment-history', verifyToken, isAdmin, getSellerPaymentHistory);

export default router;































