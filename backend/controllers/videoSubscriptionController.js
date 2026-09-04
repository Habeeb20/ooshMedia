// controllers/videoSubscriptionController.js
import axios from 'axios';
import crypto from 'crypto';
import User from '../models/user.js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const VIDEO_BATCH_PRICE = 5000;   // Naira
const VIDEO_BATCH_COUNT = 10;

export const getVideoSubscriptionStatus = async (req, res) => {
  const user = await User.findById(req.user.id).select('videoSubscription email');
  res.json({
    success: true,
    creditsRemaining: user.videoSubscription?.creditsRemaining || 0,
  });
};

export const initiateVideoSubscriptionPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email alternateContact videoSubscription');
    const reference = `vidsub_${req.user.id}_${Date.now()}`;

    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email || user.alternateContact || `${req.user.id}@placeholder.local`,
        amount: VIDEO_BATCH_PRICE * 100, // kobo
        reference,
        metadata: { userId: req.user.id, purpose: 'video_subscription' },
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    user.videoSubscription = user.videoSubscription || { creditsRemaining: 0, totalPurchasedBatches: 0, payments: [] };
    user.videoSubscription.payments.push({
      reference,
      amount: VIDEO_BATCH_PRICE,
      videosGranted: VIDEO_BATCH_COUNT,
      status: 'pending',
    });
    await user.save();

    res.json({
      success: true,
      email: user.email || user.alternateContact,
      reference,
      authorization_url: paystackRes.data.data.authorization_url,
      access_code: paystackRes.data.data.access_code,
    });
  } catch (err) {
    console.error('initiateVideoSubscriptionPayment error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Could not start payment' });
  }
};

export const verifyVideoSubscriptionPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ success: false, message: 'reference is required' });

    const user = await User.findById(req.user.id);
    const payment = user.videoSubscription?.payments.find(p => p.reference === reference);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Already processed — avoid double-crediting on refresh/retry
    if (payment.status === 'success') {
      return res.json({ success: true, creditsRemaining: user.videoSubscription.creditsRemaining });
    }

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    if (verifyRes.data.data.status === 'success') {
      payment.status = 'success';
      payment.paidAt = new Date();
      user.videoSubscription.creditsRemaining += payment.videosGranted;
      user.videoSubscription.totalPurchasedBatches += 1;
      await user.save();
      return res.json({ success: true, creditsRemaining: user.videoSubscription.creditsRemaining });
    }

    payment.status = 'failed';
    await user.save();
    res.json({ success: false, message: 'Payment not successful' });
  } catch (err) {
    console.error('verifyVideoSubscriptionPayment error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// Optional but recommended: Paystack webhook as a backup to the callback verify above
export const paystackWebhook = async (req, res) => {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) return res.sendStatus(401);

  const event = req.body;
  if (event.event === 'charge.success' && event.data.metadata?.purpose === 'video_subscription') {
    const user = await User.findById(event.data.metadata.userId);
    const payment = user?.videoSubscription?.payments.find(p => p.reference === event.data.reference);
    if (payment && payment.status !== 'success') {
      payment.status = 'success';
      payment.paidAt = new Date();
      user.videoSubscription.creditsRemaining += payment.videosGranted;
      user.videoSubscription.totalPurchasedBatches += 1;
      await user.save();
    }
  }
  res.sendStatus(200);
};