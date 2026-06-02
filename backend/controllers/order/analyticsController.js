
import Order from '../../models/order/Order.js';
import Loyalty from '../../models/order/Loyalty.js';
import Transaction from '../../models/order/Transaction.js'
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case '12h':   start.setHours(now.getHours() - 12); break;
    case '24h':   start.setHours(now.getHours() - 24); break;
    case '48h':   start.setHours(now.getHours() - 48); break;
    case 'week':  start.setDate(now.getDate() - 7); break;
    case 'lastWeek': {
      start.setDate(now.getDate() - 14);
      now.setDate(now.getDate() - 7);
      break;
    }
    case 'month': start.setMonth(now.getMonth() - 1); break;
    case 'lastMonth': {
      start.setMonth(now.getMonth() - 2);
      now.setMonth(now.getMonth() - 1);
      break;
    }
    case '3months': start.setMonth(now.getMonth() - 3); break;
    case '6months': start.setMonth(now.getMonth() - 6); break;
    case 'year':  start.setFullYear(now.getFullYear() - 1); break;
    default: start.setDate(now.getDate() - 7);
  }
  return { $gte: start, $lte: now };
};

// GET /analytics/seller?period=week
export const getSellerAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const dateRange = getDateRange(period);
    const sellerId = req.user._id;

    const txs = await Transaction.find({
      seller: sellerId,
      paymentStatus: 'completed',
      createdAt: dateRange,
    });

    const totalRevenue = txs.reduce((s, t) => s + t.amount, 0);
    const totalPlatformFee = txs.reduce((s, t) => s + t.platformFee, 0);
    const totalSellerEarnings = txs.reduce((s, t) => s + t.sellerAmount, 0);
    const totalOrders = txs.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    // Product-level breakdown
    const productMap = {};
    for (const tx of txs) {
      for (const item of tx.items || []) {
        const key = item.product?.toString() || item.name;
        if (!productMap[key]) productMap[key] = { name: item.name, qty: 0, revenue: 0 };
        productMap[key].qty += item.quantity;
        productMap[key].revenue += item.subtotal;
      }
    }
    const products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    // Daily breakdown for chart
    const dailyMap = {};
    for (const tx of txs) {
      const day = tx.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, orders: 0 };
      dailyMap[day].revenue += tx.amount;
      dailyMap[day].orders += 1;
    }
    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Payment method split
    const paymentSplit = txs.reduce((acc, tx) => {
      acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    res.json({
      summary: { totalRevenue, totalPlatformFee, totalSellerEarnings, totalOrders, avgOrderValue },
      daily,
      products,
      paymentSplit,
      period,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /analytics/buyer
export const getBuyerAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id, paymentStatus: 'paid' })
      .populate('items.product', 'name category');

    const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
    const loyalty = await Loyalty.findOne({ user: req.user._id });

    // Monthly spend for chart
    const monthMap = {};
    for (const o of orders) {
      const month = o.createdAt.toISOString().slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + o.totalAmount;
    }
    const monthly = Object.entries(monthMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Category breakdown
    const catMap = {};
    for (const o of orders) {
      for (const item of o.items) {
        const cat = item.product?.category || 'Unknown';
        catMap[cat] = (catMap[cat] || 0) + item.subtotal;
      }
    }

    res.json({
      totalSpent,
      totalOrders: orders.length,
      loyaltyPoints: loyalty?.availablePoints || 0,
      monthly,
      categoryBreakdown: catMap,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /analytics/customers (seller's customer management)
export const getSellerCustomers = async (req, res) => {
  try {
    const txs = await Transaction.find({ seller: req.user._id, paymentStatus: 'completed' })
      .populate('buyer', 'firstName lastName email phoneNumber');

    const customerMap = {};
    for (const tx of txs) {
      const id = tx.buyer?._id?.toString() || tx.customerPhone || 'walk-in';
      if (!customerMap[id]) {
        customerMap[id] = {
          id,
          name: tx.buyer ? `${tx.buyer.firstName} ${tx.buyer.lastName}` : tx.customerName || 'Walk-in',
          email: tx.buyer?.email || null,
          phone: tx.buyer?.phoneNumber || tx.customerPhone || null,
          orders: 0,
          totalSpent: 0,
          lastOrderDate: null,
        };
      }
      customerMap[id].orders += 1;
      customerMap[id].totalSpent += tx.amount;
      const d = tx.createdAt;
      if (!customerMap[id].lastOrderDate || d > customerMap[id].lastOrderDate) {
        customerMap[id].lastOrderDate = d;
      }
    }

    const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
