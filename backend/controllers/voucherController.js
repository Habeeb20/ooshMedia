// server/controllers/voucherController.js
//
// Deliberately isolated from checkoutController.js — nothing here writes
// to the cart, and the normal checkout flow never calls into this file.
// The buyer only reaches this code by opening the "Use Voucher" modal.
import Product from '../models/sellers/product.js';
import Order from '../models/order/Order.js';
import VoucherRedemption from '../models/voucherRedemption.js';
import { lookupVoucher, reserveVoucherCheckout, confirmVoucherRedemption, releaseVoucherRedemption } from '../utills/voucherService.js';
import crypto from 'crypto';
import { productMatchesVoucherCategory } from '../utills/voucherCategorymap.js';

import axios from 'axios';

const NGN_TO_KOBO = 100;

function genOrderReference() {
  return `VCH-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}


function getCartItemProductId(item) {
  const raw = item.productId ?? item.product ?? item._id;
  if (raw && typeof raw === 'object') {
    // Defensive: client sent a populated product object instead of a bare id.
    return raw._id ?? raw.id;
  }
  return raw;
}


/**
 * GET /api/vouchers/lookup/:code
 * Read-only peek at a voucher's category/type/status BEFORE reserving
 * anything — lets the modal reject early with a clear message.
 */
export async function lookupVoucherHandler(req, res) {
  try {
    const voucher = await lookupVoucher(req.params.code);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found.' });
    }
    if (voucher.status !== 'active') {
      return res.status(422).json({ message: 'This voucher is not active.' });
    }
    // Only return what the frontend needs — never leak merchant_email etc.
    return res.json({
      code: voucher.code,
      type: voucher.type,
      category: voucher.category,
      status: voucher.status,
      expires_at: voucher.expires_at,
    });
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) return res.status(404).json({ message: 'Voucher not found.' });
    console.error('lookupVoucherHandler error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Could not look up voucher right now.' });
  }
}

/**
 * POST /api/vouchers/apply
 * Body: { code, cartItems: [{ productId, quantity }], deliveryFeeKobo }
 *
 * cartItems/deliveryFeeKobo should be re-derived from the buyer's actual
 * cart on the server, not blindly trusted — this handler re-fetches each
 * Product to get its real price/category/seller rather than trusting
 * whatever price the client sends.
 */
export async function applyVoucherHandler(req, res) {
    console.log("It got here")
  const buyerId = req.user._id;
  const { code, cartItems, mode, category, deliveryFeeKobo = 0 } = req.body;
  console.log(cartItems)


  if (!code || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: 'Voucher code and cart items are required.' });
  }

  try {
    const voucher = code;


    // Pull real product docs — never trust client-sent price/category.
    const productIds = cartItems.map((i) => i.productId ?? i.product ?? i._id);
    const products = await Product.find({ _id: { $in: productIds } }).populate('seller', '_id');
       
    const productById = new Map(products.map((p) => [String(p._id), p]));
console.log(productById)
    const matchedItems = [];
    let matchedSubtotalKobo = 0;
    let unmatchedSubtotalKobo = 0;

    for (const item of cartItems) {
      const pid = item.productId?._id ?? item.product ?? item._id;
      const product = productById.get(String(pid));
    console.log(product)
      if (!product) continue; // stale cart item — skip silently, checkout flow already guards this elsewhere


      const lineSubtotalKobo = Math.round(product.price * item.quantity * NGN_TO_KOBO);

      if (productMatchesVoucherCategory(product, category)) {
        matchedItems.push({
          product: product._id,
          seller: product.seller?._id || product.seller,
          name: product.name,
          quantity: item.quantity,
          subtotalKobo: lineSubtotalKobo,
        });
       
        matchedSubtotalKobo += lineSubtotalKobo;
      } else {
        unmatchedSubtotalKobo += lineSubtotalKobo;
      }
    }
  

    if (matchedItems.length === 0) {
        console.log(`This voucher only applies to "${category}" items, and none are in your cart.`)
      return res.status(422).json({
        message: `This voucher only applies to "${category}" items, and none are in your cart.`,
      });
    }

    const orderReference = genOrderReference();
    const reservation = await reserveVoucherCheckout({
      code,
      cartKobo: matchedSubtotalKobo,
      orderReference,
    });
console.log(reservation)
    const grandTotalToChargeKobo =
      unmatchedSubtotalKobo + reservation.amount_to_charge_kobo + Math.round(deliveryFeeKobo);

    const record = await VoucherRedemption.create({
      buyer: buyerId,
      code: voucher.code,
      voucherCategory: voucher.category,
      voucherType: voucher.type,
      orderReference,
      redemptionReference: reservation.redemption_reference,
      matchedItems,
      unmatchedSubtotalKobo,
      matchedSubtotalKobo,
      discountKobo: reservation.discount_kobo,
      amountToChargeKobo: reservation.amount_to_charge_kobo,
      deliveryFeeKobo: Math.round(deliveryFeeKobo),
      grandTotalToChargeKobo,
      status: 'reserved',
      reservedExpiresAt: reservation.expires_at,
    });

    return res.json({
      redemptionId: record._id,
      redemptionReference: reservation.redemption_reference,
      matchedItems: matchedItems.map((m) => ({ name: m.name, quantity: m.quantity, subtotalKobo: m.subtotalKobo })),
      unmatchedSubtotalKobo,
      discountKobo: reservation.discount_kobo,
      amountToChargeKobo: reservation.amount_to_charge_kobo,
      deliveryFeeKobo: Math.round(deliveryFeeKobo),
      grandTotalToChargeKobo,
      grandTotalToChargeNaira: grandTotalToChargeKobo / NGN_TO_KOBO,
      expiresAt: reservation.expires_at,
    });
  } catch (err) {
    const walletMessage = err.response?.data?.error;
    console.error('applyVoucherHandler error:', walletMessage || err.message);
    return res.status(err.response?.status || 500).json({
      message: walletMessage || 'Could not apply this voucher right now.',
    });
  }
}
/**
 * POST /api/vouchers/release
 * Body: { redemptionReference }
 * Called when the buyer hits "Back" / closes the modal before paying.
 */
export async function releaseVoucherHandler(req, res) {
  const { redemptionReference } = req.body;
  if (!redemptionReference) return res.status(400).json({ message: 'redemptionReference is required.' });

  try {
    await releaseVoucherRedemption(redemptionReference);
    await VoucherRedemption.findOneAndUpdate(
      { redemptionReference, buyer: req.user._id, status: 'reserved' },
      { status: 'released', releasedAt: new Date() }
    );
    return res.json({ status: true, message: 'Voucher reservation released.' });
  } catch (err) {
    console.error('releaseVoucherHandler error:', err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({ message: 'Could not release reservation.' });
  }
}

/**
 * POST /api/vouchers/confirm
 * Body: { redemptionReference, paystackReference, fulfillment: {...}, notes }
 *
 * Called after the frontend's Paystack popup reports success. Re-verifies
 * the charge server-side before doing anything irreversible — never trust
 * a client-reported "payment succeeded".
 */
export async function confirmVoucherHandler(req, res) {
  const { redemptionReference, paystackReference, fulfillment, notes } = req.body;
  if (!redemptionReference || !paystackReference) {
    return res.status(400).json({ message: 'redemptionReference and paystackReference are required.' });
  }

  const record = await VoucherRedemption.findOne({
    redemptionReference,
    buyer: req.user._id,
    status: 'reserved',
  }).populate('matchedItems.product matchedItems.seller');

  if (!record) {
    return res.status(404).json({ message: 'No pending voucher reservation found for this reference.' });
  }

  try {
    // 1. Verify the Paystack charge server-side (same secret-key verify
    //    call your existing checkout flow already does — reuse that
    //    helper if you have one; shown inline here for completeness).
    const paystackSecret = process.env.PAYSTACK_LIVE_MODE
      ? process.env.PAYSTACK_LIVE_SECRET_KEY
      : process.env.PAYSTACK_SECRET_KEY;

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(paystackReference)}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );
    const tx = verifyRes.data?.data;
    const expectedAmountKobo = record.grandTotalToChargeKobo;

    if (tx?.status !== 'success' || tx?.amount !== expectedAmountKobo) {
      return res.status(422).json({ message: 'Payment verification failed.' });
    }

    // 2. Only now confirm the wallet-side reservation — this is the call
    //    that actually credits the platform's Essential Wallet account.
    await confirmVoucherRedemption(redemptionReference);

    // 3. Build order items exactly as a normal order would — full price,
    //    normal platformFee/sellerAmount math. The seller is unaffected
    //    by the voucher; the buyer just paid less, funded by the wallet
    //    credit from step 2.
    const items = record.matchedItems.map((m) => {
      const subtotal = m.subtotalKobo / NGN_TO_KOBO;
      const platformFee = +(subtotal * 0.01).toFixed(2); // adjust to your real platform-fee rate
      return {
        product: m.product,
        seller: m.seller,
        name: m.name,
        quantity: m.quantity,
        price: subtotal / m.quantity,
        subtotal,
        platformFee,
        sellerAmount: subtotal - platformFee,
      };
    });

    const order = await Order.create({
      buyer: req.user._id,
      seller: items[0]?.seller, // adjust if you support true multi-seller carts elsewhere
      items,
      fulfillmentType: fulfillment?.fulfillmentType || 'delivery',
      pickup: fulfillment?.pickup,
      delivery: fulfillment?.delivery,
      transportFee: record.deliveryFeeKobo / NGN_TO_KOBO,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      paystackReference,
      status: 'confirmed',
      totalAmount: record.grandTotalToChargeKobo / NGN_TO_KOBO,
      notes,
      voucherUsed: {
        code: record.code,
        category: record.voucherCategory,
        redemptionReference: record.redemptionReference,
        discountAmountKobo: record.discountKobo,
        matchedItems: record.matchedItems,
      },
    });

    record.status = 'confirmed';
    record.confirmedAt = new Date();
    record.order = order._id;
    record.paystackReference = paystackReference;
    await record.save();

    return res.json({ status: true, order });
  } catch (err) {
    console.error('confirmVoucherHandler error:', err.response?.data || err.message);
    record.status = 'failed';
    await record.save();
    return res.status(err.response?.status || 500).json({
      message: err.response?.data?.error || 'Could not confirm this order.',
    });
  }
}

/**
 * GET /api/admin/vouchers/orders
 * Admin-only. Every order that used a voucher, with the matched
 * seller(s) and discount breakdown visible.
 */
export async function adminListVoucherOrdersHandler(req, res) {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only.' });

  const orders = await Order.find({ 'voucherUsed.code': { $exists: true } })
    .populate('buyer', 'firstName lastName email phoneNumber')
    .populate('voucherUsed.matchedItems.seller', 'firstName lastName email businessProfile.businessName')
    .populate('voucherUsed.matchedItems.product', 'name category')
    .sort({ createdAt: -1 });

  return res.json({ status: true, data: orders });
}























