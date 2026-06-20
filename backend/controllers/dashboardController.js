import mongoose from 'mongoose';
import User from '../models/user.js';
import Product from '../models/sellers/product.js';
import Order from '../models/order/Order.js';
import Post from '../models/post/post.js';
import Loyalty from '../models/order/Loyalty.js';


const { ObjectId } = mongoose.Types;

/**
 * GET /api/dashboard
 * Builds a single payload describing everything the logged-in user
 * can see, depending on which roles apply to them (client / seller / rider).
 * req.user is assumed to be set by auth middleware (contains _id at minimum).
 */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select('-password')
      .populate('referredBy', 'firstName lastName username');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isRider = !!user.isRider;
    const isSeller = !!(user.isSeller || user.businessProfile?.isSeller);
    const isEntity = user.role === 'entity';

    // Run every section in parallel — only the relevant ones do real work.
    const [
      clientSection,
      sellerSection,
      riderSection,
      postsSection,
      loyaltySection,
    ] = await Promise.all([
      getClientSection(userId),
      isSeller ? getSellerSection(userId) : null,
      isRider ? getRiderSection(userId) : null,
      getPostsSection(userId),
      getLoyaltySection(userId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          role: user.role,
          isRider,
          isSeller,
          isEntity,
          referralCode: user.referralCode,
          referralPoints: user.referralPoints,
          referralCount: user.referralCount,
          businessProfile: isEntity ? user.businessProfile : undefined,
        },
        client: clientSection,
        seller: sellerSection,
        rider: riderSection,
        posts: postsSection,
        loyalty: loyaltySection,
        flags: { isRider, isSeller, isEntity },
      },
    });
  } catch (err) {
    console.error('getDashboardData error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard', error: err.message });
  }
};

// ---------------------------------------------------------------------------
// CLIENT / BUYER SECTION — every user can be a buyer regardless of role
// ---------------------------------------------------------------------------
async function getClientSection(userId) {
  const [
    totalOrders,
    ordersByStatus,
    totalSpentAgg,
    recentOrders,
    monthlySpend,
    paymentMethodBreakdown,
  ] = await Promise.all([
    Order.countDocuments({ buyer: userId }),

    Order.aggregate([
      { $match: { buyer: new ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Order.aggregate([
      { $match: { buyer: new ObjectId(userId), paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),

    Order.find({ buyer: userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('seller', 'firstName lastName username businessProfile.businessName')
      .select('orderNumber items totalAmount status paymentStatus fulfillmentType createdAt'),

    Order.aggregate([
      { $match: { buyer: new ObjectId(userId), paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),

    Order.aggregate([
      { $match: { buyer: new ObjectId(userId) } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    totalOrders,
    totalSpent: totalSpentAgg[0]?.total || 0,
    ordersByStatus: formatGroup(ordersByStatus),
    paymentMethodBreakdown: formatGroup(paymentMethodBreakdown),
    monthlySpend: monthlySpend.map((m) => ({
      label: `${m._id.month}/${m._id.year}`,
      total: m.total,
      orders: m.orders,
    })),
    recentOrders,
  };
}

// ---------------------------------------------------------------------------
// SELLER SECTION — products, sales, revenue, top products
// ---------------------------------------------------------------------------
async function getSellerSection(userId) {
  const [
    totalProducts,
    productsByStatus,
    lowStockProducts,
    salesOrders,
    revenueAgg,
    topProducts,
    monthlyRevenue,
    recentSalesOrders,
  ] = await Promise.all([
    Product.countDocuments({ seller: userId }),

    Product.aggregate([
      { $match: { seller: new ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Product.find({
      seller: userId,
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    })
      .select('name stockQuantity lowStockThreshold images')
      .limit(10),

    Order.countDocuments({ seller: userId }),

    Order.aggregate([
      { $match: { seller: new ObjectId(userId), paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalSellerAmount' },
          totalPlatformFee: { $sum: '$totalPlatformFee' },
          totalOrders: { $sum: 1 },
        },
      },
    ]),

    Product.find({ seller: userId }).sort({ sold: -1 }).limit(5).select('name sold price images ratings'),

    Order.aggregate([
      { $match: { seller: new ObjectId(userId), paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalSellerAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),

    Order.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('buyer', 'firstName lastName username')
      .select('orderNumber items totalAmount status paymentStatus createdAt'),
  ]);

  return {
    totalProducts,
    productsByStatus: formatGroup(productsByStatus),
    lowStockProducts,
    totalOrders: salesOrders,
    totalRevenue: revenueAgg[0]?.totalRevenue || 0,
    totalPlatformFeePaid: revenueAgg[0]?.totalPlatformFee || 0,
    topProducts,
    monthlyRevenue: monthlyRevenue.map((m) => ({
      label: `${m._id.month}/${m._id.year}`,
      revenue: m.revenue,
      orders: m.orders,
    })),
    recentSalesOrders,
  };
}

// ---------------------------------------------------------------------------
// RIDER SECTION — deliveries, earnings, performance
// ---------------------------------------------------------------------------
async function getRiderSection(userId) {
  const [
    totalAssigned,
    deliveriesByStatus,
    earningsAgg,
    recentDeliveries,
    monthlyDeliveries,
  ] = await Promise.all([
    Order.countDocuments({ 'delivery.assignedRider': userId }),

    Order.aggregate([
      { $match: { 'delivery.assignedRider': new ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Order.aggregate([
      { $match: { 'delivery.assignedRider': new ObjectId(userId), status: 'delivered' } },
      { $group: { _id: null, totalEarnings: { $sum: '$delivery.agreedDeliveryFee' }, deliveries: { $sum: 1 } } },
    ]),

    Order.find({ 'delivery.assignedRider': userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('buyer', 'firstName lastName phoneNumber')
      .select('orderNumber delivery status totalAmount createdAt'),

    Order.aggregate([
      { $match: { 'delivery.assignedRider': new ObjectId(userId), status: 'delivered' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          earnings: { $sum: '$delivery.agreedDeliveryFee' },
          deliveries: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  return {
    totalAssigned,
    deliveriesByStatus: formatGroup(deliveriesByStatus),
    totalEarnings: earningsAgg[0]?.totalEarnings || 0,
    completedDeliveries: earningsAgg[0]?.deliveries || 0,
    recentDeliveries,
    monthlyDeliveries: monthlyDeliveries.map((m) => ({
      label: `${m._id.month}/${m._id.year}`,
      earnings: m.earnings,
      deliveries: m.deliveries,
    })),
  };
}

// ---------------------------------------------------------------------------
// POSTS SECTION — feed, contracts, supply posts created by the user
// ---------------------------------------------------------------------------
async function getPostsSection(userId) {
  const [totalPosts, postsByType, engagementAgg, recentPosts] = await Promise.all([
    Post.countDocuments({ author: userId }),

    Post.aggregate([
      { $match: { author: new ObjectId(userId) } },
      { $group: { _id: '$postType', count: { $sum: 1 } } },
    ]),

    Post.aggregate([
      { $match: { author: new ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalShares: { $sum: '$shares' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalApplications: { $sum: '$applicationCount' },
        },
      },
    ]),

    Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title content postType status views likes applicationCount createdAt'),
  ]);

  return {
    totalPosts,
    postsByType: formatGroup(postsByType),
    totalViews: engagementAgg[0]?.totalViews || 0,
    totalShares: engagementAgg[0]?.totalShares || 0,
    totalLikes: engagementAgg[0]?.totalLikes || 0,
    totalApplications: engagementAgg[0]?.totalApplications || 0,
    recentPosts,
  };
}

// ---------------------------------------------------------------------------
// LOYALTY SECTION
// ---------------------------------------------------------------------------
async function getLoyaltySection(userId) {
  const loyalty = await Loyalty.findOne({ user: userId });
  if (!loyalty) {
    return { totalPoints: 0, usedPoints: 0, availablePoints: 0, history: [] };
  }
  return {
    totalPoints: loyalty.totalPoints,
    usedPoints: loyalty.usedPoints,
    availablePoints: loyalty.totalPoints - loyalty.usedPoints,
    history: loyalty.history.slice(-10).reverse(),
  };
}

// Helper: turn aggregate [{_id, count}] into { value: count } map
function formatGroup(arr) {
  return arr.reduce((acc, cur) => {
    acc[cur._id || 'unknown'] = cur.count;
    return acc;
  }, {});
}