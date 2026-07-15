// controllers/inventoryAccessController.js
import axios from 'axios';
import User from '../models/user.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const INVENTORY_ACCESS_FEE_KOBO = 300000; // ₦3,000 in kobo (Paystack uses kobo)
const INVENTORY_ACCESS_FEE_NAIRA = 3000;

// POST /api/payments/inventory-access/initiate
export const initiateInventoryAccessPayment = async (req, res) => {

  try {
    const userId = req.user._id; // set by your auth middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.sellerProfile?.inventoryAccess?.paid) {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        message: 'Inventory access is already unlocked on this account.',
      });
    }

    if (!user.email && !user.alternateContact) {
      return res.status(400).json({ success: false, message: 'Account has no email on file for payment.' });
    }

    const reference = `INV-${userId}-${Date.now()}`;

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email || user.alternateContact,
        amount: INVENTORY_ACCESS_FEE_KOBO,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/dashboard/inventory-access/callback`,
        metadata: {
          userId: userId.toString(),
          purpose: 'inventory_access',
        },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Record the pending reference so verify() can confirm it belongs to this flow
    user.sellerProfile = user.sellerProfile || {};
    user.sellerProfile.inventoryAccess = {
      ...(user.sellerProfile.inventoryAccess || {}),
      reference,
      amount: INVENTORY_ACCESS_FEE_NAIRA,
      paid: false,
    };
    await user.save();

    return res.status(200).json({
      success: true,
      authorizationUrl: paystackRes.data.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error('[initiateInventoryAccessPayment]', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Could not start payment.' });
  }
};

// GET /api/payments/inventory-access/verify?reference=...
export const verifyInventoryAccessPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Missing payment reference.' });
    }

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const data = verifyRes.data.data;

    if (data.status !== 'success') {
      return res.status(200).json({ success: true, paid: false, message: 'Payment was not successful.' });
    }

    const userId = data.metadata?.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Could not resolve the account for this payment.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Guard against replaying an old/foreign reference against this account
    const expectedReference = user.sellerProfile?.inventoryAccess?.reference;
    if (expectedReference && expectedReference !== reference) {
      return res.status(400).json({ success: false, message: 'Reference does not match this account.' });
    }

    user.sellerProfile = user.sellerProfile || {};
    user.sellerProfile.inventoryAccess = {
      paid: true,
      amount: data.amount / 100,
      reference,
      paidAt: new Date(),
    };
    await user.save();

    return res.status(200).json({ success: true, paid: true, message: 'Inventory access unlocked.' });
  } catch (err) {
    console.error('[verifyInventoryAccessPayment]', err.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Could not verify payment.' });
  }
};