import mongoose from 'mongoose';
import Review from '../../models/order/review.js';
import Order from '../../models/order/Order.js';
import Product from '../../models/sellers/product.js';

// ── CREATE REVIEW ───────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment, image } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.firstName || 'Buyer';

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!orderId || !productId) {
      return res.status(400).json({ message: 'orderId and productId are required' });
    }

    // Order must belong to this buyer, be delivered, and contain this product
    const order = await Order.findOne({
      _id: orderId,
      buyer: userId,          // ← was "user", Order schema field is "buyer"
      status: 'delivered',    // ← was "completed", doesn't match your enum
      'items.product': productId,
    });

    if (!order) {
      return res.status(403).json({
        message: 'You can only review products from your delivered orders',
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      order: orderId,
      userName,
      rating,
      comment,
      image: image || undefined,
    });

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(stats[0].avgRating * 10) / 10,
      });
    }

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You already reviewed this product for this order' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ── ELIGIBLE PRODUCTS TO REVIEW ─────────────────────────────
// GET /api/reviews/reviewable?sellerId=... OR ?orderId=...
export const getReviewableProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sellerId, orderId } = req.query;

    const query = { buyer: userId, status: 'delivered' };
    if (orderId) query._id = orderId;

    const orders = await Order.find(query).populate('items.product', 'name images seller');

    const existingReviews = await Review.find({ user: userId }).select('product order');
    const reviewedSet = new Set(existingReviews.map(r => `${r.product}_${r.order}`));

    const reviewable = [];
    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;

        const productSellerId = product.seller?.toString() || item.seller?.toString();
        if (sellerId && productSellerId !== sellerId) continue;

        const key = `${product._id}_${order._id}`;
        if (reviewedSet.has(key)) continue;

        reviewable.push({
          orderId: order._id,
          productId: product._id,
          name: item.name || product.name,
          image: item.image || product.images?.[0]?.url,
        });
      }
    }

    res.json({ reviewable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── RECENT / PAGINATED REVIEWS FOR A SELLER'S CATALOG ───────
// GET /api/reviews/seller/:sellerId?limit=6&page=1
export const getSellerReviews = async (req, res) => {
  try {
  
    const limit = Number(req.query.limit) || 6;
    const page = Number(req.query.page) || 1;

    const products = await Product.find({}).select('_id');
    const productIds = products.map(p => p._id);

    const total = await Review.countDocuments({ product: { $in: productIds } });
    const reviews = await Review.find({ product: { $in: productIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('product', 'name images')
      .populate('user', 'firstName lastName rating comment image createdAt product profilePicture')
      .select('userName firstName lastName rating comment image createdAt product profilePicture');

    res.json({ reviews, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── SINGLE PRODUCT'S REVIEWS ────────────────────────────────
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .select('userName rating comment image createdAt');
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};