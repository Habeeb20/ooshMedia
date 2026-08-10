import axios from 'axios';
import crypto from 'crypto';
import AdSubscription from '../models/adSubscription.js';
import product from '../models/sellers/product.js';
import { AD_PLANS } from '../utills/adPlan.js';


const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/**
 * @swagger
 * /api/ads/plans:
 *   get:
 *     summary: Get all available ad types and their plans
 *     tags: [Ads]
 *     security: []
 *     responses:
 *       200:
 *         description: Map of ad types to their available plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/AdPlan'
 */
// ====================== GET AD PLANS ======================


export const getAdPlans = (req, res) => {
  res.status(200).json({ success: true, data: AD_PLANS });
};


/**
 * @swagger
 * /api/ads/subscribe:
 *   post:
 *     summary: Start a paid ad subscription (creates a pending subscription + Paystack transaction)
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiateAdPaymentRequest'
 *     responses:
 *       200:
 *         description: Paystack checkout initialized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorizationUrl:
 *                       type: string
 *                     reference:
 *                       type: string
 *                     subscriptionId:
 *                       type: string
 *       400:
 *         description: Invalid adType or plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Payment initiation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// ====================== INITIATE PAYMENT ======================
export const initiateAdPayment = async (req, res) => {
  try {
    const { adType, plan, products, companyAd, discountPercentage, flashSalePrice, adBannerImage } = req.body;

    if (!AD_PLANS[adType]) return res.status(400).json({ success: false, message: 'Invalid ad type' });
    if (!AD_PLANS[adType].plans[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const planConfig = AD_PLANS[adType].plans[plan];
    const amount = planConfig.price * 100; // kobo

    const reference = `AD_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Create pending subscription
    const subscription = await AdSubscription.create({
      seller: req.user._id,
      adType,
      plan,
      duration: planConfig.duration,
      amount: planConfig.price,
      products: products || [],
      companyAd: companyAd || {},
      discountPercentage,
      flashSalePrice,
      adBannerImage,
      paymentReference: reference,
      paymentStatus: 'pending',
      status: 'pending'
    });

    // Initialize Paystack transaction
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email || `${req.user.username}@sellersapp.com`,
        amount,
        reference,
        metadata: {
          subscriptionId: subscription._id.toString(),
          adType,
          plan,
          sellerId: req.user._id.toString()
        },
        callback_url: `${process.env.FRONTEND_URL}/dashboard/ads/verify?reference=${reference}`
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' } }
    );

    res.status(200).json({
      success: true,
      data: {
        authorizationUrl: response.data.data.authorization_url,
        reference,
        subscriptionId: subscription._id
      }
    });
  } catch (error) {
    console.error('Initiate Ad Payment Error:', error.response?.data || error);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
};

/**
 * @swagger
 * /api/ads/verify:
 *   get:
 *     summary: Verify an ad subscription payment and activate it
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified, subscription now active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AdSubscription'
 *       400:
 *         description: Reference missing, or payment not successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// ====================== VERIFY PAYMENT ======================
export const verifyAdPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ success: false, message: 'Reference required' });

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const { status, metadata } = response.data.data;

    const subscription = await AdSubscription.findOne({ paymentReference: reference });
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (status === 'success') {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + subscription.duration);

      subscription.paymentStatus = 'success';
      subscription.status = 'active';
      subscription.startDate = now;
      subscription.endDate = endDate;
      await subscription.save();

      return res.status(200).json({ success: true, message: 'Payment verified', data: subscription });
    } else {
      subscription.paymentStatus = 'failed';
      await subscription.save();
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};


/**
 * @swagger
 * /api/ads/webhook/paystack:
 *   post:
 *     summary: Paystack webhook — auto-activates a subscription on charge.success
 *     description: >
 *       Not authenticated with a bearer token. Verifies `x-paystack-signature` against an
 *       HMAC SHA-512 hash of the raw body. Mounted with `express.raw({ type: 'application/json' })`
 *       and registered before `router.use(verifyToken)` in adRoutes.js.
 *     tags: [Ads]
 *     security: []
 *     parameters:
 *       - in: header
 *         name: x-paystack-signature
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Raw Paystack event payload
 *     responses:
 *       200:
 *         description: Event received
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Webhook processing error
 */

// ====================== PAYSTACK WEBHOOK ======================
export const paystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Invalid signature');
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const subscription = await AdSubscription.findOne({ paymentReference: data.reference });
      if (subscription && subscription.paymentStatus !== 'success') {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + subscription.duration);

        subscription.paymentStatus = 'success';
        subscription.status = 'active';
        subscription.startDate = now;
        subscription.endDate = endDate;
        await subscription.save();
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook Error:', error);
    res.sendStatus(500);
  }
};


/**
 * @swagger
 * /api/ads/my-subscriptions:
 *   get:
 *     summary: Get the authenticated seller's ad subscriptions
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, expired, cancelled]
 *     responses:
 *       200:
 *         description: List of the seller's subscriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdSubscription'
 */

// ====================== GET MY SUBSCRIPTIONS ======================
export const getMySubscriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { seller: req.user._id };
    if (status) filter.status = status;

    const subscriptions = await AdSubscription.find(filter)
      .populate('products', 'name images price category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @swagger
 * /api/ads/{id}/cancel:
 *   put:
 *     summary: Cancel an ad subscription
 *     tags: [Ads]
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
 *         description: Subscription cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Not the owner of this subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// ====================== CANCEL SUBSCRIPTION ======================
export const cancelSubscription = async (req, res) => {
  try {
    const sub = await AdSubscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
    if (sub.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    sub.status = 'cancelled';
    await sub.save();
    res.status(200).json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


/**
 * @swagger
 * /api/ads/active:
 *   get:
 *     summary: Get currently active, paid-for ads (public — for display on the storefront)
 *     description: Also increments the impressions counter for every ad returned.
 *     tags: [Ads]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: adType
 *         schema:
 *           type: string
 *         description: Filter to a single ad type, e.g. flash_sale
 *     responses:
 *       200:
 *         description: Active ads with populated products and seller info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdSubscription'
 */

// ====================== GET ACTIVE ADS (public - for display) ======================
export const getActiveAds = async (req, res) => {
  try {
    const { adType } = req.query;
    const now = new Date();

    const filter = {
      status: 'active',
      paymentStatus: 'success',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };
    if (adType) filter.adType = adType;

    const ads = await AdSubscription.find(filter)
      .populate({
        path: 'products',
        select: 'name images price salePrice category subCategory slug ratings sold views',
        match: { status: 'active' }
      })
      .populate({
        path: 'seller',
        select: 'firstName lastName businessProfile.businessName businessProfile.verified sellerProfile.shopName profilePicture'
      })
      .sort({ 'plan': -1, createdAt: -1 });

    // Track impressions
    await AdSubscription.updateMany(
      { _id: { $in: ads.map(a => a._id) } },
      { $inc: { impressions: 1 } }
    );

    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


/**
 * @swagger
 * /api/ads/{id}/click:
 *   post:
 *     summary: Track a click on an ad
 *     tags: [Ads]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Click recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Server error
 */

// ====================== TRACK AD CLICK ======================
export const trackAdClick = async (req, res) => {
  try {
    await AdSubscription.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};


/**
 * @swagger
 * /api/ads/stats:
 *   get:
 *     summary: Get aggregate ad performance stats for the authenticated seller
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription counts, spend, impressions, and clicks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *                     totalSpent:
 *                       type: number
 *                     totalImpressions:
 *                       type: integer
 *                     totalClicks:
 *                       type: integer
 */


// ====================== GET SUBSCRIPTION STATS ======================
export const getSubscriptionStats = async (req, res) => {
  try {
    const subs = await AdSubscription.find({ seller: req.user._id, paymentStatus: 'success' });

    const stats = {
      total: subs.length,
      active: subs.filter(s => s.status === 'active').length,
      expired: subs.filter(s => s.status === 'expired').length,
      totalSpent: subs.reduce((acc, s) => acc + s.amount, 0),
      totalImpressions: subs.reduce((acc, s) => acc + s.impressions, 0),
      totalClicks: subs.reduce((acc, s) => acc + s.clicks, 0),
    };

    res.status(200).json({ success: true, data: stats });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};















































