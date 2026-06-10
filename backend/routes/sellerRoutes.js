import express from 'express';
import { 
  updateSellerProfile,
  getSellerProfile,
  addSellerChain,
  editSellerChain,
  deleteSellerChain,
  getAllSellers,
  likeSeller,
  viewSeller,
  shareSeller,
  reviewSeller,
  getSellerById,
  getSellerProducts,
  getSellerReviews,
  getSellerDistributors,
  createPurchaseHistory,
  updatePurchaseHistory,
  deletePurchaseHistory,
  getPurchaseHistory

} from '../controllers/sellerController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.put('/profile', verifyToken, updateSellerProfile);
router.get('/profile', verifyToken, getSellerProfile);

router.post('/chain', verifyToken, addSellerChain);
router.put('/chain/:chainId', verifyToken, editSellerChain);
router.delete('/chain/:chainId', verifyToken, deleteSellerChain);

router.get('/all', getAllSellers);

router.get('/:id', getSellerById);

// Seller Stats Routes
router.post('/:sellerId/like', verifyToken, likeSeller);
router.post('/:sellerId/view', viewSeller);
router.post('/:sellerId/share', verifyToken, shareSeller);
router.post('/:sellerId/review', verifyToken, reviewSeller);
router.get('/products/:id', getSellerProducts);
router.get('/:id/reviews', getSellerReviews);
router.get('/:sellerId/distributors', getSellerDistributors);

router.post(
  "/seller-chain/:chainId/purchase-history",
  verifyToken,
  createPurchaseHistory
);

router.put(
  "/seller-chain/:chainId/purchase-history/:historyId",
  verifyToken,
  updatePurchaseHistory
);

router.delete(
  "/seller-chain/:chainId/purchase-history/:historyId",
  verifyToken,
  deletePurchaseHistory
);

router.get(
  "/seller-chain/:chainId/purchase-history",
  verifyToken,
  getPurchaseHistory);
export default router;

