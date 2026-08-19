import axios from 'axios';
import SettlementHistory from '../../models/order/settlementHistory.js';
import Order from '../../models/order/Order.js';
import User from '../../models/user.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

const USER_SUMMARY_FIELDS =
  'firstName lastName username email phoneNumber profilePicture role ' +
  'sellerProfile.shopName sellerProfile.isSuperVerify sellerProfile.bankDetails ' +
  'riderProfile.vehicleType riderProfile.bankName riderProfile.accountNumber ' +
  'riderProfile.accountName riderProfile.recipientCode';

/**
 * @swagger
 * /api/admin/settlements:
 *   get:
 *     summary: List all settlement history rows across every order (admin only)
 *     description: >
 *       Full audit trail with buyer, seller, and rider details populated, plus the
 *       order it belongs to. Supports filtering by payoutStatus, type, destination,
 *       method, and date range, and simple pagination.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payoutStatus
 *         schema:
 *           type: string
 *           enum: [not_applicable, owed, paid, payout_failed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sale_share, platform_fee, transport_fee]
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *           enum: [seller_subaccount, estore]
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [split, fallback_main_account, transfer, cash_pending]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Matches against order number
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *     responses:
 *       200:
 *         description: Paginated settlement history rows
 */
export const getAllSettlements = async (req, res) => {
  try {
    const { payoutStatus, type, destination, method, search, from, to, page = 1, limit = 25 } = req.query;

    const match = {};
    if (payoutStatus) match.payoutStatus = payoutStatus;
    if (type) match.type = type;
    if (destination) match.destination = destination;
    if (method) match.method = method;
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    let orderIds;
    if (search) {
      const matchingOrders = await Order.find({ orderNumber: { $regex: search, $options: 'i' } }).select('_id');
      orderIds = matchingOrders.map((o) => o._id);
      match.order = { $in: orderIds };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));

    const [rows, total, summary] = await Promise.all([
      SettlementHistory.find(match)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate({
          path: 'order',
          select: 'orderNumber buyer totalAmount totalPlatformFee totalSellerAmount transportFee status paymentStatus paymentMethod fulfillmentType delivery.address delivery.assignedRider createdAt',
          populate: { path: 'buyer', select: USER_SUMMARY_FIELDS },
        })
        .populate('seller', USER_SUMMARY_FIELDS)
        .populate('rider', USER_SUMMARY_FIELDS)
        .populate('paidBy', 'firstName lastName username')
        .lean(),
      SettlementHistory.countDocuments(match),
      getOwedSummary(),
    ]);

    res.json({
      rows,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      summary,
    });
  } catch (err) {
    console.error('getAllSettlements error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/admin/settlements/summary:
 *   get:
 *     summary: Totals of what's currently owed to sellers vs riders (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Owed totals
 */
export const getSettlementSummary = async (req, res) => {
  try {
    const summary = await getOwedSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function getOwedSummary() {
  const [sellerOwed, riderOwed, failedCount, paidTotal] = await Promise.all([
    SettlementHistory.aggregate([
      { $match: { type: 'sale_share', payoutStatus: 'owed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    SettlementHistory.aggregate([
      { $match: { type: 'transport_fee', payoutStatus: 'owed' } },
      { $group: { _id: null, total: { $sum: '$riderAmount' }, count: { $sum: 1 } } },
    ]),
    SettlementHistory.countDocuments({ payoutStatus: 'payout_failed' }),
    SettlementHistory.aggregate([
      { $match: { payoutStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$payoutAmount', '$amount'] } }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    sellersOwed: { total: sellerOwed[0]?.total || 0, count: sellerOwed[0]?.count || 0 },
    ridersOwed: { total: riderOwed[0]?.total || 0, count: riderOwed[0]?.count || 0 },
    failedPayouts: failedCount,
    totalPaidOut: { total: paidTotal[0]?.total || 0, count: paidTotal[0]?.count || 0 },
  };
}

/**
 * @swagger
 * /api/admin/settlements/{id}/pay:
 *   post:
 *     summary: Manually pay out a settlement row to the seller or rider via Paystack Transfer (admin only)
 *     description: >
 *       Only works on rows with payoutStatus 'owed' or 'payout_failed'. Resolves the
 *       recipient's Paystack recipient code from their profile (seller bank details or
 *       rider bank details depending on the row's type), fires the transfer, and
 *       records the result on the row.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payout sent
 *       400:
 *         description: Row isn't payable, or recipient has no payout account on file
 *       404:
 *         description: Settlement row not found
 */
export const payoutSettlement = async (req, res) => {
  try {
    const row = await SettlementHistory.findById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Settlement row not found' });

    if (!['owed', 'payout_failed'].includes(row.payoutStatus)) {
      return res.status(400).json({ message: `This row is '${row.payoutStatus}' and can't be paid out again` });
    }

    // Resolve who gets paid and from what account
    let recipientCode, recipientName, payoutAmount, recipientUserId;

    if (row.type === 'transport_fee') {
      if (!row.rider) return res.status(400).json({ message: 'No rider assigned to this delivery yet' });
      const rider = await User.findById(row.rider);
      recipientCode = rider?.riderProfile?.recipientCode;
      recipientName = `${rider?.firstName || ''} ${rider?.lastName || ''}`.trim();
      payoutAmount = row.riderAmount ?? row.amount;
      recipientUserId = rider?._id;
    } else if (row.type === 'sale_share') {
      if (!row.seller) return res.status(400).json({ message: 'No seller on this settlement row' });
      const seller = await User.findById(row.seller);
      recipientCode = seller?.sellerProfile?.bankDetails?.recipientCode;
      recipientName = seller?.sellerProfile?.shopName || `${seller?.firstName || ''} ${seller?.lastName || ''}`.trim();
      payoutAmount = row.amount;
      recipientUserId = seller?._id;
    } else {
      return res.status(400).json({ message: 'Platform fee rows are not payable — that revenue belongs to the estore' });
    }

    if (!recipientCode) {
      return res.status(400).json({
        message: `${recipientName || 'This recipient'} has no verified payout bank account on file yet`,
      });
    }
    if (!payoutAmount || payoutAmount <= 0) {
      return res.status(400).json({ message: 'Nothing owed on this row' });
    }

    try {
      const transferRes = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: Math.round(payoutAmount * 100),
          recipient: recipientCode,
          reason: `Settlement payout — ${row.type} for order`,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      row.payoutStatus = 'paid';
      row.payoutReference = transferRes.data.data.transfer_code;
      row.payoutAmount = payoutAmount;
      row.paidAt = new Date();
      row.paidBy = req.user._id;
      row.payoutError = undefined;
      await row.save();

      return res.json({ message: `₦${payoutAmount.toLocaleString()} sent to ${recipientName}`, settlement: row });
    } catch (transferErr) {
      row.payoutStatus = 'payout_failed';
      row.payoutError = transferErr?.response?.data?.message || transferErr.message;
      await row.save();
      return res.status(502).json({ message: `Paystack transfer failed: ${row.payoutError}`, settlement: row });
    }
  } catch (err) {
    console.error('payoutSettlement error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/admin/settlements/{id}/retry:
 *   post:
 *     summary: Retry a previously failed payout (admin only)
 *     description: Alias for the pay endpoint — included for a clearer frontend action label on failed rows.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payout retried
 */
export const retryPayout = payoutSettlement;