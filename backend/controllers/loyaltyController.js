
import Loyalty from '../models/order/Loyalty.js';
import Settings from '../models/setting.js';
import User from '../models/user.js';
import SettlementHistory from '../models/order/settlementHistory.js';
import { MIN_REDEMPTION_POINTS } from '../utills/coreLoyaltyAllocation.js';
import axios from 'axios';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// GET /api/loyalty/me — buyer checks their own status before checkout
export const getMyLoyaltyStatus = async (req, res) => {
  try {
    const [loyalty, settings, user] = await Promise.all([
      Loyalty.findOne({ user: req.user._id }),
      Settings.findOne({ key: 'global' }),
      User.findById(req.user._id).select('loyaltyUsageAllowed'),
    ]);

    const availablePoints = loyalty ? loyalty.totalPoints - loyalty.usedPoints : 0;
    const globalEnabled = !!settings?.allowLoyaltyUsage;
    const userEnabled = user?.loyaltyUsageAllowed !== false;

    res.json({
      availablePoints,
      minRedemptionPoints: MIN_REDEMPTION_POINTS,
      eligible: availablePoints >= MIN_REDEMPTION_POINTS,
      globalEnabled,
      userEnabled,
      canRedeem: globalEnabled && userEnabled && availablePoints >= MIN_REDEMPTION_POINTS,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== ADMIN ====================

// GET /api/admin/settings
export const getSettings = async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    { key: 'global' }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(settings);
};

// PATCH /api/admin/settings/loyalty-toggle  { enabled: true|false }
export const toggleGlobalLoyalty = async (req, res) => {
  const { enabled } = req.body;
  const settings = await Settings.findOneAndUpdate(
    { key: 'global' },
    { allowLoyaltyUsage: !!enabled },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(settings);
};

// PATCH /api/admin/users/:userId/loyalty-toggle  { enabled: true|false }
export const toggleUserLoyalty = async (req, res) => {
  const { userId } = req.params;
  const { enabled } = req.body;
  const user = await User.findByIdAndUpdate(
    userId, { loyaltyUsageAllowed: !!enabled }, { new: true }
  ).select('firstName lastName loyaltyUsageAllowed');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// GET /api/admin/loyalty/overview — every user's points at a glance
export const getLoyaltyOverview = async (req, res) => {
  try {
    const loyalties = await Loyalty.find()
      .populate('user', 'firstName lastName username role isRider isSeller isEmployer loyaltyUsageAllowed');

    const overview = loyalties.map(l => ({
      user: l.user,
      totalPoints: l.totalPoints,
      usedPoints: l.usedPoints,
      availablePoints: l.totalPoints - l.usedPoints,
    }));

    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/loyalty/redemptions — every redemption event + what it was used for
export const getLoyaltyRedemptions = async (req, res) => {
  try {
    const rows = await SettlementHistory.find({ type: 'loyalty_redemption' })
      .populate('buyer', 'firstName lastName username')
      .populate('seller', 'firstName lastName shopName businessProfile.businessName')
      .populate('order', 'orderNumber totalAmount createdAt')
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/loyalty/seller-owed/:sellerId/mark-paid
// Reconciles ALL currently-'owed' loyalty_redemption rows for this seller —
// the real cash a seller is owed because a buyer covered part of their sale
// with points instead of money.
//
// Two paths:
//   1. Seller has a Paystack recipient code on file (bank details verified,
//      same field used by settleCashOrderPayouts) → actually initiate a
//      Paystack transfer for the total owed, and only mark rows 'paid' if
//      the transfer call succeeds.
//   2. No recipient code on file → cannot auto-pay. Row stays 'owed' and the
//      endpoint returns a message telling the admin why, instead of silently
//      flipping a status with no money having moved.
//
// Body: { confirmManual: true } lets an admin who paid the seller by some
// OTHER means (cash, manual bank transfer outside Paystack) force-mark rows
// paid without an API transfer — this is the only path that doesn't move
// money itself, so it's opt-in and logged with who confirmed it.
export const markSellerLoyaltyPaid = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { confirmManual } = req.body;

    const owedRows = await SettlementHistory.find({
      seller: sellerId,
      type: 'loyalty_redemption',
      payoutStatus: 'owed',
    });

    if (owedRows.length === 0) {
      return res.status(400).json({ message: 'Nothing outstanding for this seller.' });
    }

    const totalOwed = owedRows.reduce((sum, r) => sum + (r.loyaltyValueNGN || r.amount || 0), 0);

    // ── Manual confirmation path (admin already paid outside Paystack) ──
    if (confirmManual) {
      await SettlementHistory.updateMany(
        { _id: { $in: owedRows.map(r => r._id) } },
        {
          $set: {
            payoutStatus: 'paid',
            paidAt: new Date(),
            payoutMethod: 'manual',
            payoutConfirmedBy: req.user._id,
          },
        }
      );
      return res.json({
        message: 'Marked as paid (manual confirmation).',
        amount: totalOwed,
        rowsSettled: owedRows.length,
      });
    }

    // ── Automatic Paystack transfer path ──
    const seller = await User.findById(sellerId);
    const recipientCode = seller?.sellerProfile?.bankDetails?.recipientCode;

    if (!recipientCode) {
      return res.status(400).json({
        message: 'This seller has no verified payout account on file. Ask them to complete bank verification, or use manual confirmation if you already paid them another way.',
        totalOwed,
      });
    }

    try {
      const transferRes = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: Math.round(totalOwed * 100),
          recipient: recipientCode,
          reason: `Loyalty redemption reconciliation (${owedRows.length} order${owedRows.length > 1 ? 's' : ''})`,
        },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      await SettlementHistory.updateMany(
        { _id: { $in: owedRows.map(r => r._id) } },
        {
          $set: {
            payoutStatus: 'paid',
            paidAt: new Date(),
            payoutMethod: 'transfer',
            payoutReference: transferRes.data.data.transfer_code,
          },
        }
      );

      res.json({
        message: 'Transfer initiated and rows reconciled.',
        amount: totalOwed,
        rowsSettled: owedRows.length,
        transferCode: transferRes.data.data.transfer_code,
      });
    } catch (err) {
      // Transfer failed — leave rows as 'owed', but flag the failure so it's
      // visible in the admin UI rather than silently retrying forever.
      await SettlementHistory.updateMany(
        { _id: { $in: owedRows.map(r => r._id) } },
        { $set: { payoutStatus: 'payout_failed', payoutError: err?.response?.data?.message || err.message } }
      );
      res.status(502).json({
        message: 'Paystack transfer failed. Rows marked payout_failed for retry.',
        error: err?.response?.data?.message || err.message,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/loyalty/seller-owed — how much cash admin owes each seller
// because their goods were paid for (in part) with points
export const getSellerLoyaltyOwed = async (req, res) => {
  try {
    const rows = await SettlementHistory.aggregate([
      { $match: { type: 'loyalty_redemption' } },
      {
        $group: {
          _id: '$seller',
          totalOwed: {
            $sum: { $cond: [{ $eq: ['$payoutStatus', 'owed'] }, '$loyaltyValueNGN', 0] },
          },
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$payoutStatus', 'paid'] }, '$loyaltyValueNGN', 0] },
          },
          redemptionCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
      {
        $project: {
          seller: {
            _id: '$seller._id',
            firstName: '$seller.firstName',
            lastName: '$seller.lastName',
            shopName: '$seller.sellerProfile.shopName',
          },
          totalOwed: 1,
          totalPaid: 1,
          redemptionCount: 1,
        },
      },
      { $sort: { totalOwed: -1 } },
    ]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};