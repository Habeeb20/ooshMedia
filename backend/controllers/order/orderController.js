import axios from 'axios';
import crypto from 'crypto';
import Cart from '../../models/order/Cart.js';
import Order from '../../models/order/Order.js';

import Product from "../../models/sellers/product.js"
import Transaction from '../../models/order/Transaction.js';
import Loyalty from '../../models/order/Loyalty.js';
import User from "../../models/user.js"


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PLATFORM_FEE_RATE = 0.01; // 1%

const generateDeliveryCode = () => String(Math.floor(1000 + Math.random() * 9000));


/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Checkout the authenticated buyer's cart and create an order
 *     description: >
 *       Validates stock and each seller's payment-method support, builds the order with
 *       per-item platform fee/seller amount, then either initializes a Paystack transaction
 *       (paymentMethod = "online") or confirms the order immediately (paymentMethod = "on_delivery").
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order created. Includes a Paystack payment URL when paying online.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 paymentUrl:
 *                   type: string
 *                   description: Only present when paymentMethod is "online"
 *                 reference:
 *                   type: string
 *                 deliveryCode:
 *                   type: string
 *                   description: 4-digit code the buyer shares with the rider on delivery
 *       400:
 *         description: Cart is empty, an item is out of stock, or the seller doesn't accept pay-on-delivery
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server or Paystack initialization error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock & payment method, capture seller info as we go
    const sellerCache = new Map(); // avoid refetching the same seller repeatedly
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

      if (cart.paymentMethod === 'on_delivery' && !seller?.acceptsPaymentOnDelivery) {
        return res.status(400).json({
          message: `Seller of "${item.name}" does not accept payment on delivery`,
        });
      }

      // capture the seller for the order (last one wins if cart somehow has more than one)
      orderSellerId = seller?._id;
    }

    // Build order items with fee calculations
    let totalAmount = 0;
    let totalPlatformFee = 0;
    const orderItems = cart.items.map(item => {
      const subtotal = item.price * item.quantity;
      const platformFee = +(subtotal * PLATFORM_FEE_RATE).toFixed(2);
      const sellerAmount = +(subtotal - platformFee).toFixed(2);
      totalAmount += subtotal;
      totalPlatformFee += platformFee;
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

    const deliveryCode = cart.fulfillmentType === 'delivery' ? generateDeliveryCode() : undefined;

    // Create order
    const order = new Order({
      buyer: req.user._id,
      seller: orderSellerId,
      items: orderItems,
      fulfillmentType: cart.fulfillmentType,
      pickup: cart.pickup,
      delivery: {
        address: cart.delivery?.address,
        deliveryCode,
        isCodeVerified: false,
      },
      paymentMethod: cart.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      totalAmount: +totalAmount.toFixed(2),
      totalPlatformFee: +totalPlatformFee.toFixed(2),
      totalSellerAmount: +(totalAmount - totalPlatformFee).toFixed(2),
    });

    await order.save();

    // If paying online, initialize Paystack
    if (cart.paymentMethod === 'online') {
      const buyer = await User.findById(req.user._id);

      const paystackRes = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: buyer.email || buyer.alternateContact,
          amount: Math.round(totalAmount * 100), // kobo
          reference: `ORD-${order._id}-${Date.now()}`,
          metadata: { orderId: order._id.toString() },
          callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      order.paystackReference = paystackRes.data.data.reference;
      order.paystackAccessCode = paystackRes.data.data.access_code;
      await order.save();

      // Reduce stock optimistically
      await decreaseStock(cart.items);

      return res.json({
        order,
        paymentUrl: paystackRes.data.data.authorization_url,
        reference: paystackRes.data.data.reference,
        deliveryCode: order.fulfillmentType === 'delivery' ? deliveryCode : null,
      });
    }

    // Pay on delivery — just confirm order
    await decreaseStock(cart.items);
    order.status = 'confirmed';
    await order.save();

    // Create transaction record
    await createTransaction(order, 'pending');

    await Cart.findOneAndDelete({ buyer: req.user._id });

    res.json({
      order,
      deliveryCode: order.fulfillmentType === 'delivery' ? deliveryCode : null,
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
 *       loyalty points (1 point per ₦100), creates the seller transaction, kicks off
 *       seller transfers, and clears the buyer's cart.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Payment was not successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No order found for this reference
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    // Award loyalty points (1 point per ₦100)
    const points = Math.floor(order.totalAmount / 100);
    await awardLoyalty(order.buyer, points, order._id);
    order.loyaltyPointsAwarded = points;
    await order.save();

    // Create transaction + initiate seller transfers
    await createTransaction(order, 'completed');
    await initiateSellerTransfers(order);

    // Clear cart
    await Cart.findOneAndDelete({ buyer: order.buyer });

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
 *     parameters:
 *       - in: header
 *         name: x-paystack-signature
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Paystack event payload
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
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();
      await awardLoyalty(order.buyer, Math.floor(order.totalAmount / 100), order._id);
      await createTransaction(order, 'completed');
      await initiateSellerTransfers(order);
      await Cart.findOneAndDelete({ buyer: order.buyer });
    }
  }
  res.sendStatus(200);
};

// ── DELIVERY CODE VERIFY ───────────────────────────────────
// POST /orders/:orderId/verify-delivery
/**
 * @swagger
 * /api/orders/{orderId}/verify-delivery:
 *   post:
 *     summary: Verify the delivery code to mark an order as delivered
 *     description: >
 *       If the order was pay-on-delivery and unpaid, this also marks it paid, awards
 *       loyalty points, creates the transaction, and kicks off seller transfers.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Delivery confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Not a delivery order, or the code is invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export const verifyDeliveryCode = async (req, res) => {
  try {
    const { code } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.fulfillmentType !== 'delivery') {
      return res.status(400).json({ message: 'This order is not a delivery order' });
    }
    if (order.delivery.deliveryCode !== code) {
      return res.status(400).json({ message: 'Invalid delivery code' });
    }
    order.delivery.isCodeVerified = true;
    order.status = 'delivered';

    // Award loyalty if pay-on-delivery
    if (order.paymentMethod === 'on_delivery' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      const points = Math.floor(order.totalAmount / 100);
      await awardLoyalty(order.buyer, points, order._id);
      order.loyaltyPointsAwarded = points;
      await createTransaction(order, 'completed');
      await initiateSellerTransfers(order);
    }

    await order.save();
    res.json({ message: 'Delivery confirmed', order });
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       403:
 *         description: Not the buyer or a seller on this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// ── GET SINGLE ORDER ───────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('buyer', 'firstName lastName email phoneNumber')
      .populate('items.product', 'name images price')
      .populate('items.seller', 'firstName lastName shopName');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only buyer or seller can view
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller._id.toString() === req.user._id.toString());
    if (!isBuyer && !isSeller) return res.status(403).json({ message: 'Forbidden' });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
       .populate('items.product', 'name images')
      .populate('delivery.assignedRider', 'firstName lastName phoneNumber')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ── SELLER ORDER MANAGEMENT ───────────────────────────────


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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
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
        path: 'items.seller',                    // ← This is the key
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
          seller: item.seller   // Now this should be the full populated object
        })),
        // Optional: Attach seller info at order level
        sellerInfo: sellerItems[0]?.seller || null
      };
    });

    // console.log("Populated Orders:", JSON.stringify(filteredOrders, null, 2)); // For debugging
    res.json(filteredOrders);

  } catch (err) {
    console.error("Error fetching seller orders:", err);
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

async function initiateSellerTransfers(order) {
  // Group items by seller
  const sellerMap = {};
  for (const item of order.items) {
    const sid = item.seller.toString();
    if (!sellerMap[sid]) sellerMap[sid] = { seller: item.seller, sellerAmt: 0 };
    sellerMap[sid].sellerAmt += item.sellerAmount;
  }

  for (const { seller, sellerAmt } of Object.values(sellerMap)) {
    try {
      const sellerDoc = await User.findById(seller);
      if (!sellerDoc?.bankDetails?.recipientCode) continue;

      const transferRes = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: Math.round(sellerAmt * 100),
          recipient: sellerDoc.bankDetails.recipientCode,
          reason: `Payment for order ${order.orderNumber}`,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      // Update item transfer status
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
    } catch (err) {
      console.error(`Transfer failed for seller ${seller}:`, err.message);
    }
  }
}



















































