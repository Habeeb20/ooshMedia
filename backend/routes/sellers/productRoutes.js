import express from 'express';
import { createProduct,  getSellerProducts, 
  updateProduct, 
  deleteProduct, 
  updateStock,  
  getProductStats,
  likeProduct,
  viewProduct,
  rateProduct,
  getProductsByCategory,
  getBuildMaterialsProducts,
  shareProduct} from '../../controllers/sellers/productController.js';
import { verifyToken } from '../../middleware/verifyToken.js';
import { upload } from '../../middleware/multer.js';
import { getAllProducts, getAllPartProducts } from '../../controllers/sellers/productController.js';

const router = express.Router();

// Product Management
router.post('/', verifyToken, createProduct);
router.get('/category', getProductsByCategory);
router.get('/all', getAllProducts);
router.get("/parts", getAllPartProducts);
router.get('/building-materials', getBuildMaterialsProducts);

router.get('/', verifyToken, getSellerProducts);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);
router.get('/stats', verifyToken, getProductStats);
// Stock Management
router.put('/:id/stock', verifyToken, updateStock);


// Product Stats Routes
router.post('/:productId/like', verifyToken, likeProduct);
router.post('/:productId/view', viewProduct);
router.post('/:productId/rate', verifyToken, rateProduct);
// routes/productRoutes.js
         // no auth needed
router.post("/:productId/share", shareProduct);           // no auth needed

export default router;





