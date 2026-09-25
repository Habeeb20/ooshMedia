
import RentalBooking from '../rental/models/RentalBooking.js';
import RentalItem from '../rental/models/RentalItem.js';

// Admins see the full User document EXCEPT raw credentials/secrets — these
// stay excluded no matter who's asking, since there's no legitimate reason
// for anyone (including admins, in a general "view everything" screen) to
// see a password hash, an OTP code, or a raw NIN/BVN/voter's card/license/
// CAC number. Everything else on the User schema — including sensitive-
// looking-but-non-secret fields like bank details, business info, identity
// verification status, etc. — is included, since that's what was asked for.
const ADMIN_OWNER_EXCLUDES = [
  '-password',
  '-eAuthOtp.code',
  '-identityVerification.nin.number',
  '-identityVerification.bvn.number',
  '-identityVerification.votersCard.vin',
  '-identityVerification.driverLicense.number',
  '-identityVerification.passport.number',
  '-identityVerification.cac.rcNumber',
].join(' ');

// ==================== STATS (dashboard header cards) ====================
export const getRentalStats = async (req, res) => {
  try {
    const [itemsByStatus, bookingsByStatus, revenueAgg, totalItems, totalBookings] = await Promise.all([
      RentalItem.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      RentalBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      RentalBooking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalDeposits: { $sum: '$depositAmount' },
            totalDeliveryFees: { $sum: '$deliveryFee' },
          },
        },
      ]),
      RentalItem.countDocuments(),
      RentalBooking.countDocuments(),
    ]);

    res.json({
      success: true,
      totalItems,
      totalBookings,
      itemsByStatus,
      bookingsByStatus,
      revenue: revenueAgg[0] || { totalRevenue: 0, totalDeposits: 0, totalDeliveryFees: 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== ALL RENTAL ITEMS ====================
// GET /admin/rentals/items?status=&category=&search=&page=&limit=&sort=
export const getAllRentalItems = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      RentalItem.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('owner', ADMIN_OWNER_EXCLUDES),
      RentalItem.countDocuments(query),
    ]);

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/rentals/items/:itemId — full document + every booking ever made against it
export const getRentalItemById = async (req, res) => {
  try {
    const item = await RentalItem.findById(req.params.itemId)
      .populate('owner', ADMIN_OWNER_EXCLUDES)
      .populate('likedBy', 'firstName lastName username profilePicture')
      .populate('bookedRanges.booking', 'status startDate endDate renter');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    const bookings = await RentalBooking.find({ item: item._id })
      .sort('-createdAt')
      .populate('renter', ADMIN_OWNER_EXCLUDES)
      .populate('owner', ADMIN_OWNER_EXCLUDES);

    res.json({ success: true, item, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== ALL BOOKINGS ====================
// GET /admin/rentals/bookings?status=&from=&to=&page=&limit=&sort=
export const getAllRentalBookings = async (req, res) => {
  try {
    const { status, from, to, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (from || to) {
      query.startDate = {};
      if (from) query.startDate.$gte = new Date(from);
      if (to) query.startDate.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      RentalBooking.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('item')
        .populate('owner', ADMIN_OWNER_EXCLUDES)
        .populate('renter', ADMIN_OWNER_EXCLUDES),
      RentalBooking.countDocuments(query),
    ]);

    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/rentals/bookings/:bookingId — every field, fully populated
export const getRentalBookingById = async (req, res) => {
  try {
    const booking = await RentalBooking.findById(req.params.bookingId)
      .populate('item')
      .populate('owner', ADMIN_OWNER_EXCLUDES)
      .populate('renter', ADMIN_OWNER_EXCLUDES)
      .populate('cancellation.cancelledBy', 'firstName lastName username');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};