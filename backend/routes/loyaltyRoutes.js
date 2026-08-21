// routes/loyaltyRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { adminOnly } from '../middleware/verifyToken.js';
import { getMyLoyaltyStatus,  getSettings,
  toggleGlobalLoyalty,
  toggleUserLoyalty,
  getLoyaltyOverview,
  getLoyaltyRedemptions,
  getSellerLoyaltyOwed, } from '../controllers/loyaltyController.js';
import { markSellerLoyaltyPaid } from '../controllers/loyaltyController.js';


const router = express.Router();

router.get('/me', verifyToken, getMyLoyaltyStatus);

// Admin
router.get('/admin/settings', verifyToken, adminOnly, getSettings);
router.put('/admin/settings/toggle', verifyToken, adminOnly, toggleGlobalLoyalty);
router.put('/admin/users/:userId/toggle', verifyToken, adminOnly, toggleUserLoyalty);
router.get('/admin/overview', verifyToken, adminOnly, getLoyaltyOverview);
router.get('/admin/redemptions', verifyToken, adminOnly, getLoyaltyRedemptions);
router.get('/admin/seller-owed', verifyToken, adminOnly, getSellerLoyaltyOwed);


router.put('/admin/seller-owed/:sellerId/mark-paid', verifyToken, adminOnly, markSellerLoyaltyPaid);

export default router;