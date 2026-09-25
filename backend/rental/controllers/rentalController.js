








































import mongoose from 'mongoose';
import RentalItem from '../models/RentalItem.js';


// Fields we never want to leak on the public item/owner payload, even though
// most of these already have `select: false` on the schema. `password` does
// NOT have select:false, so it must always be stripped explicitly here.
const OWNER_SAFE_EXCLUDES = [
  '-password',

  '-identityVerification.nin.number',
  '-identityVerification.bvn.number',
  '-identityVerification.votersCard.vin',
  '-identityVerification.driverLicense.number',
  '-identityVerification.passport.number',
  '-identityVerification.cac.rcNumber',
  '-walletAccount.accountNumber',
  '-businessProfile.businessDocuments',
  '-sellerProfile.bankDetails.accountNumber',
  '-sellerProfile.controlRoom',
  '-riderProfile.bankName -riderProfile.accountNumber -riderProfile.accountName -riderProfile.bankCode -riderProfile.recipientCode',
].join(' ');

// ==================== CREATE ====================
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      images = [],
      videos = [],
      rate,
      depositAmount = 0,
      pickupLocation,
      deliveryAvailable = false,
      deliveryFee = 0,
    } = req.body;

    if (!title || !description || !category || !subcategory || !images.length || !rate?.amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Videos are gated behind the owner's videoSubscription credit balance.
    if (videos.length > 0) {
      const owner = await mongoose.model('User').findById(req.user.id).select('videoSubscription');
      const credits = owner?.videoSubscription?.creditsRemaining || 0;
      if (credits < videos.length) {
        return res.status(402).json({
          success: false,
          message: `You need ${videos.length} video credit(s) but only have ${credits}. Purchase more to attach videos.`,
        });
      }
      owner.videoSubscription.creditsRemaining -= videos.length;
      await owner.save();
    }

    const item = await RentalItem.create({
      owner: req.user.id,
      title,
      description,
      category,
      subcategory,
      images,
      videos,
      rate,
      depositAmount,
      pickupLocation,
      deliveryAvailable,
      deliveryFee,
    });

    return res.status(201).json({ success: true, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== LIST / SEARCH ====================
export const getItems = async (req, res) => {
  try {
    const { category, subcategory, city, minPrice, maxPrice, from, to, search, page = 1, limit = 24 } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (city) query['pickupLocation.city'] = new RegExp(`^${city}$`, 'i');
    if (minPrice || maxPrice) {
      query['rate.amount'] = {};
      if (minPrice) query['rate.amount'].$gte = Number(minPrice);
      if (maxPrice) query['rate.amount'].$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    let itemIdsToExclude = [];
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      // Items whose bookedRanges overlap the requested window are excluded below
      // via an aggregation-free approach: fetch candidates then filter in JS,
      // since bookedRanges also needs the *linked booking's* status checked.
      const RentalBooking = mongoose.model('RentalBooking');
      const clashing = await RentalBooking.find({
        status: { $ne: 'cancelled' },
        startDate: { $lt: toDate },
        endDate: { $gt: fromDate },
      }).distinct('item');
      itemIdsToExclude = clashing;
    }
    if (itemIdsToExclude.length) query._id = { $nin: itemIdsToExclude };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      RentalItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      RentalItem.countDocuments(query),
    ]);

    return res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const items = await RentalItem.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== SINGLE ITEM (increments view count) ====================
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({ success: false, message: 'Invalid item id.' });
    }

    // Every successful detail-page load counts as one view. $inc is atomic so
    // concurrent requests never clobber each other's count.
    const item = await RentalItem.findByIdAndUpdate(
      itemId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', OWNER_SAFE_EXCLUDES);

    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const similarItems = await RentalItem.find({
      _id: { $ne: item._id },
      status: 'active',
      $or: [{ subcategory: item.subcategory }, { category: item.category }],
    })
      .sort({ subcategory: item.subcategory ? -1 : 1, createdAt: -1 })
      .limit(8)
      .select('title images rate pickupLocation ratingAverage ratingCount category subcategory');

const likedByMe = !!(req.user?.id && item.likedBy.some((id) => id.toString() === req.user.id.toString()));

    return res.json({ success: true, item, similarItems, likedByMe });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== UPDATE / DELETE ====================
export const updateItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (item.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your item.' });
    }

    const editable = [
      'title', 'description', 'category', 'subcategory', 'images', 'videos',
      'rate', 'depositAmount', 'pickupLocation', 'deliveryAvailable', 'deliveryFee', 'status',
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    await item.save();
    return res.json({ success: true, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (item.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your item.' });
    }
    const hasActiveBooking = item.bookedRanges.length > 0;
    if (hasActiveBooking) {
      return res.status(409).json({ success: false, message: 'Cannot delete an item with active bookings.' });
    }
    await item.deleteOne();
    return res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== LIKE (toggle, functional + accurate) ====================
export const toggleLike = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    const item = await RentalItem.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const alreadyLiked = item.likedBy.some((id) => id.toString() === userId.toString());

    const updated = await RentalItem.findByIdAndUpdate(
      itemId,
      alreadyLiked
        ? { $pull: { likedBy: userId }, $inc: { likes: -1 } }
        : { $addToSet: { likedBy: userId }, $inc: { likes: 1 } },
      { new: true }
    ).select('likes likedBy');

    return res.json({ success: true, liked: !alreadyLiked, likes: updated.likes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== SHARE (public, no auth — every share click counts) ====================
export const registerShare = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updated = await RentalItem.findByIdAndUpdate(
      itemId,
      { $inc: { shares: 1 } },
      { new: true }
    ).select('shares');
    if (!updated) return res.status(404).json({ success: false, message: 'Item not found.' });
    return res.json({ success: true, shares: updated.shares });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== AVAILABILITY ====================
export const checkAvailability = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to are required.' });

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const item = await RentalItem.findById(itemId).populate({
      path: 'bookedRanges.booking',
      select: 'status',
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const clash = item.bookedRanges.some((range) => {
      const bookingActive = !range.booking || range.booking.status !== 'cancelled';
      return bookingActive && range.from < toDate && range.to > fromDate;
    });

    return res.json({ success: true, available: !clash && item.status === 'active' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== DELIVERY FEE QUOTE (used by the booking checkout UI) ====================
// New route to wire up: GET /api/rentals/items/:itemId/delivery-quote?state=..&lga=..
export const getDeliveryQuote = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { state, lga } = req.query;
    if (!state) return res.status(400).json({ success: false, message: 'state is required.' });

    const item = await RentalItem.findById(itemId).populate('owner', 'state lga');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (!item.deliveryAvailable) {
      return res.status(400).json({ success: false, message: 'This item does not offer delivery.' });
    }

    const { computeTransportFee } = await import('../utils/transportFee.js');
    const quote = await computeTransportFee({
      buyerState: state,
      buyerLga: lga,
      sellerState: item.owner?.state,
      sellerLga: item.owner?.lga,
    });

    return res.json({ success: true, ...quote });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const isRangeFree = (bookedRanges, from, to) =>
  !bookedRanges.some((r) => from < new Date(r.to) && to > new Date(r.from));