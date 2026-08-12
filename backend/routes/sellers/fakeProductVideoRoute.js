import express from 'express';
import { verifyToken } from '../../middleware/verifyToken.js';
import { createProductVideo,   getMyProductVideos,
  getProductVideos,
  updateProductVideo,
  deleteProductVideo,} from '../../controllers/sellers/fakeproductVideoController.js';


const router = express.Router();

// Public
router.get('/', getProductVideos);

// Seller-only — order matters: /mine before /:id
router.get('/mine', verifyToken, getMyProductVideos);
router.post('/', verifyToken, createProductVideo);
router.put('/:id', verifyToken, updateProductVideo);
router.delete('/:id', verifyToken, deleteProductVideo);

export default router;