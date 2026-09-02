// import express from 'express';
// import { verifyToken, adminOnly } from '../middleware/verifyToken.js';
// import { lookupVoucherHandler,  applyVoucherHandler,
//   releaseVoucherHandler,
//   confirmVoucherHandler,
//   adminListVoucherOrdersHandler,
//   requestVoucherOtpHandler,} from '../controllers/voucherController.js';


// const router = express.Router();

// router.get('/lookup/:code', verifyToken, lookupVoucherHandler);
// router.post('/redeem', verifyToken, applyVoucherHandler);
// router.post('/vouchers/:code/redeem/request-otp', verifyToken, requestVoucherOtpHandler);
// router.post('/release', verifyToken, releaseVoucherHandler);
// router.post('/confirm', verifyToken, confirmVoucherHandler);

// // Mount this one under your existing admin router if you prefer, e.g.
// // app.use('/api/admin/vouchers', adminOnly, voucherAdminRouter)
// router.get('/admin/orders', verifyToken, adminOnly, adminListVoucherOrdersHandler);

// export default router;





import express from "express";
import {
  createVoucher,
  verifyVoucherPayment,
  paystackWebhook,
  getMyVouchers,
  getMyVoucherById,
  validateVoucherForCheckout,
  checkoutWithVoucher,
} from "../controllers/voucherController.js";

import { sellerGetVoucherSales } from "../controllers/sellerVoucherController.js";


import { adminGetAllVouchers, adminGetVoucherDetail } from "../controllers/adminController.js";
import { isAdmin, verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

// The webhook needs the RAW request body to verify Paystack's signature.
// Mount it with express.raw() and make sure it runs BEFORE any global
// express.json() middleware in app.js — otherwise the body will already be
// parsed into an object by the time it gets here. See README.
router.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);

router.use(verifyToken); // everything below requires a logged-in user

router.post("/", createVoucher);
router.get("/verify/:reference", verifyVoucherPayment);
router.get("/mine", getMyVouchers);
router.get("/mine/:id", getMyVoucherById);

router.post("/validate", validateVoucherForCheckout);
router.post("/checkout", checkoutWithVoucher);

router.get("/seller/sales", sellerGetVoucherSales);

router.get("/admin/all", verifyToken, adminGetAllVouchers);
router.get("/admin/:id", verifyToken, adminGetVoucherDetail);

export default router;
