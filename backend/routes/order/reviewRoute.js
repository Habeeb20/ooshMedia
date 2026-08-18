import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import {
  createReview,
  getReviewableProducts,
  getSellerReviews,
  getProductReviews,
} from '../../controllers/order/reviewController.js';

const router = express.Router();

// Public — anyone can view reviews
router.get('/seller', getSellerReviews);
router.get('/product/:productId', getProductReviews);

// Auth required
router.use(verifyToken);
router.get('/reviewable', getReviewableProducts);
router.post('/', createReview);

export default router;