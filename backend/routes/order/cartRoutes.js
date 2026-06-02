// routes/cartRoutes.js
import express from 'express';
import {verifyToken} from '../../middleware/verifyToken.js';
import { addToCart, getCart, updateCartItem, removeFromCart, updateFulfillment, clearCart } from '../../controllers/order/cartController.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:productId', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.put('/fulfillment', updateFulfillment);
router.delete('/', clearCart);

export default router;
