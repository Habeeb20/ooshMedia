import User from "../models/user.js";

import mongoose from 'mongoose';
import Product from '../models/sellers/product.js';
import Order from '../models/order/Order.js';
import Post from '../models/post/post.js';
import Loyalty from '../models/order/Loyalty.js';
import jwt from "jsonwebtoken"


export const adminLogin = async (req, res) => {
      const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Superadmin credentials required.',
      });
    }



      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}







const { ObjectId } = mongoose.Types;

/**
 * GET /api/admin/dashboard/overview
 * High-level platform stats — one call to populate the admin landing page.
 */
export const getAdminOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      usersByRole,
      riderCount,
      sellerCount,
      entityCount,
      newUsersLast30Days,
      userGrowth,

      totalProducts,
      productsByStatus,
      totalOrders,
      ordersByStatus,
      revenueAgg,
      monthlyRevenue,

      totalPosts,
      postsByType,

      totalLoyaltyPoints,
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ isRider: true }),
      User.countDocuments({ $or: [{ isSeller: true }, { 'businessProfile.isSeller': true }] }),
      User.countDocuments({ role: 'entity' }),
      User.countDocuments({ createdAt: { $gte: daysAgo(30) } }),
      User.aggregate([
        { $match: { createdAt: { $gte: daysAgo(180) } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      Product.countDocuments(),
      Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: '$totalAmount' },
            platformFees: { $sum: '$totalPlatformFee' },
            sellerPayouts: { $sum: '$totalSellerAmount' },
          },
        },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: daysAgo(180) } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            fees: { $sum: '$totalPlatformFee' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      Post.countDocuments(),
      Post.aggregate([{ $group: { _id: '$postType', count: { $sum: 1 } } }]),

      Loyalty.aggregate([
        { $group: { _id: null, totalIssued: { $sum: '$totalPoints' }, totalUsed: { $sum: '$usedPoints' } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: formatGroup(usersByRole),
          riders: riderCount,
          sellers: sellerCount,
          entities: entityCount,
          newLast30Days: newUsersLast30Days,
          growth: userGrowth.map((g) => ({ label: `${g._id.month}/${g._id.year}`, count: g.count })),
        },
        products: {
          total: totalProducts,
          byStatus: formatGroup(productsByStatus),
        },
        orders: {
          total: totalOrders,
          byStatus: formatGroup(ordersByStatus),
          grossRevenue: revenueAgg[0]?.grossRevenue || 0,
          platformFees: revenueAgg[0]?.platformFees || 0,
          sellerPayouts: revenueAgg[0]?.sellerPayouts || 0,
          monthlyRevenue: monthlyRevenue.map((m) => ({
            label: `${m._id.month}/${m._id.year}`,
            revenue: m.revenue,
            fees: m.fees,
            orders: m.orders,
          })),
        },
        posts: {
          total: totalPosts,
          byType: formatGroup(postsByType),
        },
        loyalty: {
          totalIssued: totalLoyaltyPoints[0]?.totalIssued || 0,
          totalUsed: totalLoyaltyPoints[0]?.totalUsed || 0,
        },
      },
    });
  } catch (err) {
    console.error('getAdminOverview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load admin overview', error: err.message });
  }
};

/**
 * GET /api/admin/users?role=&isRider=&isSeller=&page=&limit=&search=
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { role, isRider, isSeller, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isRider !== undefined) filter.isRider = isRider === 'true';
    if (isSeller !== undefined) filter.isSeller = isSeller === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getAllUsersAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: err.message });
  }
};

/**
 * GET /api/admin/users/:id
 * Full profile + every related record across all schemas for a single user.
 */
export const getUserFullProfileAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [user, products, ordersAsBuyer, ordersAsSeller, ordersAsRider, posts, loyalty] = await Promise.all([
      User.findById(id).select('-password').populate('referredBy', 'firstName lastName username'),
      Product.find({ seller: id }).sort({ createdAt: -1 }),
      Order.find({ buyer: id }).sort({ createdAt: -1 }),
      Order.find({ seller: id }).sort({ createdAt: -1 }),
      Order.find({ 'delivery.assignedRider': id }).sort({ createdAt: -1 }),
      Post.find({ author: id }).sort({ createdAt: -1 }),
      Loyalty.findOne({ user: id }),
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      data: { user, products, ordersAsBuyer, ordersAsSeller, ordersAsRider, posts, loyalty },
    });
  } catch (err) {
    console.error('getUserFullProfileAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: err.message });
  }
};

/** GET /api/admin/products — every product on the platform, filterable */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'firstName lastName username businessProfile.businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getAllProductsAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
};

/** GET /api/admin/orders — every order, filterable */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, fulfillmentType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (fulfillmentType) filter.fulfillmentType = fulfillmentType;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('buyer', 'firstName lastName username')
        .populate('seller', 'firstName lastName username')
        .populate('delivery.assignedRider', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getAllOrdersAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
};

/** GET /api/admin/posts — every post/contract/supply listing, filterable */
export const getAllPostsAdmin = async (req, res) => {
  try {
    const { postType, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (postType) filter.postType = postType;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getAllPostsAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch posts', error: err.message });
  }
};

/** GET /api/admin/riders — rider directory with delivery performance */
export const getAllRidersAdmin = async (req, res) => {
  try {
    const riders = await User.find({ isRider: true }).select('-password');

    const riderIds = riders.map((r) => r._id);
    const deliveryStats = await Order.aggregate([
      { $match: { 'delivery.assignedRider': { $in: riderIds } } },
      {
        $group: {
          _id: '$delivery.assignedRider',
          totalDeliveries: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          earnings: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$delivery.agreedDeliveryFee', 0] } },
        },
      },
    ]);

    const statsMap = deliveryStats.reduce((acc, s) => {
      acc[s._id?.toString()] = s;
      return acc;
    }, {});

    const data = riders.map((r) => ({
      ...r.toObject(),
      deliveryStats: statsMap[r._id.toString()] || { totalDeliveries: 0, completed: 0, earnings: 0 },
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getAllRidersAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch riders', error: err.message });
  }
};

/** GET /api/admin/sellers — seller directory with sales performance */
export const getAllSellersAdmin = async (req, res) => {
  try {
    const sellers = await User.find({
      $or: [{ isSeller: true }, { 'businessProfile.isSeller': true }],
    }).select('-password');

    const sellerIds = sellers.map((s) => s._id);
    const [salesStats, productCounts] = await Promise.all([
      Order.aggregate([
        { $match: { seller: { $in: sellerIds }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$seller',
            totalRevenue: { $sum: '$totalSellerAmount' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      Product.aggregate([
        { $match: { seller: { $in: sellerIds } } },
        { $group: { _id: '$seller', totalProducts: { $sum: 1 } } },
      ]),
    ]);

    const salesMap = salesStats.reduce((acc, s) => ({ ...acc, [s._id.toString()]: s }), {});
    const productMap = productCounts.reduce((acc, p) => ({ ...acc, [p._id.toString()]: p.totalProducts }), {});

    const data = sellers.map((s) => ({
      ...s.toObject(),
      salesStats: salesMap[s._id.toString()] || { totalRevenue: 0, totalOrders: 0 },
      totalProducts: productMap[s._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('getAllSellersAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sellers', error: err.message });
  }
};

/** put /api/admin/users/:id/status — suspend/verify/ban a user */
export const updateUserStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body; // e.g. field: 'riderProfile.verified', value: true

    if (!field) return res.status(400).json({ success: false, message: 'field is required' });

    const update = { [field]: value };
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('updateUserStatusAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

/** DELETE /api/admin/users/:id */
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUserAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function formatGroup(arr) {
  return arr.reduce((acc, cur) => {
    acc[cur._id || 'unknown'] = cur.count;
    return acc;
  }, {});
}