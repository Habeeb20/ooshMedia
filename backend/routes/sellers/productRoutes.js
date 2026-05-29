import express from 'express';
import { createProduct,  getSellerProducts, 
  updateProduct, 
  deleteProduct, 
  updateStock,  
  getProductStats} from '../../controllers/sellers/productController.js';
import { verifyToken } from '../../middleware/verifyToken.js';
import { upload } from '../../middleware/multer.js';
import { getAllProducts } from '../../controllers/sellers/productController.js';
const router = express.Router();

// Product Management
router.post('/', verifyToken, createProduct);
router.get('/all', getAllProducts);
router.get('/', verifyToken, getSellerProducts);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);
router.get('/stats', verifyToken, getProductStats);
// Stock Management
router.patch('/:id/stock', verifyToken, updateStock);

export default router;