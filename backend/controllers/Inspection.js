// controllers/sellerInspectionController.js
//
// Handles the one-time ₦5,000 "pay for inspection" flow.
//
// IMPORTANT: the frontend Paystack popup only tells you the client thinks the
// payment succeeded — never trust that alone. This controller re-verifies the
// transaction directly with Paystack using the secret key before marking
// anything as paid, and checks the amount + reference to prevent tampering
// or reference re-use.
import User from '../models/user.js';


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const INSPECTION_AMOUNT_KOBO = 500000; // ₦5,000 in kobo

export const verifyInspectionPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // One-time payment guard — if they've already paid, just confirm it,
    // don't re-run verification or overwrite the existing record.
    if (user.sellerProfile?.inspectionPayment?.paid) {
      return res.json({
        success: true,
        alreadyPaid: true,
        inspectionPayment: user.sellerProfile.inspectionPayment,
      });
    }

    // Re-verify the transaction with Paystack directly — this is the only
    // source of truth, not the frontend callback.
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();

    if (!data.status || data.data?.status !== 'success') {
      return res.status(422).json({ success: false, message: 'Payment could not be verified' });
    }

    // Guard against amount tampering (e.g. someone paying ₦100 and forging the reference)
    if (data.data.amount !== INSPECTION_AMOUNT_KOBO) {
      return res.status(422).json({ success: false, message: 'Payment amount does not match the inspection fee' });
    }

    // Guard against a reference being reused across different accounts
    const referenceOwner = await User.findOne({
      'sellerProfile.inspectionPayment.reference': reference,
    });
    if (referenceOwner && String(referenceOwner._id) !== String(user._id)) {
      return res.status(409).json({ success: false, message: 'This payment reference has already been used' });
    }

    user.sellerProfile.inspectionPayment = {
      paid: true,
      amount: data.data.amount / 100,
      reference: data.data.reference,
      paystackTransactionId: String(data.data.id),
      paidAt: new Date(),
    };
    await user.save();

    return res.json({ success: true, inspectionPayment: user.sellerProfile.inspectionPayment });
  } catch (err) {
    console.error('Verify inspection payment error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong verifying the payment' });
  }
};











