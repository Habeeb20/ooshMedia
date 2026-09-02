// // // server/controllers/voucherController.js
// // //
// // // Deliberately isolated from checkoutController.js — nothing here writes
// // // to the cart, and the normal checkout flow never calls into this file.
// // // The buyer only reaches this code by opening the "Use Voucher" modal.
// // import Product from '../models/sellers/product.js';
// // import Order from '../models/order/Order.js';
// // import VoucherRedemption from '../models/voucherRedemption.js';
// // import { lookupVoucher, reserveVoucherCheckout, confirmVoucherRedemption, releaseVoucherRedemption } from '../utills/voucherService.js';
// // import crypto from 'crypto';
// // import { productMatchesVoucherCategory } from '../utills/voucherCategorymap.js';

// // import axios from 'axios';

// // const NGN_TO_KOBO = 100;

// // function genOrderReference() {
// //   return `VCH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
// // }


// // function getCartItemProductId(item) {
// //   const raw = item.productId ?? item.product ?? item._id;
// //   if (raw && typeof raw === 'object') {
// //     // Defensive: client sent a populated product object instead of a bare id.
// //     return raw._id ?? raw.id;
// //   }
// //   return raw;
// // }


// // /**
// //  * GET /api/vouchers/lookup/:code
// //  * Read-only peek at a voucher's category/type/status BEFORE reserving
// //  * anything — lets the modal reject early with a clear message.
// //  */
// // export async function lookupVoucherHandler(req, res) {
// //   try {
// //     const cartKobo = req.query.cartKobo ? Number(req.query.cartKobo) : undefined;
// //     const voucher = await lookupVoucher(req.params.code, cartKobo);
// //     if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
// //     if (voucher.valid !== true) {
// //       return res.status(422).json({ message: voucher.reason || 'This voucher is not usable right now.' });
// //     }
// //     return res.json({
// //       code: voucher.code,
// //       type: voucher.type,
// //       category: voucher.category,
// //       amount_kobo: voucher.amount_kobo,
// //       percentage: voucher.percentage,
// //       preview_value_kobo: voucher.preview_value_kobo,
// //       uses_remaining: voucher.uses_remaining,
// //       expires_at: voucher.expires_at,
// //     });
// //   } catch (err) {
// //     const status = err.response?.status;
// //     if (status === 404) return res.status(404).json({ message: 'Voucher not found.' });
// //     console.error('lookupVoucherHandler error:', status, err.response?.data || err.message);
// //     return res.status(500).json({ message: 'Could not look up voucher right now.' });
// //   }
// // }
// // /**
// //  * POST /api/vouchers/apply
// //  * Body: { code, cartItems: [{ productId, quantity }], deliveryFeeKobo }
// //  *
// //  * cartItems/deliveryFeeKobo should be re-derived from the buyer's actual
// //  * cart on the server, not blindly trusted — this handler re-fetches each
// //  * Product to get its real price/category/seller rather than trusting
// //  * whatever price the client sends.
// //  */
// // export async function applyVoucherHandler(req, res) {
// //   const buyerId = req.user._id;
// //   const { code, cartItems, deliveryFeeKobo = 0 } = req.body;

// //   if (!code || !Array.isArray(cartItems) || cartItems.length === 0) {
// //     return res.status(400).json({ message: 'Voucher code and cart items are required.' });
// //   }

// //   try {
// //     const productIds = cartItems.map((i) => i.productId ?? i.product ?? i._id);
// //     const products = await Product.find({ _id: { $in: productIds } }).populate('seller', '_id');
// //     const productById = new Map(products.map((p) => [String(p._id), p]));

// //     // Rough matched subtotal first, just to send a useful cart_kobo preview to lookup.
// //     let roughCartKobo = 0;
// //     for (const item of cartItems) {
// //       const pid = item.productId?._id ?? item.product ?? item._id;
// //       const product = productById.get(String(pid));
// //       if (product) roughCartKobo += Math.round(product.price * item.quantity * NGN_TO_KOBO);
// //     }

// //     const voucher = await lookupVoucher(code, roughCartKobo);
// //     if (!voucher || voucher.valid !== true) {
// //       return res.status(422).json({ message: voucher?.reason || 'This voucher is invalid or has expired.' });
// //     }

// //     const matchedItems = [];
// //     let matchedSubtotalKobo = 0;
// //     let unmatchedSubtotalKobo = 0;

// //     for (const item of cartItems) {
// //       const pid = item.productId?._id ?? item.product ?? item._id;
// //       const product = productById.get(String(pid));
// //       if (!product) continue;

// //       const lineSubtotalKobo = Math.round(product.price * item.quantity * NGN_TO_KOBO);

// //       if (productMatchesVoucherCategory(product, voucher.category)) {
// //         matchedItems.push({
// //           product: product._id,
// //           seller: product.seller?._id || product.seller,
// //           name: product.name,
// //           quantity: item.quantity,
// //           subtotalKobo: lineSubtotalKobo,
// //         });
// //         matchedSubtotalKobo += lineSubtotalKobo;
// //       } else {
// //         unmatchedSubtotalKobo += lineSubtotalKobo;
// //       }
// //     }

// //     if (matchedItems.length === 0) {
// //       return res.status(422).json({
// //         message: `This voucher only applies to "${voucher.category}" items, and none are in your cart.`,
// //       });
// //     }

// //     const orderReference = genOrderReference();
   
// //     const reservation = await reserveVoucherCheckout({
// //       code: voucher.code,
// //       cartKobo: matchedSubtotalKobo,
// //       orderReference,
// //       category: voucher.category,
// //     });
    

// //     const grandTotalToChargeKobo =
// //       unmatchedSubtotalKobo + reservation.amount_to_charge_kobo + Math.round(deliveryFeeKobo);

// //     const record = await VoucherRedemption.create({
// //       buyer: buyerId,
// //       code: voucher.code,
// //       voucherCategory: voucher.category,
// //       voucherType: voucher.type,
// //       orderReference,
// //       redemptionReference: reservation.redemption_reference,
// //       matchedItems,
// //       unmatchedSubtotalKobo,
// //       matchedSubtotalKobo,
// //       discountKobo: reservation.discount_kobo,
// //       amountToChargeKobo: reservation.amount_to_charge_kobo,
// //       deliveryFeeKobo: Math.round(deliveryFeeKobo),
// //       grandTotalToChargeKobo,
// //       status: 'reserved',
// //       reservedExpiresAt: reservation.expires_at,
// //     });

// //     return res.json({
// //       redemptionId: record._id,
// //       redemptionReference: reservation.redemption_reference,
// //       matchedItems: matchedItems.map((m) => ({ name: m.name, quantity: m.quantity, subtotalKobo: m.subtotalKobo })),
// //       unmatchedSubtotalKobo,
// //       discountKobo: reservation.discount_kobo,
// //       amountToChargeKobo: reservation.amount_to_charge_kobo,
// //       deliveryFeeKobo: Math.round(deliveryFeeKobo),
// //       grandTotalToChargeKobo,
// //       grandTotalToChargeNaira: grandTotalToChargeKobo / NGN_TO_KOBO,
// //       expiresAt: reservation.expires_at,
// //     });
// //   } catch (err) {
// //     const walletMessage = err.response?.data?.error;
// //     console.error('applyVoucherHandler error:', err.response?.status, walletMessage || err.message);
// //     return res.status(err.response?.status || 500).json({
// //       message: walletMessage || 'hey!!!!, Could not apply this voucher right now.',
// //     });
// //   }
// // }

// // /**
// //  * POST /api/vouchers/release
// //  * Body: { redemptionReference }
// //  * Called when the buyer hits "Back" / closes the modal before paying.
// //  */
// // export async function releaseVoucherHandler(req, res) {
// //   const { redemptionReference } = req.body;
// //   if (!redemptionReference) return res.status(400).json({ message: 'redemptionReference is required.' });

// //   try {
// //     await releaseVoucherRedemption(redemptionReference);
// //     await VoucherRedemption.findOneAndUpdate(
// //       { redemptionReference, buyer: req.user._id, status: 'reserved' },
// //       { status: 'released', releasedAt: new Date() }
// //     );
// //     return res.json({ status: true, message: 'Voucher reservation released.' });
// //   } catch (err) {
// //     console.error('releaseVoucherHandler error:', err.response?.data || err.message);
// //     return res.status(err.response?.status || 500).json({ message: 'Could not release reservation.' });
// //   }
// // }

// // /**
// //  * POST /api/vouchers/confirm
// //  * Body: { redemptionReference, paystackReference, fulfillment: {...}, notes }
// //  *
// //  * Called after the frontend's Paystack popup reports success. Re-verifies
// //  * the charge server-side before doing anything irreversible — never trust
// //  * a client-reported "payment succeeded".
// //  */
// // export async function confirmVoucherHandler(req, res) {
// //   const { redemptionReference, paystackReference, fulfillment, notes } = req.body;
// //   if (!redemptionReference || !paystackReference) {
// //     return res.status(400).json({ message: 'redemptionReference and paystackReference are required.' });
// //   }

// //   const record = await VoucherRedemption.findOne({
// //     redemptionReference,
// //     buyer: req.user._id,
// //     status: 'reserved',
// //   }).populate('matchedItems.product matchedItems.seller');

// //   if (!record) {
// //     return res.status(404).json({ message: 'No pending voucher reservation found for this reference.' });
// //   }

// //   try {
// //     // 1. Verify the Paystack charge server-side (same secret-key verify
// //     //    call your existing checkout flow already does — reuse that
// //     //    helper if you have one; shown inline here for completeness).
// //     const paystackSecret = process.env.PAYSTACK_LIVE_MODE
// //       ? process.env.PAYSTACK_LIVE_SECRET_KEY
// //       : process.env.PAYSTACK_SECRET_KEY;

// //     const verifyRes = await axios.get(
// //       `https://api.paystack.co/transaction/verify/${encodeURIComponent(paystackReference)}`,
// //       { headers: { Authorization: `Bearer ${paystackSecret}` } }
// //     );
// //     const tx = verifyRes.data?.data;
// //     const expectedAmountKobo = record.grandTotalToChargeKobo;

// //     if (tx?.status !== 'success' || tx?.amount !== expectedAmountKobo) {
// //       return res.status(422).json({ message: 'Payment verification failed.' });
// //     }

// //     // 2. Only now confirm the wallet-side reservation — this is the call
// //     //    that actually credits the platform's Essential Wallet account.
// //     await confirmVoucherRedemption(redemptionReference);

// //     // 3. Build order items exactly as a normal order would — full price,
// //     //    normal platformFee/sellerAmount math. The seller is unaffected
// //     //    by the voucher; the buyer just paid less, funded by the wallet
// //     //    credit from step 2.
// //     const items = record.matchedItems.map((m) => {
// //       const subtotal = m.subtotalKobo / NGN_TO_KOBO;
// //       const platformFee = +(subtotal * 0.01).toFixed(2); // adjust to your real platform-fee rate
// //       return {
// //         product: m.product,
// //         seller: m.seller,
// //         name: m.name,
// //         quantity: m.quantity,
// //         price: subtotal / m.quantity,
// //         subtotal,
// //         platformFee,
// //         sellerAmount: subtotal - platformFee,
// //       };
// //     });

// //     const order = await Order.create({
// //       buyer: req.user._id,
// //       seller: items[0]?.seller, // adjust if you support true multi-seller carts elsewhere
// //       items,
// //       fulfillmentType: fulfillment?.fulfillmentType || 'delivery',
// //       pickup: fulfillment?.pickup,
// //       delivery: fulfillment?.delivery,
// //       transportFee: record.deliveryFeeKobo / NGN_TO_KOBO,
// //       paymentMethod: 'online',
// //       paymentStatus: 'paid',
// //       paystackReference,
// //       status: 'confirmed',
// //       totalAmount: record.grandTotalToChargeKobo / NGN_TO_KOBO,
// //       notes,
// //       voucherUsed: {
// //         code: record.code,
// //         category: record.voucherCategory,
// //         redemptionReference: record.redemptionReference,
// //         discountAmountKobo: record.discountKobo,
// //         matchedItems: record.matchedItems,
// //       },
// //     });

// //     record.status = 'confirmed';
// //     record.confirmedAt = new Date();
// //     record.order = order._id;
// //     record.paystackReference = paystackReference;
// //     await record.save();

// //     return res.json({ status: true, order });
// //   } catch (err) {
// //     console.error('confirmVoucherHandler error:', err.response?.data || err.message);
// //     record.status = 'failed';
// //     await record.save();
// //     return res.status(err.response?.status || 500).json({
// //       message: err.response?.data?.error || 'Could not confirm this order.',
// //     });
// //   }
// // }

// // /**
// //  * GET /api/admin/vouchers/orders
// //  * Admin-only. Every order that used a voucher, with the matched
// //  * seller(s) and discount breakdown visible.
// //  */
// // export async function adminListVoucherOrdersHandler(req, res) {
// //   if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only.' });

// //   const orders = await Order.find({ 'voucherUsed.code': { $exists: true } })
// //     .populate('buyer', 'firstName lastName email phoneNumber')
// //     .populate('voucherUsed.matchedItems.seller', 'firstName lastName email businessProfile.businessName')
// //     .populate('voucherUsed.matchedItems.product', 'name category')
// //     .sort({ createdAt: -1 });

// //   return res.json({ status: true, data: orders });
// // }












































































// // server/controllers/voucherController.js
// //
// // Deliberately isolated from checkoutController.js — nothing here writes
// // to the cart, and the normal checkout flow never calls into this file.
// // The buyer only reaches this code by opening the "Use Voucher" modal.
// //
// // Redemption is now merchant-key + OTP (see docs): request-otp -> apply
// // (verifies the OTP and reserves) -> confirm (after Paystack succeeds) /
// // release (if the buyer backs out).
// import Product from '../models/sellers/product.js';
// import Order from '../models/order/Order.js';
// import VoucherRedemption from '../models/voucherRedemption.js';
// import {
//   lookupVoucher,
//   requestVoucherOtp,
//   redeemVoucherWithOtp,
//   confirmVoucherRedemption,
//   releaseVoucherRedemption,
// } from '../utills/voucherService.js';
// import crypto from 'crypto';
// import { productMatchesVoucherCategory } from '../utills/voucherCategorymap.js';

// import axios from 'axios';

// const NGN_TO_KOBO = 100;

// function genOrderReference() {
//   return `VCH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
// }

// function getCartItemProductId(item) {
//   const raw = item.productId?._id ?? item.productId ?? item.product ?? item._id;
//   if (raw && typeof raw === 'object') {
//     // Defensive: client sent a populated product object instead of a bare id.
//     return raw._id ?? raw.id;
//   }
//   return raw;
// }

// /**
//  * GET /api/vouchers/lookup/:code
//  * Read-only peek at a voucher's category/type/status BEFORE we ever ask
//  * for a phone number — lets the modal reject early with a clear message.
//  */
// export async function lookupVoucherHandler(req, res) {
//   try {
//     const cartKobo = req.query.cartKobo ? Number(req.query.cartKobo) : undefined;
//     const voucher = await lookupVoucher(req.params.code, cartKobo);
//     if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
//     if (voucher.valid !== true) {
//       return res.status(422).json({ message: voucher.reason || 'This voucher is not usable right now.' });
//     }
//     return res.json({
//       code: voucher.code,
//       type: voucher.type,
//       category: voucher.category,
//       amount_kobo: voucher.amount_kobo,
//       percentage: voucher.percentage,
//       preview_value_kobo: voucher.preview_value_kobo,
//       uses_remaining: voucher.uses_remaining,
//       expires_at: voucher.expires_at,
//     });
//   } catch (err) {
//     const status = err.response?.status;
//     if (status === 404) return res.status(404).json({ message: 'Voucher not found.' });
//     console.error('lookupVoucherHandler error:', status, err.response?.data || err.message);
//     return res.status(500).json({ message: 'Could not look up voucher right now.' });
//   }
// }

// /**
//  * POST /api/vouchers/:code/request-otp
//  * Body: { phone }
//  *
//  * Step 1 of the merchant/OTP flow. Texts the shopper's Essential Wallet
//  * phone a 6-digit code and returns the opaque otp_reference the client
//  * needs for the next step. Rate-limited on the wallet side per merchant
//  * key and per phone number — surface 429s as-is.
//  */
// export async function requestVoucherOtpHandler(req, res) {
//   const { code } = req.params;
//   const { phone } = req.body;

//   if (!phone) {
//     return res.status(400).json({ message: 'A phone number is required.' });
//   }

//   try {
//     const result = await requestVoucherOtp(code, phone);
//     return res.json({
//       otpReference: result.otp_reference,
//       expiresAt: result.expires_at,
//     });
//   } catch (err) {
//     console.log('I am here boss')
//     const status = err.response?.status;
//     const message = err.response?.data?.error;
//     console.error('requestVoucherOtpHandler error:', status, message || err.message);
//     return res.status(status || 500).json({ message: message || 'Could not send a verification code right now.' });
//   }
// }

// /**
//  * POST /api/vouchers/apply
//  * Body: { code, otpReference, otp, cartItems: [{ productId, quantity }], deliveryFeeKobo }
//  *
//  * Step 2. Re-derives matched items from the buyer's actual cart on the
//  * server (never trusts client-sent prices/category), then verifies the
//  * OTP and reserves the discount. No money moves yet.
//  */
// export async function applyVoucherHandler(req, res) {
//   const buyerId = req.user._id;
//   const { code, otpReference, otp, cartItems, deliveryFeeKobo = 0 } = req.body;

//   if (!code || !otpReference || !otp) {
//     return res.status(400).json({ message: 'code, otpReference and otp are required.' });
//   }
//   if (!Array.isArray(cartItems) || cartItems.length === 0) {
//     return res.status(400).json({ message: 'Voucher code and cart items are required.' });
//   }

//   try {
//     const productIds = cartItems.map(getCartItemProductId);
//     const products = await Product.find({ _id: { $in: productIds } }).populate('seller', '_id');
//     const productById = new Map(products.map((p) => [String(p._id), p]));

//     // Rough matched subtotal first, just to send a useful cart_kobo preview to lookup.
//     let roughCartKobo = 0;
//     for (const item of cartItems) {
//       const pid = getCartItemProductId(item);
//       const product = productById.get(String(pid));
//       if (product) roughCartKobo += Math.round(product.price * item.quantity * NGN_TO_KOBO);
//     }

//     // Re-check validity/category server-side — never trust the client for this.
//     const voucher = await lookupVoucher(code, roughCartKobo);
//     if (!voucher || voucher.valid !== true) {
//       return res.status(422).json({ message: voucher?.reason || 'This voucher is invalid or has expired.' });
//     }

//     const matchedItems = [];
//     let matchedSubtotalKobo = 0;
//     let unmatchedSubtotalKobo = 0;

//     for (const item of cartItems) {
//       const pid = getCartItemProductId(item);
//       const product = productById.get(String(pid));
//       if (!product) continue;

//       const lineSubtotalKobo = Math.round(product.price * item.quantity * NGN_TO_KOBO);

//       if (productMatchesVoucherCategory(product, voucher.category)) {
//         matchedItems.push({
//           product: product._id,
//           seller: product.seller?._id || product.seller,
//           name: product.name,
//           quantity: item.quantity,
//           subtotalKobo: lineSubtotalKobo,
//         });
//         matchedSubtotalKobo += lineSubtotalKobo;
//       } else {
//         unmatchedSubtotalKobo += lineSubtotalKobo;
//       }
//     }

//     if (matchedItems.length === 0) {
//       return res.status(422).json({
//         message: `This voucher only applies to "${voucher.category}" items, and none are in your cart.`,
//       });
//     }

//     const orderReference = genOrderReference();

//     // Step 2 of the merchant/OTP flow — verifies the OTP and reserves the
//     // discount. No money moves yet.
//     const reservation = await redeemVoucherWithOtp({
//       otpReference,
//       otp,
//       cartKobo: matchedSubtotalKobo,
//       category: voucher.category,
//       orderReference,
//     });

//     const grandTotalToChargeKobo =
//       unmatchedSubtotalKobo + reservation.amount_to_charge_kobo + Math.round(deliveryFeeKobo);

//     const record = await VoucherRedemption.create({
//       buyer: buyerId,
//       code: voucher.code,
//       voucherCategory: voucher.category,
//       voucherType: voucher.type,
//       orderReference,
//       redemptionReference: reservation.redemption_reference,
//       matchedItems,
//       unmatchedSubtotalKobo,
//       matchedSubtotalKobo,
//       discountKobo: reservation.discount_kobo,
//       amountToChargeKobo: reservation.amount_to_charge_kobo,
//       deliveryFeeKobo: Math.round(deliveryFeeKobo),
//       grandTotalToChargeKobo,
//       status: 'reserved',
//       reservedExpiresAt: reservation.expires_at,
//     });

//     return res.json({
//       redemptionId: record._id,
//       redemptionReference: reservation.redemption_reference,
//       matchedItems: matchedItems.map((m) => ({ name: m.name, quantity: m.quantity, subtotalKobo: m.subtotalKobo })),
//       unmatchedSubtotalKobo,
//       discountKobo: reservation.discount_kobo,
//       amountToChargeKobo: reservation.amount_to_charge_kobo,
//       deliveryFeeKobo: Math.round(deliveryFeeKobo),
//       grandTotalToChargeKobo,
//       grandTotalToChargeNaira: grandTotalToChargeKobo / NGN_TO_KOBO,
//       expiresAt: reservation.expires_at,
//     });
//   } catch (err) {
//     const walletMessage = err.response?.data?.error;
//     console.error('applyVoucherHandler error:', err.response?.status, walletMessage || err.message);
//     return res.status(err.response?.status || 500).json({
//       message: walletMessage || 'Could not apply this voucher right now.',
//     });
//   }
// }

// /**
//  * POST /api/vouchers/release
//  * Body: { redemptionReference }
//  * Called when the buyer hits "Back" / closes the modal before paying.
//  */
// export async function releaseVoucherHandler(req, res) {
//   const { redemptionReference } = req.body;
//   if (!redemptionReference) return res.status(400).json({ message: 'redemptionReference is required.' });

//   try {
//     await releaseVoucherRedemption(redemptionReference);
//     await VoucherRedemption.findOneAndUpdate(
//       { redemptionReference, buyer: req.user._id, status: 'reserved' },
//       { status: 'released', releasedAt: new Date() }
//     );
//     return res.json({ status: true, message: 'Voucher reservation released.' });
//   } catch (err) {
//     console.error('releaseVoucherHandler error:', err.response?.data || err.message);
//     return res.status(err.response?.status || 500).json({ message: 'Could not release reservation.' });
//   }
// }

// /**
//  * POST /api/vouchers/confirm
//  * Body: { redemptionReference, paystackReference, fulfillment: {...}, notes }
//  *
//  * Called after the frontend's Paystack popup reports success. Re-verifies
//  * the charge server-side before doing anything irreversible — never trust
//  * a client-reported "payment succeeded".
//  */
// export async function confirmVoucherHandler(req, res) {
//   const { redemptionReference, paystackReference, fulfillment, notes } = req.body;
//   if (!redemptionReference || !paystackReference) {
//     return res.status(400).json({ message: 'redemptionReference and paystackReference are required.' });
//   }

//   const record = await VoucherRedemption.findOne({
//     redemptionReference,
//     buyer: req.user._id,
//     status: 'reserved',
//   }).populate('matchedItems.product matchedItems.seller');

//   if (!record) {
//     return res.status(404).json({ message: 'No pending voucher reservation found for this reference.' });
//   }

//   try {
//     // 1. Verify the Paystack charge server-side.
//     const paystackSecret = process.env.PAYSTACK_LIVE_MODE
//       ? process.env.PAYSTACK_LIVE_SECRET_KEY
//       : process.env.PAYSTACK_SECRET_KEY;

//     const verifyRes = await axios.get(
//       `https://api.paystack.co/transaction/verify/${encodeURIComponent(paystackReference)}`,
//       { headers: { Authorization: `Bearer ${paystackSecret}` } }
//     );
//     const tx = verifyRes.data?.data;
//     const expectedAmountKobo = record.grandTotalToChargeKobo;

//     if (tx?.status !== 'success' || tx?.amount !== expectedAmountKobo) {
//       return res.status(422).json({ message: 'Payment verification failed.' });
//     }

//     // 2. Only now confirm the reservation — this is the call that
//     //    actually credits the voucher's merchant wallet.
//     await confirmVoucherRedemption(redemptionReference);

//     // 3. Build order items exactly as a normal order would.
//     const items = record.matchedItems.map((m) => {
//       const subtotal = m.subtotalKobo / NGN_TO_KOBO;
//       const platformFee = +(subtotal * 0.01).toFixed(2); // adjust to your real platform-fee rate
//       return {
//         product: m.product,
//         seller: m.seller,
//         name: m.name,
//         quantity: m.quantity,
//         price: subtotal / m.quantity,
//         subtotal,
//         platformFee,
//         sellerAmount: subtotal - platformFee,
//       };
//     });

//     const order = await Order.create({
//       buyer: req.user._id,
//       seller: items[0]?.seller, // adjust if you support true multi-seller carts elsewhere
//       items,
//       fulfillmentType: fulfillment?.fulfillmentType || 'delivery',
//       pickup: fulfillment?.pickup,
//       delivery: fulfillment?.delivery,
//       transportFee: record.deliveryFeeKobo / NGN_TO_KOBO,
//       paymentMethod: 'online',
//       paymentStatus: 'paid',
//       paystackReference,
//       status: 'confirmed',
//       totalAmount: record.grandTotalToChargeKobo / NGN_TO_KOBO,
//       notes,
//       voucherUsed: {
//         code: record.code,
//         category: record.voucherCategory,
//         redemptionReference: record.redemptionReference,
//         discountAmountKobo: record.discountKobo,
//         matchedItems: record.matchedItems,
//       },
//     });

//     record.status = 'confirmed';
//     record.confirmedAt = new Date();
//     record.order = order._id;
//     record.paystackReference = paystackReference;
//     await record.save();

//     return res.json({ status: true, order });
//   } catch (err) {
//     console.error('confirmVoucherHandler error:', err.response?.data || err.message);
//     record.status = 'failed';
//     await record.save();
//     return res.status(err.response?.status || 500).json({
//       message: err.response?.data?.error || 'Could not confirm this order.',
//     });
//   }
// }

// /**
//  * GET /api/admin/vouchers/orders
//  * Admin-only.
//  */
// export async function adminListVoucherOrdersHandler(req, res) {
//   if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only.' });

//   const orders = await Order.find({ 'voucherUsed.code': { $exists: true } })
//     .populate('buyer', 'firstName lastName email phoneNumber')
//     .populate('voucherUsed.matchedItems.seller', 'firstName lastName email businessProfile.businessName')
//     .populate('voucherUsed.matchedItems.product', 'name category')
//     .sort({ createdAt: -1 });

//   return res.json({ status: true, data: orders });
// }
























import crypto from "crypto";
import Voucher from "../models/voucher.js";
import Order from "../models/order/Order.js";
import Product from "../models/sellers/product.js";
import generateUniqueVoucherCode from "../utills/generateVoucherCode.js";
import { initializePaystackTransaction, verifyPaystackTransaction } from "../utills/paystack.js";
import { isProductCategoryMatch } from "../utills/voucherCategorymap.js";
import voucherCategories from "../utills/voucherCategories.js";


const MIN_VOUCHER_AMOUNT_NAIRA = 500; // see README — assumption on what "minimum 500" refers to
const MAX_VOUCHER_USERS = 10;

// ==================== CREATE VOUCHER (initiate Paystack payment) ====================
export async function createVoucher(req, res) {
  try {
    const { category, amount, numberOfUsers, expiresAt } = req.body;

    if (!voucherCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid voucher category." });
    }

    const amountNaira = Number(amount);
    if (!Number.isFinite(amountNaira) || amountNaira < MIN_VOUCHER_AMOUNT_NAIRA) {
      return res.status(400).json({ message: `Minimum voucher amount is ₦${MIN_VOUCHER_AMOUNT_NAIRA.toLocaleString()}.` });
    }

    const users = Number(numberOfUsers);
    if (!Number.isInteger(users) || users < 1 || users > MAX_VOUCHER_USERS) {
      return res.status(400).json({ message: `Number of users must be between 1 and ${MAX_VOUCHER_USERS}.` });
    }

    const expiry = new Date(expiresAt);
    if (isNaN(expiry.getTime()) || expiry <= new Date()) {
      return res.status(400).json({ message: "Expiry date must be a valid date in the future." });
    }

    if (!req.user?.email) {
      return res.status(400).json({ message: "Your account needs an email on file to create a voucher." });
    }

    const totalAmountKobo = Math.round(amountNaira * 100);
    const perUserShareKobo = Math.floor(totalAmountKobo / users);

    const reference = `VCHPAY-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const voucher = await Voucher.create({
      category,
      createdBy: req.user._id,
      totalAmountKobo,
      numberOfUsers: users,
      perUserShareKobo,
      expiresAt: expiry,
      paystackReference: reference,
      status: "pending_payment",
      paymentStatus: "pending",
    });

    const callbackUrl = `${process.env.FRONTEND_URL}/voucher/payment-callback?voucherId=${voucher._id}`;

    const paystackData = await initializePaystackTransaction({
      email: req.user.email,
      amountKobo: totalAmountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: { voucherId: voucher._id.toString(), purpose: "voucher_funding" },
    });

    voucher.paystackAccessCode = paystackData.access_code;
    await voucher.save();

    return res.status(201).json({
      voucher,
      authorizationUrl: paystackData.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("createVoucher error:", err);
    return res.status(500).json({ message: err.message || "Could not create voucher." });
  }
}

// ==================== VERIFY PAYMENT (frontend callback page calls this) ====================
export async function verifyVoucherPayment(req, res) {
  try {
    const { reference } = req.params;
    const voucher = await Voucher.findOne({ paystackReference: reference });
    if (!voucher) return res.status(404).json({ message: "Voucher not found." });

    // Idempotent — if the webhook already confirmed it, just return it.
    if (voucher.paymentStatus === "paid") {
      return res.json({ voucher });
    }

    const data = await verifyPaystackTransaction(reference);

    if (data.status !== "success") {
      voucher.paymentStatus = "failed";
      await voucher.save();
      return res.status(400).json({ message: "Payment was not successful.", voucher });
    }

    if (data.amount !== voucher.totalAmountKobo) {
      console.error(`Voucher ${voucher._id} amount mismatch: expected ${voucher.totalAmountKobo}, got ${data.amount}`);
      return res.status(400).json({ message: "Amount mismatch — please contact support." });
    }

    voucher.code = await generateUniqueVoucherCode();
    voucher.paymentStatus = "paid";
    voucher.status = "active";
    voucher.paidAt = new Date();
    await voucher.save();

    return res.json({ voucher });
  } catch (err) {
    console.error("verifyVoucherPayment error:", err);
    return res.status(500).json({ message: err.message || "Could not verify payment." });
  }
}

// ==================== PAYSTACK WEBHOOK (recommended, in addition to the callback above) ====================
// Mount this route with express.raw({ type: 'application/json' }) so req.body
// is a raw Buffer — the signature check needs the exact bytes Paystack sent.
// IMPORTANT: if you apply express.json() globally in app.js BEFORE this route,
// the raw body will already be consumed and this check will fail. Either
// register this route before your global json() middleware, or exclude this
// path from it. See README.
export async function paystackWebhook(req, res) {
  try {
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) return res.sendStatus(401);

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const voucher = await Voucher.findOne({ paystackReference: reference });
      if (voucher && voucher.paymentStatus !== "paid" && event.data.amount === voucher.totalAmountKobo) {
        voucher.code = await generateUniqueVoucherCode();
        voucher.paymentStatus = "paid";
        voucher.status = "active";
        voucher.paidAt = new Date();
        await voucher.save();
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("paystackWebhook error:", err);
    // Ack anyway so Paystack doesn't hammer you with retries; the error is logged for investigation.
    return res.sendStatus(200);
  }
}

// ==================== CREATOR: list my vouchers + usage history ====================
export async function getMyVouchers(req, res) {
  try {
    const vouchers = await Voucher.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("redemptions.user", "firstName lastName username email")
      .populate("redemptions.matchedItems.seller", "firstName lastName businessProfile.businessName");
    return res.json({ vouchers });
  } catch (err) {
    console.error("getMyVouchers error:", err);
    return res.status(500).json({ message: "Could not load your vouchers." });
  }
}

export async function getMyVoucherById(req, res) {
  try {
    const voucher = await Voucher.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate("redemptions.user", "firstName lastName username email")
      .populate("redemptions.matchedItems.product", "name images")
      .populate("redemptions.matchedItems.seller", "firstName lastName businessProfile.businessName");
    if (!voucher) return res.status(404).json({ message: "Voucher not found." });
    return res.json({ voucher });
  } catch (err) {
    console.error("getMyVoucherById error:", err);
    return res.status(500).json({ message: "Could not load voucher." });
  }
}

// ==================== SHARED ELIGIBILITY CHECK ====================
// Used by both the read-only "validate" preview and the real checkout, so the
// two can never disagree about whether a voucher is usable.
async function checkVoucherEligibility(voucher, userId, cartItems) {
  if (!voucher) return { ok: false, message: "Invalid voucher code." };
  if (voucher.paymentStatus !== "paid" || voucher.status === "cancelled") {
    return { ok: false, message: "This voucher is not active." };
  }
  if (voucher.expiresAt < new Date()) {
    return { ok: false, message: "This voucher has expired." };
  }
  if (voucher.redemptions.some((r) => String(r.user) === String(userId))) {
    return { ok: false, message: "You have already used this voucher." };
  }
  if (voucher.redemptions.length >= voucher.numberOfUsers) {
    return { ok: false, message: "This voucher has already been fully redeemed." };
  }

  const productIds = cartItems.map((i) => i.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).select("category subCategory seller name price");
  const productMap = new Map(products.map((p) => [String(p._id), p]));
console.log(cartItems)
  const matchedItems = [];
  for (const item of cartItems) {
    const product = productMap.get(String(item.product?._id));
    console.log(product)
    console.log(product?.category)
    console.log(product?.subCategory)
    if (!product) continue;
  
    if (isProductCategoryMatch(voucher.category, product.category, product.subCategory)) {
      const subtotalKobo = Math.round(Number(item.price) * Number(item.quantity) * 100);
      matchedItems.push({
        product: product._id,
        seller: product.seller,
        name: item.name || product.name,
        quantity: item.quantity,
        subtotalKobo,
      });
    }
  }

  if (matchedItems.length === 0) {
    return {
      ok: false,
      message: `This voucher can only be used for "${voucher.category}" related items, and none of the items in your cart qualify.`,
    };
  }

  const matchedSubtotalKobo = matchedItems.reduce((sum, i) => sum + i.subtotalKobo, 0);
  const discountKobo = Math.min(voucher.perUserShareKobo, matchedSubtotalKobo);

  return { ok: true, discountKobo, matchedItems, matchedSubtotalKobo, productMap };
}

// ==================== CHECKOUT STEP 1: validate (no side effects) ====================
export async function validateVoucherForCheckout(req, res) {
  try {
    const { code, cartItems } = req.body;
    if (!code || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Voucher code and cart items are required." });
    }

    const voucher = await Voucher.findOne({ code: String(code).trim().toUpperCase() });
    const eligibility = await checkVoucherEligibility(voucher, req.user._id, cartItems);
    if (!eligibility.ok) return res.status(400).json({ message: eligibility.message });

    return res.json({
      valid: true,
      category: voucher.category,
      allocatedShareKobo: voucher.perUserShareKobo,
      discountKobo: eligibility.discountKobo,
      matchedItems: eligibility.matchedItems,
    });
  } catch (err) {
    console.error("validateVoucherForCheckout error:", err);
    return res.status(500).json({ message: err.message || "Could not validate voucher." });
  }
}

// ==================== CHECKOUT STEP 2: apply voucher + create order ====================
//
// IMPORTANT INTEGRATION NOTE: your real /api/orders/checkout controller almost
// certainly already handles things this simplified version re-implements —
// multi-seller order splitting, delivery/pickup code generation, Paystack
// split payments, loyalty points, etc. Rather than risk silently diverging
// from that logic, this function does the voucher-specific parts (atomic
// redemption, discount calculation) and then builds a single Order using the
// same fields your Order schema already exposes. Please review the
// order-creation section below against your actual checkout controller and
// reuse your existing helpers where they overlap (marked with TODO).
export async function checkoutWithVoucher(req, res) {
  try {
    const { code, cart, deliveryFeeKobo = 0 } = req.body;
    if (!code || !cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: "Voucher code and cart details are required." });
    }

    const voucher = await Voucher.findOne({ code: String(code).trim().toUpperCase() });
    const eligibility = await checkVoucherEligibility(voucher, req.user._id, cart.items);
    if (!eligibility.ok) return res.status(400).json({ message: eligibility.message });

    const { discountKobo, matchedItems, matchedSubtotalKobo, productMap } = eligibility;

    // ---- Totals ----
    const subtotalKobo = cart.items.reduce((sum, i) => sum + Math.round(Number(i.price) * Number(i.quantity) * 100), 0);
    const deliveryKobo = cart.fulfillmentType === "delivery" ? Math.round(deliveryFeeKobo) : 0;
    const grossTotalKobo = subtotalKobo + deliveryKobo;
    const remainingTotalKobo = Math.max(grossTotalKobo - discountKobo, 0);

    // ---- Atomically reserve this user's redemption slot BEFORE creating the
    // order. This is a compare-and-swap on the document: the update only
    // succeeds if the user hasn't redeemed yet AND a slot is still free,
    // which closes the race condition two simultaneous requests would
    // otherwise create. ----
    const reservedVoucher = await Voucher.findOneAndUpdate(
      {
        _id: voucher._id,
        status: "active",
        paymentStatus: "paid",
        "redemptions.user": { $ne: req.user._id },
        $expr: { $lt: [{ $size: "$redemptions" }, "$numberOfUsers"] },
      },
      {
        $push: {
          redemptions: {
            user: req.user._id,
            allocatedShareKobo: voucher.perUserShareKobo,
            amountUsedKobo: discountKobo,
            matchedItems: matchedItems.map((m) => ({
              ...m,
              amountCoveredKobo: Math.round((m.subtotalKobo / matchedSubtotalKobo) * discountKobo),
            })),
            usedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!reservedVoucher) {
      return res
        .status(409)
        .json({ message: "This voucher just became unavailable (already used or fully redeemed). Please try a different voucher." });
    }
    if (reservedVoucher.redemptions.length >= reservedVoucher.numberOfUsers) {
      reservedVoucher.status = "fully_redeemed";
      await reservedVoucher.save();
    }

    // ---- Build order items, resolving each item's seller from the product
    // lookup (your CheckoutPage only sends {product,name,price,quantity} to
    // this endpoint, not seller, so we need the DB copy). ----
    const orderItems = cart.items.map((item) => {
      const product = productMap.get(String(item.product?._id));
      const itemSubtotal = Math.round(Number(item.price) * Number(item.quantity) * 100) / 100;
      const platformFee = +(itemSubtotal * 0.01).toFixed(2); // TODO: reuse your real platform-fee logic if it differs
      return {
        product: item.product,
        seller: product?.seller,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        platformFee,
        sellerAmount: +(itemSubtotal - platformFee).toFixed(2),
      };
    });

    // NOTE: Order.seller is a single top-level field in your schema even
    // though items can belong to different sellers. This mirrors whatever
    // your existing checkout controller does for multi-seller carts — if it
    // splits into one Order per seller, do the same grouping here instead of
    // picking the first seller as done below.
    const primarySeller = orderItems[0]?.seller;
    console.log(primarySeller)

    const order = await Order.create({
      buyer: req.user._id,
      seller: primarySeller,
      items: orderItems,
      fulfillmentType: cart.fulfillmentType,
      pickup: cart.pickup,
      delivery: cart.delivery,
      transportFee: deliveryKobo / 100,
      paymentMethod: remainingTotalKobo > 0 ? cart.paymentMethod || "online" : "online",
      paymentStatus: remainingTotalKobo > 0 ? "pending" : "paid",
      status: "pending",
      totalAmount: remainingTotalKobo / 100,
      voucherUsed: {
        code: reservedVoucher.code,
        category: reservedVoucher.category,
        redemptionReference: `${reservedVoucher.code}-${req.user._id}`,
        discountAmountKobo: discountKobo,
        matchedItems: matchedItems.map((m) => ({
          product: m.product,
          seller: m.seller,
          name: m.name,
          quantity: m.quantity,
          subtotalKobo: m.subtotalKobo,
        })),
      },
    });

    // Link the order back onto the redemption record we just pushed.
    await Voucher.updateOne(
      { _id: reservedVoucher._id, "redemptions.user": req.user._id },
      { $set: { "redemptions.$.order": order._id } }
    );

    let paymentUrl = null;
    if (remainingTotalKobo > 0 && (cart.paymentMethod || "online") === "online") {
      const reference = `ORDPAY-${order._id}`;
      const paystackData = await initializePaystackTransaction({
        email: req.user.email || req.user?.alternateContact,
        amountKobo: remainingTotalKobo,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/order/${order._id}`,
        metadata: { orderId: order._id.toString() },
      });
      order.paystackReference = reference;
      await order.save();
      paymentUrl = paystackData.authorization_url;
    }

    return res.status(201).json({ order, paymentUrl, discountAppliedKobo: discountKobo });
  } catch (err) {
    console.error("checkoutWithVoucher error:", err);
    return res.status(500).json({ message: err.message || "Voucher checkout failed." });
  }
}
