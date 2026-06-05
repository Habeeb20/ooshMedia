import express from 'express';
import Deal from '../../models/deals/deals.js'
import Subscription from "../../models/deals/subscription.js"
import {Conversation} from "../../models/deals/conversation.js"
import {sendEmail} from "../../utills/sendEmail.js"
import  {verifyToken} from "../../middleware/verifyToken.js"
import axios from 'axios';

const router = express.Router();


// ════════════════════════════════════════════════════════
//  DEALS CRUD
// ════════════════════════════════════════════════════════

/** GET /api/deals  — paginated feed */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, status = 'active', search } = req.query;
    const filter = { status };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const deals = await Deal.find(filter)
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Deal.countDocuments(filter);
    res.json({ deals, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/deals/:id */
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'firstName lastName username avatar')
      .populate('comments.user', 'firstName lastName username avatar')
      .populate('reviews.user', 'firstName lastName username avatar');

    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/deals  — create a deal/post */
router.post('/', verifyToken, async (req, res) => {
  try {
    let { images = [], ...dealData } = req.body;

    // Ensure images is array of objects with { url, publicId }
    if (images.length > 0 && typeof images[0] === 'string') {
      // If frontend accidentally sent only URLs, convert them
      dealData.images = images.map(url => ({
        url,
        publicId: url.split('/').pop().split('.')[0] // rough publicId extraction
      }));
    } else {
      // Normal case: already array of objects
      dealData.images = images;
    }

    const deal = await Deal.create({ 
      ...dealData, 
      author: req.user._id 
    });

    const populated = await deal.populate('author', 'firstName lastName username avatar');

    if (deal.type === 'buy') {
      notifySellers(deal).catch(console.error);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});
/** PATCH /api/deals/:id  — update (author only) */
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });

    Object.assign(deal, req.body);
    await deal.save();
    res.json(deal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/** DELETE /api/deals/:id */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    await deal.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  ENGAGEMENT
// ════════════════════════════════════════════════════════

/** POST /api/deals/:id/like */
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    const uid = req.user._id.toString();
    const idx = deal.likes.findIndex(id => id.toString() === uid);
    if (idx === -1) deal.likes.push(req.user._id);
    else deal.likes.splice(idx, 1);
    await deal.save();
    res.json({ likes: deal.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/deals/:id/repost */
router.post('/:id/repost', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    const uid = req.user._id.toString();
    const idx = deal.reposts.findIndex(id => id.toString() === uid);
    if (idx === -1) deal.reposts.push(req.user._id);
    else deal.reposts.splice(idx, 1);
    await deal.save();
    res.json({ reposts: deal.reposts.length, reposted: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/deals/:id/share */
router.post('/:id/share', async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    res.json({ shares: deal.shares });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  COMMENTS
// ════════════════════════════════════════════════════════

/** POST /api/deals/:id/comments */
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    deal.comments.push({ user: req.user._id, text: req.body.text });
    await deal.save();
    await deal.populate('comments.user', 'firstName lastName username avatar');
    res.status(201).json(deal.comments[deal.comments.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/** DELETE /api/deals/:id/comments/:commentId */
router.delete('/:id/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    const comment = deal.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    comment.deleteOne();
    await deal.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  REVIEWS & RATINGS
// ════════════════════════════════════════════════════════

/** POST /api/deals/:id/reviews */
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    const existing = deal.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ message: 'Already reviewed' });
    deal.reviews.push({ user: req.user._id, rating: req.body.rating, text: req.body.text });
    await deal.save();
    await deal.populate('reviews.user', 'firstName lastName username avatar');
    res.status(201).json({ averageRating: deal.averageRating, review: deal.reviews[deal.reviews.length - 1] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  STATUS
// ════════════════════════════════════════════════════════

/** PATCH /api/deals/:id/status */
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Forbidden' });
    deal.status = req.body.status;
    await deal.save();
    res.json({ status: deal.status });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  dRIPTIONS & PAYMENTS (Paystack)
// ════════════════════════════════════════════════════════

const POINTS_PER_PURCHASE = 10;
const AMOUNT_KOBO = 1000000; // ₦10,000 in kobo

/** POST /api/deals/subscription/initiate — start Paystack payment */

router.post('/subscription/initiate', verifyToken, async (req, res) => {
  console.log('req.body:', req.body); // ← check your server terminal for this
  try {
    // ✅ Accept the reference generated client-side
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required.' });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email || req.user.alternateContact,
        amount: AMOUNT_KOBO,
        reference, // ✅ pass it to Paystack so both sides agree on the same ref
        metadata: {
          userId: req.user._id.toString(),
          points: POINTS_PER_PURCHASE,
        },
        callback_url: `${process.env.FRONTEND_URL}/subscription/verify`,
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    res.json(response.data);
  } catch (err) {
    console.log(err.response?.data?.message || err.message);
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/deals/subscription/verify?reference=xxx — verify after redirect */
router.get('/subscription/verify', verifyToken, async (req, res) => {
  try {
    const { reference } = req.query;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    if (response.data.data.status === 'success') {
      await Subscription.findOneAndUpdate(
        { user: req.user._id },
        {
          $inc: { points: POINTS_PER_PURCHASE, totalPurchased: POINTS_PER_PURCHASE },
          $push: {
            transactions: {
              reference,
              amount: AMOUNT_KOBO,
              pointsAdded: POINTS_PER_PURCHASE,
              status: 'success',
            },
          },
        },
        { upsert: true, new: true }
      );
      res.json({ message: 'Subscription successful', points: POINTS_PER_PURCHASE });
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/deals/subscription/balance */
router.get('/subscription/balance', verifyToken, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    res.json({ points: sub?.points ?? 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  DIRECT MESSAGES
// ════════════════════════════════════════════════════════

/** POST /api/deals/:id/messages  — send a DM (costs 1 point for new conversations) */
router.post('/:id/messages', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const senderId = req.user._id;
    const recipientId = deal.author;

    if (senderId.toString() === recipientId.toString())
      return res.status(400).json({ message: 'Cannot message yourself' });

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      deal: deal._id,
      participants: { $all: [senderId, recipientId] },
    });

    const isNew = !conversation;

    if (isNew) {
      // Deduct a point
      const sub = await Subscription.findOne({ user: senderId });
      if (!sub || sub.points < 1)
        return res.status(402).json({ message: 'Insufficient message points. Please subscribe.' });

      sub.points -= 1;
      await sub.save();

      conversation = await Conversation.create({
        deal: deal._id,
        participants: [senderId, recipientId],
        messages: [{ deal: deal._id, sender: senderId, recipient: recipientId, text: req.body.text }],
      });
    } else {
      conversation.messages.push({ deal: deal._id, sender: senderId, recipient: recipientId, text: req.body.text });
      conversation.lastMessage = new Date();
      await conversation.save();
    }

    await conversation.populate('participants', 'firstName lastName username avatar');
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/deals/:id/messages — get all conversations for a deal (author only) */
router.get('/:id/messages', verifyToken, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    // The author sees all conversations; others see only their own
    const filter = { deal: deal._id };
    if (deal.author.toString() !== req.user._id.toString()) {
      filter.participants = req.user._id;
    }

    const conversations = await Conversation.find(filter)
      .populate('participants', 'firstName lastName username avatar')
      .sort({ lastMessage: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════

async function notifySellers(deal) {
  const User = (await import('../models/User.js')).default;
  // Find sellers who have listed in the same category — adjust query to your schema
  const sellers = await User.find({ role: 'seller', categories: deal.category }).select('email firstName');
  for (const seller of sellers) {
    await sendEmail({
      to: seller.email,
      subject: `New Buy Request: ${deal.title}`,
      html: `
        <h2>Hi ${seller.firstName},</h2>
        <p>A buyer is looking for <strong>${deal.title}</strong> in the <em>${deal.category}</em> category.</p>
        <p>${deal.description}</p>
        <a href="${process.env.FRONTEND_URL}/deals/${deal._id}" style="background:#f97316;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">View Deal</a>
      `,
    });
  }
}

export default router;





























































router.post('/subscription/initiate', verifyToken, async (req, res) => {
  try {
    // ✅ Accept the reference generated client-side
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required.' });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: req.user.email || req.user.alternateContact,
        amount: AMOUNT_KOBO,
        reference, // ✅ pass it to Paystack so both sides agree on the same ref
        metadata: {
          userId: req.user._id.toString(),
          points: POINTS_PER_PURCHASE,
        },
        callback_url: `${process.env.FRONTEND_URL}/subscription/verify`,
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    res.json(response.data);
  } catch (err) {
    console.log(err.response?.data?.message || err.message);
    res.status(500).json({ message: err.message });
  }
});