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

// ── CHECKOUT ───────────────────────────────────────────────
// POST /orders/checkout
export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock & payment method
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== 'active') {
        return res.status(400).json({ message: `${item.name} is no longer available` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }

      // Check seller's accepted payment methods
      const seller = await User.findById(item.seller);
      if (cart.paymentMethod === 'on_delivery' && !seller?.acceptsPaymentOnDelivery) {
        return res.status(400).json({
          message: `Seller of "${item.name}" does not accept payment on delivery`,
        });
      }
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
      seller:seller?._id,
      items: orderItems,
      fulfillmentType: cart.fulfillmentType,
      pickup: cart.pickup,
      delivery: {
        address: cart.delivery?.address,
        deliveryCode,
        isCodeVerified: false,
      },
      paymentMethod: cart.paymentMethod,
      paymentStatus: cart.paymentMethod === 'on_delivery' ? 'pending' : 'pending',
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

// ── GET BUYER ORDERS ───────────────────────────────────────
export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

// ── SELLER ORDER MANAGEMENT ───────────────────────────────
// export const getSellerOrders = async (req, res) => {
//   try {
//     const { status, paymentMethod, from, to } = req.query;
//     const match = { 'items.seller': req.user._id };
//     if (status) match.status = status;
//     if (paymentMethod) match.paymentMethod = paymentMethod;
//     if (from || to) {
//       match.createdAt = {};
//       if (from) match.createdAt.$gte = new Date(from);
//       if (to) match.createdAt.$lte = new Date(to);
//     }

//     const orders = await Order.find(match)
//       .populate('buyer', 'firstName lastName email phoneNumber')
//       .populate('items.product', 'name images')
//       .populate('items.seller', 'firstName lastName email phoneNumber businessName state lga businessAddress')
//       .sort({ createdAt: -1 });
// console.log(orders.items?.seller)
//     // Only include items that belong to this seller
//     const filtered = orders.map(o => ({
//       ...o.toObject(),
//       items: o.items.filter(i => i.seller.toString() === req.user._id.toString()),
//     }));

//     res.json(filtered);
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ message: err.message });
//   }
// };

// ── SELLER ORDER MANAGEMENT ───────────────────────────────
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











































// import { useState, useEffect } from 'react';
// import { useCart } from '../../context/CartContext';
// import { useNavigate } from 'react-router-dom';
// import api from "../../config/api";

// const PLATFORM_FEE_RATE = 0.01; // 1%

// export default function CheckoutPage() {
//   const cartHook = useCart();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const cart = cartHook?.cart || null;
//   const cartTotal = cartHook?.cartTotal || 0;

//   // Calculate Platform Fee (1%)
//   const platformFee = +(cartTotal * PLATFORM_FEE_RATE).toFixed(2);
//   const finalTotal = cartTotal + platformFee;

//   // Redirect if cart is empty
//   useEffect(() => {
//     if (cartHook && (!cart || cart.items?.length === 0)) {
//       const timer = setTimeout(() => {
//         navigate('/cart', { replace: true });
//       }, 800);
//       return () => clearTimeout(timer);
//     }
//   }, [cartHook, cart, navigate]);

//   const handleCheckout = async () => {
//     if (!cart || cart.items?.length === 0) return;

//     setError('');
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/orders/checkout');
//       const { order, paymentUrl, deliveryCode } = data;

//       if (deliveryCode) {
//         sessionStorage.setItem('deliveryCode', deliveryCode);
//         sessionStorage.setItem('orderId', order._id);
//       }

//       if (paymentUrl) {
//         window.location.href = paymentUrl;
//       } else {
//         navigate(`/order/${order._id}`, { state: { deliveryCode, order } });
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Checkout failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!cartHook) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!cart || cart.items?.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600">Redirecting to cart...</p>
//         </div>
//       </div>
//     );
//   }

//   const fulfillmentLabel = cart.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup';

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h1>

//       <div className="max-w-lg mx-auto space-y-4">
//         {/* Items */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm">
//           <h2 className="font-bold text-gray-700 mb-3">Items ({cart.items.length})</h2>
//           {cart.items.map(item => (
//             <div key={item.product} className="flex justify-between text-sm py-2 border-b last:border-b-0">
//               <span className="text-gray-700">{item.name} × {item.quantity}</span>
//               <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
//             </div>
//           ))}
//         </div>

//         {/* Fulfillment */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm">
//           <h2 className="font-bold text-gray-700 mb-2">Fulfillment</h2>
//           <p className="text-sm text-gray-600">Method: <span className="font-medium">{fulfillmentLabel}</span></p>
          
//           {cart.fulfillmentType === 'delivery' && cart.delivery?.address && (
//             <p className="text-sm text-gray-600">Address: <span className="font-medium">{cart.delivery.address}</span></p>
//           )}

//           {cart.fulfillmentType === 'delivery' && (
//             <div className="mt-3 bg-indigo-50 rounded-xl p-3">
//               <p className="text-xs text-indigo-700 font-semibold">
//                 📦 A 4-digit delivery code will be displayed after checkout. Share it only with the delivery rider.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Payment */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm">
//           <h2 className="font-bold text-gray-700 mb-2">Payment</h2>
//           <p className="text-sm text-gray-600">
//             Method: <span className="font-medium capitalize">
//               {cart.paymentMethod === 'online' ? 'Online (Paystack)' : 'Pay on Delivery'}
//             </span>
//           </p>

//           <div className="mt-4 space-y-2 text-sm">
//             <div className="flex justify-between text-gray-600">
//               <span>Subtotal</span>
//               <span>₦{cartTotal.toLocaleString()}</span>
//             </div>

//             <div className="flex justify-between text-gray-600">
//               <span>Platform Fee (1%)</span>
//               <span>₦{platformFee.toLocaleString()}</span>
//             </div>

//             <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-3 mt-2">
//               <span>Total</span>
//               <span>₦{finalTotal.toLocaleString()}</span>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>
//         )}

//         <button
//           onClick={handleCheckout}
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
//         >
//           {loading ? 'Processing...' : cart.paymentMethod === 'online' ? 'Pay Now →' : 'Place Order →'}
//         </button>

//         <button 
//           onClick={() => navigate('/cart')} 
//           className="w-full text-gray-500 text-sm text-center py-2"
//         >
//           ← Back to Cart
//         </button>
//       </div>
//     </div>
//   );
// }