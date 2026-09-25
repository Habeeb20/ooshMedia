import express from 'express';
import {
  createCategory,
  addSubcategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteSubcategory,
  deleteCategory,
} from '../controllers/categoryController.js'
import { verifyToken,  } from '../../middleware/verifyToken.js';
import { isAdmin } from '../../middleware/verifyToken.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:categoryId', getCategoryById);

// Admin-only management
router.post('/', verifyToken, isAdmin, createCategory);
router.put('/:categoryId', verifyToken, isAdmin, updateCategory);
router.delete('/:categoryId', verifyToken, isAdmin, deleteCategory);
router.post('/:categoryId/subcategories', verifyToken, isAdmin, addSubcategory);
router.delete('/:categoryId/subcategories/:subcategoryId', verifyToken, isAdmin, deleteSubcategory);

export default router;