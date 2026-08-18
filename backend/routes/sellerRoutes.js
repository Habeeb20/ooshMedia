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
  getPurchaseHistory,
  sellerBanks,
  verifyBanks

} from '../controllers/sellerController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { initiateInventoryAccessPayment, verifyInventoryAccessPayment } from '../controllers/inventoryaccessController.js';
import { verifyInspectionPayment } from '../controllers/Inspection.js';
const router = express.Router();




router.put('/profile', verifyToken, updateSellerProfile);
router.get('/profile', verifyToken, getSellerProfile);

// GET /api/seller/banks
router.get('/banks', verifyToken, sellerBanks)

// GET /api/seller/verify-account?accountNumber=...&bankCode=...
router.get('/verify-account', verifyToken, verifyBanks)
router.post('/chain', verifyToken, addSellerChain);

  router.post('/inspection/verify', verifyToken, verifyInspectionPayment); // literal — near the top

 


router.put('/chain/:chainId', verifyToken, editSellerChain);
router.delete('/chain/:chainId', verifyToken, deleteSellerChain);

router.get('/all', getAllSellers);



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


router.post('/inventory-access/initiate', verifyToken, initiateInventoryAccessPayment);
router.get('/inventory-access/verify', verifyToken, verifyInventoryAccessPayment)

router.get('/:id', getSellerById);


export default router;

