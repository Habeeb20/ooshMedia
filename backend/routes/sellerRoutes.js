import express from 'express';
import { 
  updateSellerProfile,
  getSellerProfile,
  addSellerChain,
  editSellerChain,
  deleteSellerChain
} from '../controllers/sellerController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.put('/profile', verifyToken, updateSellerProfile);
router.get('/profile', verifyToken, getSellerProfile);

router.post('/chain', verifyToken, addSellerChain);
router.put('/chain/:chainId', verifyToken, editSellerChain);
router.delete('/chain/:chainId', verifyToken, deleteSellerChain);

export default router;