import FeePayment from '../models/platformFeePayment.js';
import crypto from 'crypto';
import User from '../models/user.js';
import Order from '../models/order/Order.js';
// ==================== ADMIN ENDPOINTS ====================



// Get all sellers with fee status & overdue flags
export const getSellersFeeStatus = async (req, res) => {
  try {
    const sellers = await User.find({ isSeller: true })
      .select('firstName lastName email phoneNumber isBlocked sellerProfile createdAt')
      .lean();

    const now = new Date();

    const formattedSellers = await Promise.all(
      sellers.map(async (seller) => {
        // 1. Aggregate total generated platform fees from paid orders
        const orderFeeAggregation = await Order.aggregate([
          { $match: { seller: seller._id, paymentStatus: 'paid' } },
          { $unwind: '$items' },
          { $match: { 'items.seller': seller._id } },
          {
            $group: {
              _id: null,
              totalGeneratedFee: { $sum: '$items.platformFee' },
              totalSalesRevenue: { $sum: '$items.subtotal' },
            },
          },
        ]);

        const totalGeneratedFee = orderFeeAggregation[0]?.totalGeneratedFee || 0;
        const totalSalesRevenue = orderFeeAggregation[0]?.totalSalesRevenue || 0;

        // 2. Aggregate total fee payments cleared by the seller
        const paidFeeAggregation = await FeePayment.aggregate([
          { $match: { seller: seller._id, status: 'success' } },
          {
            $group: {
              _id: null,
              totalPaidFee: { $sum: '$amount' },
            },
          },
        ]);

        const totalPaidFee = paidFeeAggregation[0]?.totalPaidFee || 0;

        // 3. Outstanding Balance = Total Fees Accumulated - Total Fees Paid
        const feeBalance = Math.max(0, totalGeneratedFee - totalPaidFee);

        // 4. Determine unpaid duration
        const feeObj = seller.sellerProfile?.platformFee || {};
        const lastPaymentAt = feeObj.lastPaymentAt || seller.createdAt;

        const diffMs = now - new Date(lastPaymentAt);
        const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
        const isOverdue3Months = feeBalance > 0 && diffMonths >= 3;

        return {
          _id: seller._id,
          name: `${seller.firstName} ${seller.lastName}`,
          email: seller.email || 'N/A',
          phone: seller.phoneNumber || 'N/A',
          shopName: seller.sellerProfile?.shopName || 'N/A',
          isBlocked: Boolean(seller.isBlocked),
          feeBalance,
          totalSalesRevenue,
          totalPaidFee,
          lastPaymentAt,
          monthsSinceLastPayment: diffMonths,
          isOverdue3Months,
        };
      })
    );

    res.json(formattedSellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single seller's complete financial & fee payment history for admin
export const getSellerPaymentHistory = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Fetch fee payment history
    const feePayments = await FeePayment.find({ seller: sellerId, status: 'success' })
      .sort({ createdAt: -1 });

    // Fetch order sales history (Money made by seller)
    const orderSales = await Order.find({ seller: sellerId, paymentStatus: 'paid' })
      .select('orderNumber totalAmount totalSellerAmount totalPlatformFee items createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      feePayments,
      orderSales,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Block/Unblock Seller
export const toggleBlockSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { blockReason } = req.body;

    const seller = await User.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    seller.isBlocked = !seller.isBlocked;

    if (seller.isBlocked) {
      seller.isBlacklisted = true;
      seller.blacklist = seller.blacklist || {};
      seller.blacklist.reason = blockReason || 'Overdue Platform Fees / Admin Action';
      seller.blacklist.blacklistedAt = new Date();
      seller.blacklist.blacklistedBy = req.user._id;
    } else {
      seller.isBlacklisted = false;
    }

    await seller.save();

    res.json({
      message: `Seller successfully ${seller.isBlocked ? 'blocked' : 'unblocked'}`,
      isBlocked: seller.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== SELLER ENDPOINTS ====================

// Initialize Paystack Fee Payment
export const initializeFeePayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const sellerId = req.user._id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const reference = `FEE_${sellerId}_${Date.now()}`;

    await FeePayment.create({
      seller: sellerId,
      amount,
      reference,
      status: 'pending',
    });

    res.json({
      reference,
      amount,
      email: req.user.email || req.user.alternateContact,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const verifyFeePayment = async (req, res) => {
  try {
    const { reference } = req.body;

    // 1. Find the payment record
    const payment = await FeePayment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: 'Payment reference not found' });
    }

    if (payment.status === 'success') {
      return res.json({ message: 'Payment has already been processed' });
    }

    // 2. Verify transaction with Paystack API
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      // 3. Mark FeePayment record as successful
      payment.status = 'success';
      payment.paidAt = new Date();
      await payment.save();

      const sellerId = payment.seller;

      // 4. Calculate total platform fees generated from all paid orders for this seller
      const orderFeeAggregation = await Order.aggregate([
        { $match: { seller: sellerId, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': sellerId } },
        {
          $group: {
            _id: null,
            totalGeneratedFee: { $sum: '$items.platformFee' },
          },
        },
      ]);
      const totalGeneratedFee = orderFeeAggregation[0]?.totalGeneratedFee || 0;

      // 5. Calculate total successful fee payments made by this seller (including current payment)
      const paidFeeAggregation = await FeePayment.aggregate([
        { $match: { seller: sellerId, status: 'success' } },
        {
          $group: {
            _id: null,
            totalPaidFee: { $sum: '$amount' },
          },
        },
      ]);
      const totalPaidFee = paidFeeAggregation[0]?.totalPaidFee || 0;

      // 6. Calculate new balance
      const newBalance = Math.max(0, totalGeneratedFee - totalPaidFee);

      // 7. Update User schema (sellerProfile.platformFee)
      const user = await User.findById(sellerId);
      if (user) {
        user.sellerProfile = user.sellerProfile || {};
        user.sellerProfile.platformFee = user.sellerProfile.platformFee || {};

        // Update fields matching your User schema structure
        user.sellerProfile.platformFee.balance = newBalance;
        user.sellerProfile.platformFee.lastPaymentAt = new Date();
        user.sellerProfile.platformFee.isOverdue = newBalance > 0 && user.sellerProfile.platformFee.overdueMonths >= 3;

        // Auto-unblock seller if they were blocked due to fees and have fully cleared their debt
        if (newBalance === 0 && user.isBlocked) {
          user.isBlocked = false;
          user.isBlacklisted = false;
        }

        await user.save();
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully! Platform fee balance updated.',
        remainingBalance: newBalance,
        paidAmount: payment.amount,
      });
    }

    // If verification failed on Paystack end
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json({ message: 'Payment verification failed' });
  } catch (err) {
    console.error('Error verifying fee payment:', err);
    return res.status(500).json({ message: err.message });
  }
};









































