

















// import axios from 'axios';
// import crypto from 'crypto';
// import Cart from '../../models/order/Cart.js';
// import Order from '../../models/order/Order.js';

// import Product from "../../models/sellers/product.js"
// import Transaction from '../../models/order/Transaction.js';
// import Loyalty from '../../models/order/Loyalty.js';
// import SettlementHistory, { computeInitialPayoutStatus } from '../../models/order/settlementHistory.js';

// import User from "../../models/user.js"
// import { computeTransportFee } from '../../utills/Distance.js';
// import { buildSellerSettlementPlan } from '../../utills/paystacksplitService.js';
// import { buildDynamicSplit } from '../../utills/paystacksplitService.js';
// const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
// const PLATFORM_FEE_RATE = 0.01; // 1%

// const generateVerificationCode = () => String(Math.floor(1000 + Math.random() * 9000));

// // ── CHECKOUT ────────────────────────────────────────────────
// export const checkout = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     const buyer = await User.findById(req.user._id);
//     if (!buyer) return res.status(400).json({ message: 'Buyer not found' });

//     // Validate stock & payment method, capture seller info as we go
//     const sellerCache = new Map(); // sellerId -> full seller User doc
//     let orderSellerId; // top-level order.seller (assumes single-seller cart)

//     for (const item of cart.items) {
//       const product = item.product;
//       if (!product || product.status !== 'active') {
//         return res.status(400).json({ message: `${item.name} is no longer available` });
//       }
//       if (product.stockQuantity < item.quantity) {
//         return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
//       }

//       const sellerId = item.seller.toString();
//       let seller = sellerCache.get(sellerId);
//       if (!seller) {
//         seller = await User.findById(item.seller);
//         sellerCache.set(sellerId, seller);
//       }

//       if (cart.paymentMethod === 'on_delivery' && !seller?.acceptsPaymentOnDelivery) {
//         return res.status(400).json({
//           message: `Seller of "${item.name}" does not accept payment on delivery`,
//         });
//       }

//       // capture the seller for the order (last one wins if cart somehow has more than one)
//       orderSellerId = seller?._id;
//     }

//     // Build order items with fee calculations, and group by seller (needed
//     // for both settlement planning and per-seller transport-fee distance).
//     let totalAmount = 0;
//     let totalPlatformFee = 0;
//     const sellerGroups = {};

//     const orderItems = cart.items.map(item => {
//       const subtotal = item.price * item.quantity;
//       const platformFee = +(subtotal * PLATFORM_FEE_RATE).toFixed(2);
//       const sellerAmount = +(subtotal - platformFee).toFixed(2);
//       totalAmount += subtotal;
//       totalPlatformFee += platformFee;

//       const sid = item.seller.toString();
//       if (!sellerGroups[sid]) {
//         sellerGroups[sid] = { seller: item.seller, amount: 0, fee: 0, sellerAmt: 0 };
//       }
//       sellerGroups[sid].amount += subtotal;
//       sellerGroups[sid].fee += platformFee;
//       sellerGroups[sid].sellerAmt += sellerAmount;

//       return {
//         product: item.product._id,
//         seller: item.seller,
//         name: item.name,
//         image: item.image,
//         price: item.price,
//         quantity: item.quantity,
//         subtotal,
//         platformFee,
//         sellerAmount,
//       };
//     });

//     // ── TRANSPORT FEE (delivery orders only) ───────────────────
//     let transportFee = 0;
//     let transportFeeDetails = null;

//     if (cart.fulfillmentType === 'delivery') {
//       const breakdown = [];
//       for (const sid of Object.keys(sellerGroups)) {
//         const sellerDoc = sellerCache.get(sid);
//         const { fee, distanceKm, source } = await computeTransportFee({
//           buyerState: buyer.state,
//           buyerLga: buyer.lga,
//           sellerState: sellerDoc?.state,
//           sellerLga: sellerDoc?.lga,
//         });
//         transportFee += fee;
//         breakdown.push({ seller: sid, distanceKm, fee, source });
//       }
//       transportFeeDetails = {
//         ratePerKm: Number(process.env.TRANSPORT_RATE_PER_KM || 100),
//         baseFee: Number(process.env.TRANSPORT_BASE_FEE || 500),
//         source: breakdown[0]?.source,
//         breakdown,
//       };
//     }

//     // ── VERIFICATION CODE (pickup AND delivery, per seller request) ──
//     const verificationCode = generateVerificationCode();

//     // Create order
//     const order = new Order({
//       buyer: req.user._id,
//       seller: orderSellerId,
//       items: orderItems,
//       fulfillmentType: cart.fulfillmentType,
//       pickup: {
//         ...cart.pickup,
//         code: cart.fulfillmentType === 'pickup' ? verificationCode : undefined,
//         isCodeVerified: false,
//       },
//       delivery: {
//         address: cart.delivery?.address,
//         deliveryCode: cart.fulfillmentType === 'delivery' ? verificationCode : undefined,
//         isCodeVerified: false,
//       },
//       transportFee,
//       transportFeeDetails,
//       paymentMethod: cart.paymentMethod,
//       paymentStatus: 'pending',
//       status: 'pending',
//       totalAmount: +(totalAmount + transportFee).toFixed(2),
//       totalPlatformFee: +totalPlatformFee.toFixed(2),
//       totalSellerAmount: +(totalAmount - totalPlatformFee).toFixed(2),
//     });

//     await order.save();

//     // Settlement plan: who's eligible for direct-to-seller payout
//     const settlementPlan = buildSellerSettlementPlan(sellerGroups, sellerCache);

//     // If paying online, initialize Paystack (with split when possible)
//     if (cart.paymentMethod === 'online') {
//       const chargeAmountKobo = Math.round(order.totalAmount * 100);
//       const basePayload = {
//         email: buyer.email || buyer.alternateContact,
//         amount: chargeAmountKobo,
//         reference: `ORD-${order._id}-${Date.now()}`,
//         metadata: { orderId: order._id.toString() },
//         callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
//       };

//       let paystackRes;
//       let usedSplit = false;
//       let splitBuildError = null;

//       // Attempt a split-enabled charge first (direct-to-seller for eligible
//       // sellers); fall back to a plain charge into the estore account if
//       // anything about the split goes wrong, so checkout is never blocked.
//       const splitPayload = buildDynamicSplit(settlementPlan);
//       if (splitPayload) {
//         try {
//           paystackRes = await axios.post(
//             'https://api.paystack.co/transaction/initialize',
//             { ...basePayload, split: splitPayload },
//             { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
//           );
//           usedSplit = true;
//         } catch (err) {
//           splitBuildError = err?.response?.data?.message || err.message;
//           paystackRes = null;
//         }
//       }

//       if (!paystackRes) {
//         try {
//           paystackRes = await axios.post(
//             'https://api.paystack.co/transaction/initialize',
//             basePayload,
//             { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
//           );
//           usedSplit = false;
//         } catch (err) {
//           // Total Paystack outage — nothing we can do to get a payment link,
//           // let the outer catch handle the 500.
//           throw err;
//         }
//       }

//       order.paystackReference = paystackRes.data.data.reference;
//       order.paystackAccessCode = paystackRes.data.data.access_code;
//       order.paystackSplitUsed = usedSplit;
//       await order.save();

//       await recordCheckoutSettlementHistory({
//         order,
//         settlementPlan,
//         transportFee,
//         usedSplit,
//         splitBuildError,
//         paymentMethod: 'online',
//       });

//       // Reduce stock optimistically
//       await decreaseStock(cart.items);

//       return res.json({
//         order,
//         paymentUrl: paystackRes.data.data.authorization_url,
//         reference: paystackRes.data.data.reference,
//         transportFee,
//         deliveryCode: order.fulfillmentType === 'delivery' ? verificationCode : null,
//         pickupCode: order.fulfillmentType === 'pickup' ? verificationCode : null,
//       });
//     }

//     // Pay on delivery / pickup — just confirm order, money settles on code verification
//     await decreaseStock(cart.items);
//     order.status = 'confirmed';
//     await order.save();

//     // Create transaction record
//     await createTransaction(order, 'pending');

//     await recordCheckoutSettlementHistory({
//       order,
//       settlementPlan,
//       transportFee,
//       usedSplit: false,
//       splitBuildError: null,
//       paymentMethod: 'on_delivery',
//       cashPending: true,
//     });

//     await Cart.findOneAndDelete({ buyer: req.user._id });

//     res.json({
//       order,
//       transportFee,
//       deliveryCode: order.fulfillmentType === 'delivery' ? verificationCode : null,
//       pickupCode: order.fulfillmentType === 'pickup' ? verificationCode : null,
//     });
//   } catch (err) {
//     console.error('Checkout error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── PAYSTACK VERIFY ────────────────────────────────────────
// // GET /orders/verify-payment/:reference

// /**
//  * @swagger
//  * /api/orders/verify-payment/{reference}:
//  *   get:
//  *     summary: Verify a Paystack payment and finalize the order
//  *     description: >
//  *       Confirms the transaction with Paystack, marks the order paid/confirmed, awards
//  *       loyalty points (1 point per ₦100), creates the seller transaction, reconciles
//  *       split settlement history, and clears the buyer's cart.
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: reference
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Paystack transaction reference
//  *     responses:
//  *       200:
//  *         description: Payment verified and order finalized
//  *       400:
//  *         description: Payment was not successful
//  *       404:
//  *         description: No order found for this reference
//  */

// export const verifyPayment = async (req, res) => {
//   try {
//     const { reference } = req.params;
//     const paystackRes = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
//     );
//     const data = paystackRes.data.data;

//     if (data.status !== 'success') {
//       return res.status(400).json({ message: 'Payment not successful' });
//     }

//     const order = await Order.findOne({ paystackReference: reference });
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     await finalizeOnlinePayment(order, data);

//     res.json({ message: 'Payment verified', order });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── PAYSTACK WEBHOOK ───────────────────────────────────────
// // POST /orders/webhook

// /**
//  * @swagger
//  * /api/orders/webhook:
//  *   post:
//  *     summary: Paystack webhook — auto-confirms orders on charge.success
//  *     description: >
//  *       Not authenticated with a bearer token. Instead verifies the `x-paystack-signature`
//  *       header against an HMAC SHA-512 hash of the raw body, using PAYSTACK_SECRET_KEY.
//  *       Mounted **before** `router.use(verifyToken)` in orderRoutes.js.
//  *     tags: [Orders]
//  *     security: []
//  *     responses:
//  *       200:
//  *         description: Event received and processed (or ignored if not charge.success)
//  *       401:
//  *         description: Signature mismatch
//  */

// export const paystackWebhook = async (req, res) => {
//   const hash = crypto
//     .createHmac('sha512', PAYSTACK_SECRET)
//     .update(JSON.stringify(req.body))
//     .digest('hex');

//   if (hash !== req.headers['x-paystack-signature']) {
//     return res.status(401).send('Unauthorized');
//   }

//   const event = req.body;
//   if (event.event === 'charge.success') {
//     const reference = event.data.reference;
//     const order = await Order.findOne({ paystackReference: reference });
//     if (order && order.paymentStatus !== 'paid') {
//       await finalizeOnlinePayment(order, event.data);
//     }
//   }
//   res.sendStatus(200);
// };

// // Shared by verifyPayment + the webhook so both paths behave identically.
// async function finalizeOnlinePayment(order, paystackData) {
//   order.paymentStatus = 'paid';
//   order.status = 'confirmed';

//   const points = Math.floor(order.totalAmount / 1000);
//   await awardLoyalty(order.buyer, points, order._id);
//   order.loyaltyPointsAwarded = points;
//   await order.save();

//   await createTransaction(order, 'completed');

//   // Reconcile settlement history against what Paystack actually did. If a
//   // split was used, `paystackData.split` tells us the real per-account
//   // breakdown; store it for the record either way.
//   await SettlementHistory.updateMany(
//     { order: order._id, status: 'pending' },
//     {
//       $set: {
//         status: 'completed',
//         meta: paystackData.split || null,
//       },
//     }
//   );

//   // Note: sellers paid via Paystack split are settled automatically by
//   // Paystack — no manual Transfer call needed for them (their rows were
//   // written with payoutStatus 'not_applicable' at checkout time). Sellers
//   // who weren't eligible for direct payout keep payoutStatus 'owed' from
//   // checkout, and now show up on the admin settlements dashboard for a
//   // manual payout.

//   await Cart.findOneAndDelete({ buyer: order.buyer });
// }

// // ── DELIVERY / PICKUP CODE VERIFY ──────────────────────────
// // POST /orders/:orderId/verify-delivery
// /**
//  * @swagger
//  * /api/orders/{orderId}/verify-delivery:
//  *   post:
//  *     summary: Verify the delivery or pickup code to complete an order
//  *     description: >
//  *       Works for both fulfillment types — checks delivery.deliveryCode for delivery
//  *       orders and pickup.code for pickup orders. If the order was pay-on-delivery/
//  *       pay-on-pickup and unpaid, this also marks it paid, awards loyalty points,
//  *       creates the transaction, and (for super-verified sellers with a payout
//  *       account) initiates their transfer — logging everything to settlement history.
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [code]
//  *             properties:
//  *               code:
//  *                 type: string
//  *                 example: "4821"
//  *     responses:
//  *       200:
//  *         description: Order completed
//  *       400:
//  *         description: The code is invalid
//  *       404:
//  *         description: Order not found
//  */

// export const verifyDeliveryCode = async (req, res) => {
//   try {
//     const { code } = req.body;
//     const order = await Order.findById(req.params.orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const isDelivery = order.fulfillmentType === 'delivery';
//     const expectedCode = isDelivery ? order.delivery.deliveryCode : order.pickup.code;

//     if (!expectedCode || expectedCode !== code) {
//       return res.status(400).json({ message: 'Invalid code' });
//     }

//     if (isDelivery) {
//       order.delivery.isCodeVerified = true;
//     } else {
//       order.pickup.isCodeVerified = true;
//     }
//     order.status = 'delivered';

//     // Award loyalty + settle sellers if this was pay-on-delivery/pickup
//     if (order.paymentMethod === 'on_delivery' && order.paymentStatus !== 'paid') {
//       order.paymentStatus = 'paid';
//       const points = Math.floor(order.totalAmount / 1000);
//       await awardLoyalty(order.buyer, points, order._id);
//       order.loyaltyPointsAwarded = points;
//       await createTransaction(order, 'completed');
//       await settleCashOrderPayouts(order);
//     }

//     await order.save();
//     await syncOrderRiderSettlement(order);
//     res.json({ message: 'Order completed', order });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * @swagger
//  * /api/orders/{orderId}:
//  *   get:
//  *     summary: Get a single order by ID
//  *     description: Only accessible to the buyer on the order, or a seller with at least one item in it.
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: orderId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Order found
//  *       403:
//  *         description: Not the buyer or a seller on this order
//  *       404:
//  *         description: Order not found
//  */

// // ── GET SINGLE ORDER ───────────────────────────────────────
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId)
//       .populate('buyer', 'firstName lastName email phoneNumber')
//       .populate('items.product', 'name images price')
//       .populate('items.seller', 'firstName lastName shopName');
//     if (!order) return res.status(404).json({ message: 'Order not found' });
//     // Only buyer or seller can view
//     const isBuyer = order.buyer._id.toString() === req.user._id.toString();
//     const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
//     if (!isBuyer && !isSeller) return res.status(403).json({ message: 'Forbidden' });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * @swagger
//  * /api/orders/my:
//  *   get:
//  *     summary: Get the authenticated buyer's orders
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of the buyer's orders, newest first
//  */
// export const getBuyerOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ buyer: req.user._id })
//        .populate('items.product', 'name images')
//       .populate('delivery.assignedRider', 'firstName lastName phoneNumber')
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── SELLER ORDER MANAGEMENT ───────────────────────────────

// /**
//  * @swagger
//  * /api/orders/seller:
//  *   get:
//  *     summary: Get orders containing the authenticated seller's items
//  *     description: >
//  *       Requires the `sellerOnly` middleware. Each order is filtered down to only the
//  *       items belonging to this seller, and `sellerInfo` is attached at the order level.
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           type: string
//  *           enum: [pending, confirmed, in_progress, delivered, cancelled]
//  *       - in: query
//  *         name: paymentMethod
//  *         schema:
//  *           type: string
//  *           enum: [online, on_delivery]
//  *       - in: query
//  *         name: from
//  *         schema:
//  *           type: string
//  *           format: date
//  *       - in: query
//  *         name: to
//  *         schema:
//  *           type: string
//  *           format: date
//  *     responses:
//  *       200:
//  *         description: Orders containing this seller's items, filtered to just their items
//  */

// export const getSellerOrders = async (req, res) => {
//   try {
//     const { status, paymentMethod, from, to } = req.query;

//     const match = {
//       'items.seller': req.user._id
//     };

//     if (status) match.status = status;
//     if (paymentMethod) match.paymentMethod = paymentMethod;
//     if (from || to) {
//       match.createdAt = {};
//       if (from) match.createdAt.$gte = new Date(from);
//       if (to) match.createdAt.$lte = new Date(to);
//     }

//     const orders = await Order.find(match)
//       .populate('buyer', 'firstName lastName email phoneNumber')
//       .populate({
//         path: 'items.seller',
//         select: 'firstName lastName email phoneNumber businessName state lga businessAddress phoneNumber'
//       })
//       .populate('items.product', 'name images price')
//       .populate('delivery.assignedRider', 'firstName lastName phoneNumber')
//       .sort({ createdAt: -1 });

//     // Filter to only this seller's items and clean up response
//     const filteredOrders = orders.map(order => {
//       const orderObj = order.toObject({ getters: true });

//       const sellerItems = orderObj.items.filter(item =>
//         item.seller &&
//         (typeof item.seller === 'string'
//           ? item.seller === req.user._id.toString()
//           : item.seller._id.toString() === req.user._id.toString())
//       );

//       return {
//         ...orderObj,
//         items: sellerItems.map(item => ({
//           ...item,
//           seller: item.seller
//         })),
//         sellerInfo: sellerItems[0]?.seller || null
//       };
//     });

//     res.json(filteredOrders);

//   } catch (err) {
//     console.error("Error fetching seller orders:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// /**
//  * @swagger
//  * /api/orders/{orderId}/settlement-history:
//  *   get:
//  *     summary: Get the full settlement/payout audit trail for an order
//  *     description: >
//  *       Every movement of money for this order — seller shares, platform fee,
//  *       transport fee — with its destination (seller_subaccount vs estore),
//  *       method (split/transfer/fallback/cash_pending) and status.
//  *     tags: [Orders]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: orderId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Settlement history rows for the order
//  *       403:
//  *         description: Not the buyer or a seller on this order
//  *       404:
//  *         description: Order not found
//  */
// export const getOrderSettlementHistory = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     const isBuyer = order.buyer.toString() === req.user._id.toString();
//     const isSeller = order.items.some(i => i.seller.toString() === req.user._id.toString());
//     const isAdmin = req.user.role === 'admin';
//     if (!isBuyer && !isSeller && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

//     // Keep the transport_fee row's rider/riderAmount current — a rider is
//     // often assigned or the agreed fee is set after checkout already happened.
//     await syncOrderRiderSettlement(order);

//     const history = await SettlementHistory.find({ order: order._id })
//       .sort({ createdAt: 1 })
//       .populate('seller', 'firstName lastName shopName')
//       .populate('rider', 'firstName lastName phoneNumber riderProfile.vehicleType');
//     res.json(history);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ── HELPERS ────────────────────────────────────────────────
// async function decreaseStock(items) {
//   for (const item of items) {
//     await Product.findByIdAndUpdate(item.product._id || item.product, {
//       $inc: { stockQuantity: -item.quantity, sold: item.quantity },
//     });
//     // Update status if out of stock
//     const p = await Product.findById(item.product._id || item.product);
//     if (p && p.stockQuantity <= 0) {
//       p.status = 'out_of_stock';
//       await p.save();
//     }
//   }
// }

// async function awardLoyalty(userId, points, orderId) {
//   let loyalty = await Loyalty.findOne({ user: userId });
//   if (!loyalty) loyalty = new Loyalty({ user: userId });
//   loyalty.totalPoints += points;
//   loyalty.history.push({ type: 'earned', points, order: orderId, description: `Earned from order` });
//   await loyalty.save();
// }

// async function createTransaction(order, paymentStatus) {
//   // Group items by seller
//   const sellerMap = {};
//   for (const item of order.items) {
//     const sid = item.seller.toString();
//     if (!sellerMap[sid]) sellerMap[sid] = { seller: item.seller, items: [], amount: 0, fee: 0, sellerAmt: 0 };
//     sellerMap[sid].items.push(item);
//     sellerMap[sid].amount += item.subtotal;
//     sellerMap[sid].fee += item.platformFee;
//     sellerMap[sid].sellerAmt += item.sellerAmount;
//   }

//   for (const { seller, items, amount, fee, sellerAmt } of Object.values(sellerMap)) {
//     await Transaction.create({
//       order: order._id,
//       buyer: order.buyer,
//       seller,
//       type: 'sale',
//       amount,
//       platformFee: fee,
//       sellerAmount: sellerAmt,
//       paymentMethod: order.paymentMethod,
//       paymentStatus,
//       paystackReference: order.paystackReference,
//       items: items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price, subtotal: i.subtotal })),
//     });
//   }
// }

// // Keeps the transport_fee SettlementHistory row's rider/riderAmount aligned
// // with the order — a rider is frequently assigned (or the agreed delivery
// // fee finalized) after checkout already ran. Safe to call anytime; no-ops
// // if there's nothing to update. Also re-derives payoutStatus, since a rider
// // getting assigned can flip a row from 'not_applicable' to 'owed'.
// async function syncOrderRiderSettlement(order) {
//   if (!order.transportFee || order.transportFee <= 0) return;

//   const rider = order.delivery?.assignedRider || null;
//   const riderAmount = order.delivery?.agreedDeliveryFee ?? order.transportFee;

//   const rows = await SettlementHistory.find({ order: order._id, type: 'transport_fee' });
//   for (const row of rows) {
//     // Don't clobber a row that's already been paid out or attempted.
//     if (['paid', 'payout_failed'].includes(row.payoutStatus)) {
//       row.rider = rider;
//       row.riderAmount = riderAmount;
//       await row.save();
//       continue;
//     }
//     row.rider = rider;
//     row.riderAmount = riderAmount;
//     row.payoutStatus = computeInitialPayoutStatus({ type: 'transport_fee', riderAmount });
//     await row.save();
//   }
// }

// // Writes the initial (pending) settlement-history rows at checkout time —
// // one per seller's sale share, one for the platform fee, one for the
// // transport fee. This is the audit trail the split/transfer logic later
// // updates to 'completed' or 'failed'.
// //
// // IMPORTANT: uses insertMany(), which does NOT run the model's pre('save')
// // hook — so payoutStatus is computed explicitly per-row here via
// // computeInitialPayoutStatus(), rather than relying on the hook.
// async function recordCheckoutSettlementHistory({
//   order,
//   settlementPlan,
//   transportFee,
//   usedSplit,
//   splitBuildError,
//   paymentMethod,
//   cashPending = false,
// }) {
//   const rows = [];

//   for (const entry of settlementPlan) {
//     const paidDirect = usedSplit && entry.eligibleForDirectPayout;
//     const destination = paidDirect ? 'seller_subaccount' : 'estore';
//     const method = cashPending ? 'cash_pending' : (paidDirect ? 'split' : 'fallback_main_account');

//     rows.push({
//       order: order._id,
//       seller: entry.seller,
//       type: 'sale_share',
//       amount: entry.sellerAmount,
//       destination,
//       method,
//       status: 'pending',
//       payoutStatus: computeInitialPayoutStatus({ type: 'sale_share', destination, method }),
//       paymentMethod,
//       paystackReference: order.paystackReference,
//       error: !usedSplit ? splitBuildError : undefined,
//     });
//   }

//   rows.push({
//     order: order._id,
//     seller: null,
//     type: 'platform_fee',
//     amount: order.totalPlatformFee,
//     destination: 'estore',
//     method: cashPending ? 'cash_pending' : 'fallback_main_account',
//     status: 'pending',
//     payoutStatus: 'not_applicable', // platform fee is the estore's own revenue — never owed out
//     paymentMethod,
//     paystackReference: order.paystackReference,
//   });

//   if (transportFee > 0) {
//     const riderAmount = order.delivery?.agreedDeliveryFee ?? transportFee;
//     rows.push({
//       order: order._id,
//       seller: null,
//       // A rider usually isn't assigned yet at checkout — this gets synced
//       // in later via syncOrderRiderSettlement once one is.
//       rider: order.delivery?.assignedRider || null,
//       riderAmount,
//       type: 'transport_fee',
//       amount: transportFee,
//       destination: 'estore', // the fee is collected into the estore account...
//       method: cashPending ? 'cash_pending' : 'fallback_main_account',
//       status: 'pending',
//       payoutStatus: computeInitialPayoutStatus({ type: 'transport_fee', riderAmount }),
//       paymentMethod,
//       paystackReference: order.paystackReference,
//     });
//   }

//   if (rows.length) await SettlementHistory.insertMany(rows);
// }

// // Legacy Transfer-API payout path — used only for pay-on-delivery/pickup
// // orders (money never passed through a Paystack transaction, so there's no
// // split to rely on). Only fires for super-verified sellers with a payout
// // recipient on file; everyone else's share is recorded as owed to estore.
// //
// // Uses .create() throughout, so the model's pre('save') hook already
// // computes payoutStatus correctly here — no explicit override needed,
// // though 'paid'-via-transfer rows are explicitly marked not_applicable
// // since the transfer already happened in the same call.
// async function settleCashOrderPayouts(order) {
//   const sellerMap = {};
//   for (const item of order.items) {
//     const sid = item.seller.toString();
//     if (!sellerMap[sid]) sellerMap[sid] = { seller: item.seller, sellerAmt: 0 };
//     sellerMap[sid].sellerAmt += item.sellerAmount;
//   }

//   for (const { seller, sellerAmt } of Object.values(sellerMap)) {
//     const sellerDoc = await User.findById(seller);
//     const isSuperVerify = !!sellerDoc?.sellerProfile?.isSuperVerify;
//     const recipientCode = sellerDoc?.sellerProfile?.bankDetails?.recipientCode;

//     if (!isSuperVerify || !recipientCode) {
//       await SettlementHistory.create({
//         order: order._id,
//         seller,
//         type: 'sale_share',
//         amount: sellerAmt,
//         destination: 'estore',
//         method: 'cash_pending',
//         status: 'completed',
//         payoutStatus: 'owed', // sitting in estore, still owed to this seller
//         paymentMethod: 'on_delivery',
//       });
//       continue;
//     }

//     try {
//       const transferRes = await axios.post(
//         'https://api.paystack.co/transfer',
//         {
//           source: 'balance',
//           amount: Math.round(sellerAmt * 100),
//           recipient: recipientCode,
//           reason: `Payment for order ${order.orderNumber}`,
//         },
//         { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
//       );

//       await Order.updateOne(
//         { _id: order._id, 'items.seller': seller },
//         {
//           $set: {
//             'items.$[elem].transferStatus': 'completed',
//             'items.$[elem].paystackTransferCode': transferRes.data.data.transfer_code,
//           },
//         },
//         { arrayFilters: [{ 'elem.seller': seller }] }
//       );

//       await SettlementHistory.create({
//         order: order._id,
//         seller,
//         type: 'sale_share',
//         amount: sellerAmt,
//         destination: 'seller_subaccount',
//         method: 'transfer',
//         status: 'completed',
//         payoutStatus: 'paid', // already sent — nothing left for an admin to do
//         payoutReference: transferRes.data.data.transfer_code,
//         payoutAmount: sellerAmt,
//         paidAt: new Date(),
//         paymentMethod: 'on_delivery',
//         paystackTransferCode: transferRes.data.data.transfer_code,
//       });
//     } catch (err) {
//       console.error(`Transfer failed for seller ${seller}:`, err.message);
//       await SettlementHistory.create({
//         order: order._id,
//         seller,
//         type: 'sale_share',
//         amount: sellerAmt,
//         destination: 'estore',
//         method: 'cash_pending',
//         status: 'failed',
//         payoutStatus: 'payout_failed', // shows up with a "Retry payout" button in admin
//         payoutError: err?.response?.data?.message || err.message,
//         paymentMethod: 'on_delivery',
//         error: err?.response?.data?.message || err.message,
//       });
//     }
//   }

//   // Transport fee on a cash order stays with whoever physically collected
//   // it — recorded here purely for the audit trail.
//   if (order.transportFee > 0) {
//     const riderAmount = order.delivery?.agreedDeliveryFee ?? order.transportFee;
//     await SettlementHistory.create({
//       order: order._id,
//       seller: null,
//       rider: order.delivery?.assignedRider || null,
//       riderAmount,
//       type: 'transport_fee',
//       amount: order.transportFee,
//       destination: 'estore',
//       method: 'cash_pending',
//       status: 'completed',
//       payoutStatus: computeInitialPayoutStatus({ type: 'transport_fee', riderAmount }),
//       paymentMethod: 'on_delivery',
//     });
//   }
// }

// // ── ESTIMATE (delivery fee preview, no order created) ──────
// export const estimateCheckout = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     const buyer = await User.findById(req.user._id);
//     if (!buyer) return res.status(400).json({ message: 'Buyer not found' });

//     const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

//     // Group sellers so we can check super-verify + compute transport fee
//     const sellerIds = [...new Set(cart.items.map(i => i.seller.toString()))];
//     const sellers = await User.find({ _id: { $in: sellerIds } });
//     const sellerMap = new Map(sellers.map(s => [s._id.toString(), s]));

//     let transportFee = 0;
//     let transportFeeDetails = null;

//     if (cart.fulfillmentType === 'delivery') {
//       const breakdown = [];
//       for (const sid of sellerIds) {
//         const sellerDoc = sellerMap.get(sid);
//         const { fee, distanceKm, source } = await computeTransportFee({
//           buyerState: buyer.state,
//           buyerLga: buyer.lga,
//           sellerState: sellerDoc?.state,
//           sellerLga: sellerDoc?.lga,
//         });
//         transportFee += fee;
//         breakdown.push({ seller: sid, distanceKm, fee, source });
//       }
//       transportFeeDetails = {
//         ratePerKm: Number(process.env.TRANSPORT_RATE_PER_KM || 100),
//         baseFee: Number(process.env.TRANSPORT_BASE_FEE || 500),
//         breakdown,
//       };
//     }

//     // Buyer-facing signal: will sellers be paid instantly via split?
//     const sellerPayoutInfo = sellerIds.map(sid => {
//       const s = sellerMap.get(sid);
//       return {
//         seller: sid,
//         superVerified: !!s?.sellerProfile?.isSuperVerify,
//         eligibleForSplit: !!s?.sellerProfile?.isSuperVerify && !!s?.sellerProfile?.bankDetails?.recipientCode,
//       };
//     });

//     res.json({
//       subtotal,
//       transportFee,
//       transportFeeDetails,
//       total: +(subtotal + transportFee).toFixed(2),
//       fulfillmentType: cart.fulfillmentType,
//       paymentMethod: cart.paymentMethod,
//       sellerPayoutInfo,
//     });
//   } catch (err) {
//     console.error('Estimate error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };








import axios from 'axios';
import crypto from 'crypto';
import Cart from '../../models/order/Cart.js';
import Order from '../../models/order/Order.js';

import Product from "../../models/sellers/product.js"
import Transaction from '../../models/order/Transaction.js';
import Loyalty from '../../models/order/Loyalty.js';
import SettlementHistory, { computeInitialPayoutStatus } from '../../models/order/settlementHistory.js';

import User from "../../models/user.js"
import { computeTransportFee } from '../../utills/Distance.js';
import { buildSellerSettlementPlan } from '../../utills/paystacksplitService.js';
import { buildDynamicSplit } from '../../utills/paystacksplitService.js';
import Settings from '../../models/setting.js';
import { validateRedemption, allocateLoyaltyAcrossCart,
  groupAllocationsBySeller, } from '../../utills/coreLoyaltyAllocation.js';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PLATFORM_FEE_RATE = 0.01; // 1%

const generateVerificationCode = () => String(Math.floor(1000 + Math.random() * 9000));

// ── CHECKOUT ────────────────────────────────────────────────
// Body may include: { pointsToRedeem: 1500 }  (optional)
export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const buyer = await User.findById(req.user._id);
    if (!buyer) return res.status(400).json({ message: 'Buyer not found' });

    // Validate stock & payment method, capture seller info as we go
    const sellerCache = new Map(); // sellerId -> full seller User doc
    let orderSellerId; // top-level order.seller (assumes single-seller cart)

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== 'active') {
        return res.status(400).json({ message: `${item.name} is no longer available` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }

      const sellerId = item.seller.toString();
      let seller = sellerCache.get(sellerId);
      if (!seller) {
        seller = await User.findById(item.seller);
        sellerCache.set(sellerId, seller);
      }

      // if (cart.paymentMethod === 'on_delivery' && !seller?.acceptsPaymentOnDelivery) {
      //   return res.status(400).json({
      //     message: `Seller of "${item.name}" does not accept payment on delivery`,
      //   });
      // }

      // capture the seller for the order (last one wins if cart somehow has more than one)
      orderSellerId = seller?._id;
    }

    // Build order items with fee calculations, and group by seller (needed
    // for both settlement planning and per-seller transport-fee distance).
    let totalAmount = 0;
    let totalPlatformFee = 0;
    const sellerGroups = {};

    const orderItems = cart.items.map(item => {
      const subtotal = item.price * item.quantity;
      const platformFee = +(subtotal * PLATFORM_FEE_RATE).toFixed(2);
      const sellerAmount = +(subtotal - platformFee).toFixed(2);
      totalAmount += subtotal;
      totalPlatformFee += platformFee;

      const sid = item.seller.toString();
      if (!sellerGroups[sid]) {
        sellerGroups[sid] = { seller: item.seller, amount: 0, fee: 0, sellerAmt: 0 };
      }
      sellerGroups[sid].amount += subtotal;
      sellerGroups[sid].fee += platformFee;
      sellerGroups[sid].sellerAmt += sellerAmount;

      return {
        product: item.product._id,
        seller: item.seller,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal,
        platformFee,
        sellerAmount,
      };
    });

    // ── LOYALTY REDEMPTION ──────────────────────────────────────
    // Re-validate server-side even though estimate() previewed this —
    // never trust a client-supplied discount amount.
    let loyaltyDiscount = 0;
    let loyaltyPointsUsed = 0;
    let loyaltyAllocations = [];
    let loyaltyDoc = null;

    const pointsToRedeem = Number(req.body.pointsToRedeem || 0);
    if (pointsToRedeem > 0) {
      const settings = await Settings.findOne({ key: 'global' });
      const globalEnabled = !!settings?.allowLoyaltyUsage;
      const userEnabled = buyer.loyaltyUsageAllowed !== false;

      loyaltyDoc = await Loyalty.findOne({ user: buyer._id });
      const availablePoints = loyaltyDoc ? loyaltyDoc.totalPoints - loyaltyDoc.usedPoints : 0;

      const validation = validateRedemption({
        pointsRequested: pointsToRedeem,
        availablePoints,
        cartSubtotal: totalAmount,
        globalEnabled,
        userEnabled,
      });

      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const { allocations, totalAllocated } = allocateLoyaltyAcrossCart(cart.items, validation.valueNGN);
      loyaltyDiscount = totalAllocated;
      loyaltyPointsUsed = Math.round(totalAllocated / 1000);
      loyaltyAllocations = allocations;

      // Deduct points now — reserved for this order.
      loyaltyDoc.usedPoints += loyaltyPointsUsed;
      loyaltyDoc.history.push({
        type: 'spent',
        points: loyaltyPointsUsed,
        description: `Redeemed at checkout`,
      });
      await loyaltyDoc.save();
    }

    // ── TRANSPORT FEE (delivery orders only) ───────────────────
    let transportFee = 0;
    let transportFeeDetails = null;

    if (cart.fulfillmentType === 'delivery') {
      const breakdown = [];
      for (const sid of Object.keys(sellerGroups)) {
        const sellerDoc = sellerCache.get(sid);
        const { fee, distanceKm, source } = await computeTransportFee({
          buyerState: buyer.state,
          buyerLga: buyer.lga,
          sellerState: sellerDoc?.state,
          sellerLga: sellerDoc?.lga,
        });
        transportFee += fee;
        breakdown.push({ seller: sid, distanceKm, fee, source });
      }
      transportFeeDetails = {
        ratePerKm: Number(process.env.TRANSPORT_RATE_PER_KM || 100),
        baseFee: Number(process.env.TRANSPORT_BASE_FEE || 500),
        source: breakdown[0]?.source,
        breakdown,
      };
    }

    // ── VERIFICATION CODE (pickup AND delivery, per seller request) ──
    const verificationCode = generateVerificationCode();

    // Create order
    const order = new Order({
      buyer: req.user._id,
      seller: orderSellerId,
      items: orderItems,
      fulfillmentType: cart.fulfillmentType,
      pickup: {
        ...cart.pickup,
        code: cart.fulfillmentType === 'pickup' ? verificationCode : undefined,
        isCodeVerified: false,
      },
      delivery: {
        address: cart.delivery?.address,
        deliveryCode: cart.fulfillmentType === 'delivery' ? verificationCode : undefined,
        isCodeVerified: false,
      },
      transportFee,
      transportFeeDetails,
      paymentMethod: cart.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      // Loyalty reduces what the BUYER pays, but never reduces what sellers
      // are ultimately owed — that gap is tracked via loyalty_redemption rows.
      totalAmount: +(totalAmount + transportFee - loyaltyDiscount).toFixed(2),
      totalPlatformFee: +totalPlatformFee.toFixed(2),
      totalSellerAmount: +(totalAmount - totalPlatformFee).toFixed(2),
      loyaltyPointsUsed,
      loyaltyDiscount,
    });

    await order.save();

    // Settlement plan: who's eligible for direct-to-seller payout
    const settlementPlan = buildSellerSettlementPlan(sellerGroups, sellerCache);

    // If paying online, initialize Paystack (with split when possible)
    if (cart.paymentMethod === 'online') {
      const chargeAmountKobo = Math.round(order.totalAmount * 100);
      const basePayload = {
        email: buyer.email || buyer.alternateContact,
        amount: chargeAmountKobo,
        reference: `ORD-${order._id}-${Date.now()}`,
        metadata: { orderId: order._id.toString() },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      };

      let paystackRes;
      let usedSplit = false;
      let splitBuildError = null;

      // Attempt a split-enabled charge first (direct-to-seller for eligible
      // sellers); fall back to a plain charge into the estore account if
      // anything about the split goes wrong, so checkout is never blocked.
      const splitPayload = buildDynamicSplit(settlementPlan);
      if (splitPayload) {
        try {
          paystackRes = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            { ...basePayload, split: splitPayload },
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
          );
          usedSplit = true;
        } catch (err) {
          splitBuildError = err?.response?.data?.message || err.message;
          paystackRes = null;
        }
      }

      if (!paystackRes) {
        try {
          paystackRes = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            basePayload,
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
          );
          usedSplit = false;
        } catch (err) {
          // Total Paystack outage — nothing we can do to get a payment link,
          // let the outer catch handle the 500.
          throw err;
        }
      }

      order.paystackReference = paystackRes.data.data.reference;
      order.paystackAccessCode = paystackRes.data.data.access_code;
      order.paystackSplitUsed = usedSplit;
      await order.save();

      await recordCheckoutSettlementHistory({
        order,
        settlementPlan,
        transportFee,
        usedSplit,
        splitBuildError,
        paymentMethod: 'online',
      });

      if (loyaltyAllocations.length) {
        await recordLoyaltySettlementHistory({
          order,
          buyer: buyer._id,
          allocations: loyaltyAllocations,
        });
      }

      // Reduce stock optimistically
      await decreaseStock(cart.items);

      return res.json({
        order,
        paymentUrl: paystackRes.data.data.authorization_url,
        reference: paystackRes.data.data.reference,
        transportFee,
        loyaltyDiscount,
        loyaltyPointsUsed,
        deliveryCode: order.fulfillmentType === 'delivery' ? verificationCode : null,
        pickupCode: order.fulfillmentType === 'pickup' ? verificationCode : null,
      });
    }

    // Pay on delivery / pickup — just confirm order, money settles on code verification
    await decreaseStock(cart.items);
    order.status = 'confirmed';
    await order.save();

    // Create transaction record
    await createTransaction(order, 'pending');

    await recordCheckoutSettlementHistory({
      order,
      settlementPlan,
      transportFee,
      usedSplit: false,
      splitBuildError: null,
      paymentMethod: 'on_delivery',
      cashPending: true,
    });

    if (loyaltyAllocations.length) {
      await recordLoyaltySettlementHistory({
        order,
        buyer: buyer._id,
        allocations: loyaltyAllocations,
      });
    }

    await Cart.findOneAndDelete({ buyer: req.user._id });

    res.json({
      order,
      transportFee,
      loyaltyDiscount,
      loyaltyPointsUsed,
      deliveryCode: order.fulfillmentType === 'delivery' ? verificationCode : null,
      pickupCode: order.fulfillmentType === 'pickup' ? verificationCode : null,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ── PAYSTACK VERIFY ────────────────────────────────────────
// GET /orders/verify-payment/:reference

/**
 * @swagger
 * /api/orders/verify-payment/{reference}:
 *   get:
 *     summary: Verify a Paystack payment and finalize the order
 *     description: >
 *       Confirms the transaction with Paystack, marks the order paid/confirmed, awards
 *       loyalty points (1 point per ₦1000), creates the seller transaction, reconciles
 *       split settlement history, and clears the buyer's cart.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack transaction reference
 *     responses:
 *       200:
 *         description: Payment verified and order finalized
 *       400:
 *         description: Payment was not successful
 *       404:
 *         description: No order found for this reference
 */

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    const data = paystackRes.data.data;

    if (data.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const order = await Order.findOne({ paystackReference: reference });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await finalizeOnlinePayment(order, data);

    res.json({ message: 'Payment verified', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PAYSTACK WEBHOOK ───────────────────────────────────────
// POST /orders/webhook

/**
 * @swagger
 * /api/orders/webhook:
 *   post:
 *     summary: Paystack webhook — auto-confirms orders on charge.success
 *     description: >
 *       Not authenticated with a bearer token. Instead verifies the `x-paystack-signature`
 *       header against an HMAC SHA-512 hash of the raw body, using PAYSTACK_SECRET_KEY.
 *       Mounted **before** `router.use(verifyToken)` in orderRoutes.js.
 *     tags: [Orders]
 *     security: []
 *     responses:
 *       200:
 *         description: Event received and processed (or ignored if not charge.success)
 *       401:
 *         description: Signature mismatch
 */

export const paystackWebhook = async (req, res) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    const order = await Order.findOne({ paystackReference: reference });
    if (order && order.paymentStatus !== 'paid') {
      await finalizeOnlinePayment(order, event.data);
    }
  }
  res.sendStatus(200);
};

// Shared by verifyPayment + the webhook so both paths behave identically.
async function finalizeOnlinePayment(order, paystackData) {
  order.paymentStatus = 'paid';
  order.status = 'confirmed';

  const points = Math.floor(order.totalAmount / 10000);
  await awardLoyalty(order.buyer, points, order._id);
  order.loyaltyPointsAwarded = points;
  await order.save();

  await createTransaction(order, 'completed');

  // Reconcile settlement history against what Paystack actually did. If a
  // split was used, `paystackData.split` tells us the real per-account
  // breakdown; store it for the record either way.
  await SettlementHistory.updateMany(
    { order: order._id, status: 'pending' },
    {
      $set: {
        status: 'completed',
        meta: paystackData.split || null,
      },
    }
  );

  // Note: sellers paid via Paystack split are settled automatically by
  // Paystack — no manual Transfer call needed for them (their rows were
  // written with payoutStatus 'not_applicable' at checkout time). Sellers
  // who weren't eligible for direct payout keep payoutStatus 'owed' from
  // checkout, and now show up on the admin settlements dashboard for a
  // manual payout.

  await Cart.findOneAndDelete({ buyer: order.buyer });
}

// ── DELIVERY / PICKUP CODE VERIFY ──────────────────────────
// POST /orders/:orderId/verify-delivery
/**
 * @swagger
 * /api/orders/{orderId}/verify-delivery:
 *   post:
 *     summary: Verify the delivery or pickup code to complete an order
 *     description: >
 *       Works for both fulfillment types — checks delivery.deliveryCode for delivery
 *       orders and pickup.code for pickup orders. If the order was pay-on-delivery/
 *       pay-on-pickup and unpaid, this also marks it paid, awards loyalty points,
 *       creates the transaction, and (for super-verified sellers with a payout
 *       account) initiates their transfer — logging everything to settlement history.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "4821"
 *     responses:
 *       200:
 *         description: Order completed
 *       400:
 *         description: The code is invalid
 *       404:
 *         description: Order not found
 */

export const verifyDeliveryCode = async (req, res) => {
  try {
    const { code } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isDelivery = order.fulfillmentType === 'delivery';
    const expectedCode = isDelivery ? order.delivery.deliveryCode : order.pickup.code;

    if (!expectedCode || expectedCode !== code) {
      return res.status(400).json({ message: 'Invalid code' });
    }

    if (isDelivery) {
      order.delivery.isCodeVerified = true;
    } else {
      order.pickup.isCodeVerified = true;
    }
    order.status = 'delivered';

    // Award loyalty + settle sellers if this was pay-on-delivery/pickup
    if (order.paymentMethod === 'on_delivery' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      const points = Math.floor(order.totalAmount / 1000);
      await awardLoyalty(order.buyer, points, order._id);
      order.loyaltyPointsAwarded = points;
      await createTransaction(order, 'completed');
      await settleCashOrderPayouts(order);
    }

    await order.save();
    await syncOrderRiderSettlement(order);
    res.json({ message: 'Order completed', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     description: Only accessible to the buyer on the order, or a seller with at least one item in it.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 *       403:
 *         description: Not the buyer or a seller on this order
 *       404:
 *         description: Order not found
 */

// ── GET SINGLE ORDER ───────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyer', 'firstName lastName email phoneNumber')
      .populate('seller', 'firstName lastName email phoneNumber businessName businessAddress address')
      .populate('items.product', 'name images price')
      .populate('items.seller', 'firstName lastName shopName phoneNumber email businessName');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only buyer or seller can view
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
    if (!isBuyer && !isSeller) return res.status(403).json({ message: 'Forbidden' });
    console.log(order)
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get the authenticated buyer's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the buyer's orders, newest first
 */
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name images')
      .populate('seller', 'firstName lastName email phoneNumber businessName businessAddress address state lga alternateContact')
      .populate('delivery.assignedRider', 'firstName lastName phoneNumber')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SELLER ORDER MANAGEMENT ───────────────────────────────

/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: Get orders containing the authenticated seller's items
 *     description: >
 *       Requires the `sellerOnly` middleware. Each order is filtered down to only the
 *       items belonging to this seller, and `sellerInfo` is attached at the order level.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in_progress, delivered, cancelled]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [online, on_delivery]
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Orders containing this seller's items, filtered to just their items
 */

export const getSellerOrders = async (req, res) => {
  try {
    const { status, paymentMethod, from, to } = req.query;

    const match = {
      'items.seller': req.user._id
    };

    if (status) match.status = status;
    if (paymentMethod) match.paymentMethod = paymentMethod;
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(match)
      .populate('buyer', 'firstName lastName email phoneNumber')
      .populate({
        path: 'items.seller',
        select: 'firstName lastName email phoneNumber businessName state lga businessAddress phoneNumber'
      })
      .populate('items.product', 'name images price')
      .populate('delivery.assignedRider', 'firstName lastName phoneNumber')
      .sort({ createdAt: -1 });

    // Filter to only this seller's items and clean up response
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject({ getters: true });

      const sellerItems = orderObj.items.filter(item =>
        item.seller &&
        (typeof item.seller === 'string'
          ? item.seller === req.user._id.toString()
          : item.seller._id.toString() === req.user._id.toString())
      );

      return {
        ...orderObj,
        items: sellerItems.map(item => ({
          ...item,
          seller: item.seller
        })),
        sellerInfo: sellerItems[0]?.seller || null
      };
    });

    res.json(filteredOrders);

  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/orders/{orderId}/settlement-history:
 *   get:
 *     summary: Get the full settlement/payout audit trail for an order
 *     description: >
 *       Every movement of money for this order — seller shares, platform fee,
 *       transport fee, loyalty redemption — with its destination (seller_subaccount vs
 *       estore), method (split/transfer/fallback/cash_pending/loyalty_points) and status.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Settlement history rows for the order
 *       403:
 *         description: Not the buyer or a seller on this order
 *       404:
 *         description: Order not found
 */
export const getOrderSettlementHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';
    if (!isBuyer && !isSeller && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

    // Keep the transport_fee row's rider/riderAmount current — a rider is
    // often assigned or the agreed fee is set after checkout already happened.
    await syncOrderRiderSettlement(order);

    const history = await SettlementHistory.find({ order: order._id })
      .sort({ createdAt: 1 })
      .populate('seller', 'firstName lastName shopName')
      .populate('rider', 'firstName lastName phoneNumber riderProfile.vehicleType');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── HELPERS ────────────────────────────────────────────────
async function decreaseStock(items) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product._id || item.product, {
      $inc: { stockQuantity: -item.quantity, sold: item.quantity },
    });
    // Update status if out of stock
    const p = await Product.findById(item.product._id || item.product);
    if (p && p.stockQuantity <= 0) {
      p.status = 'out_of_stock';
      await p.save();
    }
  }
}

async function awardLoyalty(userId, points, orderId) {
  let loyalty = await Loyalty.findOne({ user: userId });
  if (!loyalty) loyalty = new Loyalty({ user: userId });
  loyalty.totalPoints += points;
  loyalty.history.push({ type: 'earned', points, order: orderId, description: `Earned from order` });
  await loyalty.save();
}

async function createTransaction(order, paymentStatus) {
  // Group items by seller
  const sellerMap = {};
  for (const item of order.items) {
    const sid = item.seller.toString();
    if (!sellerMap[sid]) sellerMap[sid] = { seller: item.seller, items: [], amount: 0, fee: 0, sellerAmt: 0 };
    sellerMap[sid].items.push(item);
    sellerMap[sid].amount += item.subtotal;
    sellerMap[sid].fee += item.platformFee;
    sellerMap[sid].sellerAmt += item.sellerAmount;
  }

  for (const { seller, items, amount, fee, sellerAmt } of Object.values(sellerMap)) {
    await Transaction.create({
      order: order._id,
      buyer: order.buyer,
      seller,
      type: 'sale',
      amount,
      platformFee: fee,
      sellerAmount: sellerAmt,
      paymentMethod: order.paymentMethod,
      paymentStatus,
      paystackReference: order.paystackReference,
      items: items.map(i => ({ product: i.product, name: i.name, quantity: i.quantity, price: i.price, subtotal: i.subtotal })),
    });
  }
}

// Keeps the transport_fee SettlementHistory row's rider/riderAmount aligned
// with the order — a rider is frequently assigned (or the agreed delivery
// fee finalized) after checkout already ran. Safe to call anytime; no-ops
// if there's nothing to update. Also re-derives payoutStatus, since a rider
// getting assigned can flip a row from 'not_applicable' to 'owed'.
async function syncOrderRiderSettlement(order) {
  if (!order.transportFee || order.transportFee <= 0) return;

  const rider = order.delivery?.assignedRider || null;
  const riderAmount = order.delivery?.agreedDeliveryFee ?? order.transportFee;

  const rows = await SettlementHistory.find({ order: order._id, type: 'transport_fee' });
  for (const row of rows) {
    // Don't clobber a row that's already been paid out or attempted.
    if (['paid', 'payout_failed'].includes(row.payoutStatus)) {
      row.rider = rider;
      row.riderAmount = riderAmount;
      await row.save();
      continue;
    }
    row.rider = rider;
    row.riderAmount = riderAmount;
    row.payoutStatus = computeInitialPayoutStatus({ type: 'transport_fee', riderAmount });
    await row.save();
  }
}

// Writes the initial (pending) settlement-history rows at checkout time —
// one per seller's sale share, one for the platform fee, one for the
// transport fee. This is the audit trail the split/transfer logic later
// updates to 'completed' or 'failed'.
//
// IMPORTANT: uses insertMany(), which does NOT run the model's pre('save')
// hook — so payoutStatus is computed explicitly per-row here via
// computeInitialPayoutStatus(), rather than relying on the hook.
async function recordCheckoutSettlementHistory({
  order,
  settlementPlan,
  transportFee,
  usedSplit,
  splitBuildError,
  paymentMethod,
  cashPending = false,
}) {
  const rows = [];

  for (const entry of settlementPlan) {
    const paidDirect = usedSplit && entry.eligibleForDirectPayout;
    const destination = paidDirect ? 'seller_subaccount' : 'estore';
    const method = cashPending ? 'cash_pending' : (paidDirect ? 'split' : 'fallback_main_account');

    rows.push({
      order: order._id,
      seller: entry.seller,
      type: 'sale_share',
      amount: entry.sellerAmount,
      destination,
      method,
      status: 'pending',
      payoutStatus: computeInitialPayoutStatus({ type: 'sale_share', destination, method }),
      paymentMethod,
      paystackReference: order.paystackReference,
      error: !usedSplit ? splitBuildError : undefined,
    });
  }

  rows.push({
    order: order._id,
    seller: null,
    type: 'platform_fee',
    amount: order.totalPlatformFee,
    destination: 'estore',
    method: cashPending ? 'cash_pending' : 'fallback_main_account',
    status: 'pending',
    payoutStatus: 'not_applicable', // platform fee is the estore's own revenue — never owed out
    paymentMethod,
    paystackReference: order.paystackReference,
  });

  if (transportFee > 0) {
    const riderAmount = order.delivery?.agreedDeliveryFee ?? transportFee;
    rows.push({
      order: order._id,
      seller: null,
      // A rider usually isn't assigned yet at checkout — this gets synced
      // in later via syncOrderRiderSettlement once one is.
      rider: order.delivery?.assignedRider || null,
      riderAmount,
      type: 'transport_fee',
      amount: transportFee,
      destination: 'estore', // the fee is collected into the estore account...
      method: cashPending ? 'cash_pending' : 'fallback_main_account',
      status: 'pending',
      payoutStatus: computeInitialPayoutStatus({ type: 'transport_fee', riderAmount }),
      paymentMethod,
      paystackReference: order.paystackReference,
    });
  }

  if (rows.length) await SettlementHistory.insertMany(rows);
}

// Writes one settlement-history row PER SELLER whose goods were (partly)
// paid for via loyalty points, so admin knows exactly who to reconcile cash
// to and how much. `payoutStatus: 'owed'` means admin still owes this
// seller real money for the points-covered portion of their sale.
async function recordLoyaltySettlementHistory({ order, buyer, allocations }) {
  const bySeller = groupAllocationsBySeller(allocations);
  const rows = bySeller.map(group => ({
    order: order._id,
    buyer,
    seller: group.seller,
    type: 'loyalty_redemption',
    amount: group.totalCovered,
    loyaltyValueNGN: group.totalCovered,
    loyaltyPointsUsed: Math.round(group.totalCovered / 1000),
    destination: 'estore', // points redemption is absorbed by the platform, not paystack
    method: 'loyalty_points',
    status: 'completed', // the redemption itself is done; payoutStatus tracks the CASH owed
    payoutStatus: 'owed',
    paymentMethod: order.paymentMethod,
  }));
  if (rows.length) await SettlementHistory.insertMany(rows);
}

// Legacy Transfer-API payout path — used only for pay-on-delivery/pickup
// orders (money never passed through a Paystack transaction, so there's no
// split to rely on). Only fires for super-verified sellers with a payout
// recipient on file; everyone else's share is recorded as owed to estore.
//
// Uses .create() throughout, so the model's pre('save') hook already
// computes payoutStatus correctly here — no explicit override needed,
// though 'paid'-via-transfer rows are explicitly marked not_applicable
// since the transfer already happened in the same call.
async function settleCashOrderPayouts(order) {
  const sellerMap = {};
  for (const item of order.items) {
    const sid = item.seller.toString();
    if (!sellerMap[sid]) sellerMap[sid] = { seller: item.seller, sellerAmt: 0 };
    sellerMap[sid].sellerAmt += item.sellerAmount;
  }

  for (const { seller, sellerAmt } of Object.values(sellerMap)) {
    const sellerDoc = await User.findById(seller);
    const isSuperVerify = !!sellerDoc?.sellerProfile?.isSuperVerify;
    const recipientCode = sellerDoc?.sellerProfile?.bankDetails?.recipientCode;

    if (!isSuperVerify || !recipientCode) {
      await SettlementHistory.create({
        order: order._id,
        seller,
        type: 'sale_share',
        amount: sellerAmt,
        destination: 'estore',
        method: 'cash_pending',
        status: 'completed',
        payoutStatus: 'owed', // sitting in estore, still owed to this seller
        paymentMethod: 'on_delivery',
      });
      continue;
    }

    try {
      const transferRes = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: Math.round(sellerAmt * 100),
          recipient: recipientCode,
          reason: `Payment for order ${order.orderNumber}`,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      await Order.updateOne(
        { _id: order._id, 'items.seller': seller },
        {
          $set: {
            'items.$[elem].transferStatus': 'completed',
            'items.$[elem].paystackTransferCode': transferRes.data.data.transfer_code,
          },
        },
        { arrayFilters: [{ 'elem.seller': seller }] }
      );

      await SettlementHistory.create({
        order: order._id,
        seller,
        type: 'sale_share',
        amount: sellerAmt,
        destination: 'seller_subaccount',
        method: 'transfer',
        status: 'completed',
        payoutStatus: 'paid', // already sent — nothing left for an admin to do
        payoutReference: transferRes.data.data.transfer_code,
        payoutAmount: sellerAmt,
        paidAt: new Date(),
        paymentMethod: 'on_delivery',
        paystackTransferCode: transferRes.data.data.transfer_code,
      });
    } catch (err) {
      console.error(`Transfer failed for seller ${seller}:`, err.message);
      await SettlementHistory.create({
        order: order._id,
        seller,
        type: 'sale_share',
        amount: sellerAmt,
        destination: 'estore',
        method: 'cash_pending',
        status: 'failed',
        payoutStatus: 'payout_failed', // shows up with a "Retry payout" button in admin
        payoutError: err?.response?.data?.message || err.message,
        paymentMethod: 'on_delivery',
        error: err?.response?.data?.message || err.message,
      });
    }
  }

  // Transport fee on a cash order stays with whoever physically collected
  // it — recorded here purely for the audit trail.
  if (order.transportFee > 0) {
    const riderAmount = order.delivery?.agreedDeliveryFee ?? order.transportFee;
    await SettlementHistory.create({
      order: order._id,
      seller: null,
      rider: order.delivery?.assignedRider || null,
      riderAmount,
      type: 'transport_fee',
      amount: order.transportFee,
      destination: 'estore',
      method: 'cash_pending',
      status: 'completed',
      payoutStatus: computeInitialPayoutStatus({ type: 'transport_fee', riderAmount }),
      paymentMethod: 'on_delivery',
    });
  }
}

// ── ESTIMATE (delivery fee preview + optional loyalty redemption preview) ──
// GET /api/orders/estimate?pointsToRedeem=1500   (pointsToRedeem optional)
export const estimateCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const buyer = await User.findById(req.user._id);
    if (!buyer) return res.status(400).json({ message: 'Buyer not found' });

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Group sellers so we can check super-verify + compute transport fee
    const sellerIds = [...new Set(cart.items.map(i => i.seller.toString()))];
    const sellers = await User.find({ _id: { $in: sellerIds } });
    const sellerMap = new Map(sellers.map(s => [s._id.toString(), s]));

    let transportFee = 0;
    let transportFeeDetails = null;

    if (cart.fulfillmentType === 'delivery') {
      const breakdown = [];
      for (const sid of sellerIds) {
        const sellerDoc = sellerMap.get(sid);
        const { fee, distanceKm, source } = await computeTransportFee({
          buyerState: buyer.state,
          buyerLga: buyer.lga,
          sellerState: sellerDoc?.state,
          sellerLga: sellerDoc?.lga,
        });
        transportFee += fee;
        breakdown.push({ seller: sid, distanceKm, fee, source });
      }
      transportFeeDetails = {
        ratePerKm: Number(process.env.TRANSPORT_RATE_PER_KM || 100),
        baseFee: Number(process.env.TRANSPORT_BASE_FEE || 500),
        breakdown,
      };
    }

    // Buyer-facing signal: will sellers be paid instantly via split?
    const sellerPayoutInfo = sellerIds.map(sid => {
      const s = sellerMap.get(sid);
      return {
        seller: sid,
        superVerified: !!s?.sellerProfile?.isSuperVerify,
        eligibleForSplit: !!s?.sellerProfile?.isSuperVerify && !!s?.sellerProfile?.bankDetails?.recipientCode,
      };
    });

    // ── LOYALTY PREVIEW ────────────────────────────────────────
    const settings = await Settings.findOne({ key: 'global' });
    const globalEnabled = !!settings?.allowLoyaltyUsage;
    const userEnabled = buyer.loyaltyUsageAllowed !== false;

    const loyaltyDoc = await Loyalty.findOne({ user: buyer._id });
    const availablePoints = loyaltyDoc ? loyaltyDoc.totalPoints - loyaltyDoc.usedPoints : 0;

    const loyaltyInfo = {
      availablePoints,
      globalEnabled,
      userEnabled,
      minRedemptionPoints: 1000,
      eligible: globalEnabled && userEnabled && availablePoints >= 1000,
    };

    let loyaltyDiscount = 0;
    let loyaltyPointsUsed = 0;
    let loyaltyAllocationPreview = null;

    const pointsToRedeem = Number(req.query.pointsToRedeem || 0);
    if (pointsToRedeem > 0) {
      const validation = validateRedemption({
        pointsRequested: pointsToRedeem,
        availablePoints,
        cartSubtotal: subtotal,
        globalEnabled,
        userEnabled,
      });

      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }

      const { allocations, totalAllocated } = allocateLoyaltyAcrossCart(cart.items, validation.valueNGN);
      loyaltyDiscount = totalAllocated;
      loyaltyPointsUsed = Math.round(totalAllocated / 1000);
      loyaltyAllocationPreview = groupAllocationsBySeller(allocations);
    }

    const total = +(subtotal + transportFee - loyaltyDiscount).toFixed(2);

    res.json({
      subtotal,
      transportFee,
      transportFeeDetails,
      loyaltyDiscount,
      loyaltyPointsUsed,
      loyaltyAllocationPreview,
      total,
      fulfillmentType: cart.fulfillmentType,
      paymentMethod: cart.paymentMethod,
      sellerPayoutInfo,
      loyaltyInfo,
    });
  } catch (err) {
    console.error('Estimate error:', err);
    res.status(500).json({ message: err.message });
  }
};