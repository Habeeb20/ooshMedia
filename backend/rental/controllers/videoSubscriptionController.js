// import User from '../../models/user.js';
// import { initializeTransaction, verifyTransaction, generateReference } from '../utils/paystack.js';

// const PRICE_NAIRA = 5000;
// const VIDEOS_PER_BATCH = 10;

// // Step 1: user requests to buy a video-upload batch
// export const initiateVideoSubscription = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     const reference = generateReference('VIDSUB');

//     user.videoSubscription.payments.push({
//       reference,
//       amount: PRICE_NAIRA,
//       videosGranted: VIDEOS_PER_BATCH,
//       status: 'pending',
//     });
//     await user.save();

//     const paystackRes = await initializeTransaction({
//       email: user.email,
//       amountNaira: PRICE_NAIRA,
//       reference,
//       metadata: { userId: user._id.toString(), purpose: 'video_subscription' },
//     });

//     if (!paystackRes.status) {
//       return res.status(502).json({ success: false, message: 'Could not initialize payment' });
//     }

//     res.status(200).json({
//       success: true,
//       authorizationUrl: paystackRes.data.authorization_url,
//       reference,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // Step 2: verify payment (call from your Paystack webhook handler, or a client-side callback route)
// export const verifyVideoSubscriptionPayment = async (req, res) => {
//   try {
//     const { reference } = req.params;
//     const verification = await verifyTransaction(reference);

//     if (!verification.status || verification.data.status !== 'success') {
//       await User.updateOne(
//         { 'videoSubscription.payments.reference': reference },
//         { $set: { 'videoSubscription.payments.$.status': 'failed' } }
//       );
//       return res.status(400).json({ success: false, message: 'Payment not successful' });
//     }

//     const user = await User.findOne({ 'videoSubscription.payments.reference': reference });
//     if (!user) return res.status(404).json({ success: false, message: 'Payment record not found' });

//     const payment = user.videoSubscription.payments.find((p) => p.reference === reference);
//     if (payment.status === 'success') {
//       return res.json({ success: true, message: 'Already credited', creditsRemaining: user.videoSubscription.creditsRemaining });
//     }

//     payment.status = 'success';
//     payment.paidAt = new Date();
//     user.videoSubscription.creditsRemaining += payment.videosGranted;
//     user.videoSubscription.totalPurchasedBatches += 1;
//     await user.save();

//     res.json({ success: true, creditsRemaining: user.videoSubscription.creditsRemaining });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const getVideoSubscriptionStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('videoSubscription');
//     res.json({ success: true, videoSubscription: user.videoSubscription });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
















import User from '../../models/user.js';
import { initializeTransaction, verifyTransaction, generateReference } from '../utils/paystack.js';

const PRICE_NAIRA = 5000;
const VIDEOS_PER_BATCH = 10;

// Step 1: user requests to buy a video-upload batch
export const initiateVideoSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const reference = generateReference('VIDSUB');

    user.videoSubscription.payments.push({
      reference,
      amount: PRICE_NAIRA,
      videosGranted: VIDEOS_PER_BATCH,
      status: 'pending',
    });
    await user.save();

    const paystackRes = await initializeTransaction({
      email: user.email,
      amountNaira: PRICE_NAIRA,
      reference,
      metadata: { userId: user._id.toString(), purpose: 'video_subscription' },
      callbackUrl: `${process.env.FRONTEND_URL}/rental/payment/verify`,
    });

    if (!paystackRes.status) {
      return res.status(502).json({ success: false, message: 'Could not initialize payment' });
    }

    res.status(200).json({
      success: true,
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Step 2: verify payment (call from your Paystack webhook handler, or a client-side callback route)
export const verifyVideoSubscriptionPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const verification = await verifyTransaction(reference);

    if (!verification.status || verification.data.status !== 'success') {
      await User.updateOne(
        { 'videoSubscription.payments.reference': reference },
        { $set: { 'videoSubscription.payments.$.status': 'failed' } }
      );
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    const user = await User.findOne({ 'videoSubscription.payments.reference': reference });
    if (!user) return res.status(404).json({ success: false, message: 'Payment record not found' });

    const payment = user.videoSubscription.payments.find((p) => p.reference === reference);
    if (payment.status === 'success') {
      return res.json({ success: true, message: 'Already credited', creditsRemaining: user.videoSubscription.creditsRemaining });
    }

    payment.status = 'success';
    payment.paidAt = new Date();
    user.videoSubscription.creditsRemaining += payment.videosGranted;
    user.videoSubscription.totalPurchasedBatches += 1;
    await user.save();

    res.json({ success: true, creditsRemaining: user.videoSubscription.creditsRemaining });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVideoSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('videoSubscription');
    res.json({ success: true, videoSubscription: user.videoSubscription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};