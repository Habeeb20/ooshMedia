import express from 'express';
import { verifyToken, adminOnly } from '../middleware/verifyToken.js';
import { lookupVoucherHandler,  applyVoucherHandler,
  releaseVoucherHandler,
  confirmVoucherHandler,
  adminListVoucherOrdersHandler,} from '../controllers/voucherController.js';


const router = express.Router();

router.get('/lookup/:code', verifyToken, lookupVoucherHandler);
router.post('/redeem', verifyToken, applyVoucherHandler);
router.post('/release', verifyToken, releaseVoucherHandler);
router.post('/confirm', verifyToken, confirmVoucherHandler);

// Mount this one under your existing admin router if you prefer, e.g.
// app.use('/api/admin/vouchers', adminOnly, voucherAdminRouter)
router.get('/admin/orders', verifyToken, adminOnly, adminListVoucherOrdersHandler);

export default router;

