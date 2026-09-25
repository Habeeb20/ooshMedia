import RentalItem from '../models/RentalItem.js';
import RentalBooking from '../models/RentalBooking.js';
import Review from '../models/Review.js';

import { isRangeFree } from './rentalController.js';
import { initializeTransaction, verifyTransaction, generateReference } from '../utils/paystack.js';
import { notifyUser,notifyItemWatchers, SOCKET_EVENTS  } from '../utils/socket.js';


const MS_PER_UNIT = { hour: 3600000, day: 86400000, week: 604800000, month: 2592000000 };

const calculateAmount = (rate, from, to) => {
  const durationMs = new Date(to) - new Date(from);
  const units = Math.max(1, Math.ceil(durationMs / MS_PER_UNIT[rate.unit]));
  return units * rate.amount;
};

// ==================== 1. CREATE BOOKING (renter requests to rent) ====================
export const createBooking = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { startDate, endDate, pickupOption, pickupTime, deliveryAddress } = req.body;

    const item = await RentalItem.findById(itemId).populate('owner', 'email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.status !== 'active') return res.status(400).json({ success: false, message: 'Item is not available for rent' });
    if (item.owner._id.equals(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot rent your own item' });
    }

    const from = new Date(startDate);
    const to = new Date(endDate);
    if (to <= from) return res.status(400).json({ success: false, message: 'endDate must be after startDate' });

    if (!isRangeFree(item.bookedRanges, from, to)) {
      return res.status(409).json({ success: false, message: 'Item is already booked for part of this date range' });
    }

    if (pickupOption === 'delivery') {
      if (!item.deliveryAvailable) {
        return res.status(400).json({ success: false, message: 'This item does not support delivery' });
      }
      if (!deliveryAddress?.address || !deliveryAddress?.city || !deliveryAddress?.area) {
        return res.status(400).json({ success: false, message: 'address, city and area are required for delivery' });
      }
    }
    if (!pickupTime) return res.status(400).json({ success: false, message: 'pickupTime is required' });

    const rentAmount = calculateAmount(item.rate, from, to);
    const deliveryFee = pickupOption === 'delivery' ? item.deliveryFee || 0 : 0;
    const totalAmount = rentAmount + (item.depositAmount || 0) + deliveryFee;

    const reference = generateReference('RENT');

    const booking = await RentalBooking.create({
      item: item._id,
      owner: item.owner._id,
      renter: req.user.id,
      startDate: from,
      endDate: to,
      pickupOption,
      pickupTime: new Date(pickupTime),
      deliveryAddress: pickupOption === 'delivery' ? deliveryAddress : undefined,
      rateAtBooking: { amount: item.rate.amount, unit: item.rate.unit },
      depositAmount: item.depositAmount || 0,
      deliveryFee,
      totalAmount,
      payment: { reference, status: 'pending' },
      status: 'pending_payment',
    });
const paystackRes = await initializeTransaction({
  email: req.user.email || req.user.alternateContact,
  amountNaira: totalAmount,
  reference,
  callbackUrl: `${process.env.FRONTEND_URL}/rentals/${item._id}/book`,
  metadata: { bookingId: booking._id.toString(), itemId: item._id.toString(), purpose: 'rental_booking' },
});
if (!paystackRes.status) {
  console.error('Paystack init failed:', paystackRes); // <-- log the actual response
  await RentalBooking.findByIdAndDelete(booking._id);
  return res.status(502).json({
    success: false,
    message: paystackRes.message || 'Could not initialize payment',
  });
}
   

    res.status(201).json({
      success: true,
      booking,
      authorizationUrl: paystackRes.data.authorization_url,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== 2. VERIFY PAYMENT -> CONFIRM BOOKING ====================
export const verifyBookingPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const verification = await verifyTransaction(reference);

    const booking = await RentalBooking.findOne({ 'payment.reference': reference });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (!verification.status || verification.data.status !== 'success') {
      booking.payment.status = 'failed';
      booking.status = 'cancelled';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    if (booking.status !== 'pending_payment') {
      return res.json({ success: true, message: 'Already processed', booking });
    }

    booking.payment.status = 'paid';
    booking.payment.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    // Block the date range on the item now that payment is confirmed
    const item = await RentalItem.findById(booking.item);
    item.bookedRanges.push({ booking: booking._id, from: booking.startDate, to: booking.endDate });
    item.totalBookings += 1;
    await item.save();

    // Real-time: alert the owner that someone wants to rent their item
    notifyUser(booking.owner, SOCKET_EVENTS.NEW_RENTAL_REQUEST, {
      bookingId: booking._id,
      itemId: item._id,
      itemTitle: item.title,
      renter: booking.renter,
      startDate: booking.startDate,
      endDate: booking.endDate,
      pickupOption: booking.pickupOption,
      pickupTime: booking.pickupTime,
    });
    notifyUser(booking.renter, SOCKET_EVENTS.BOOKING_CONFIRMED, { bookingId: booking._id });
    notifyItemWatchers(item._id, SOCKET_EVENTS.ITEM_AVAILABILITY_CHANGED, { itemId: item._id });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== 3. RENTER CONFIRMS THEY GOT THE ITEM ====================
export const markItemCollected = async (req, res) => {
  try {
    const booking = await RentalBooking.findOne({ _id: req.params.bookingId, renter: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Cannot mark collected from status "${booking.status}"` });
    }

    booking.status = 'item_collected';
    booking.itemCollectedAt = new Date();
    await booking.save();

    notifyUser(booking.owner, SOCKET_EVENTS.ITEM_COLLECTED, { bookingId: booking._id });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== 4. EITHER PARTY FLAGS THE ITEM AS RETURNED ====================
export const markItemReturned = async (req, res) => {
  try {
    const booking = await RentalBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.owner.equals(req.user.id);
    const isRenter = booking.renter.equals(req.user.id);
    if (!isOwner && !isRenter) return res.status(403).json({ success: false, message: 'Not part of this booking' });
    if (booking.status !== 'item_collected') {
      return res.status(400).json({ success: false, message: `Cannot mark returned from status "${booking.status}"` });
    }

    // Owner confirming return closes the loop and frees the item immediately.
    // Renter flagging it first puts it in return_requested until owner confirms.
    if (isOwner) {
      booking.status = 'completed';
      booking.itemReturnedAt = new Date();
      await booking.save();
      await freeItemRange(booking);
      notifyUser(booking.renter, SOCKET_EVENTS.RENTAL_COMPLETED, { bookingId: booking._id });
    } else {
      booking.status = 'return_requested';
      await booking.save();
      notifyUser(booking.owner, SOCKET_EVENTS.RETURN_REQUESTED, { bookingId: booking._id });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Owner confirms a renter-initiated return request
export const confirmReturn = async (req, res) => {
  try {
    const booking = await RentalBooking.findOne({ _id: req.params.bookingId, owner: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'return_requested') {
      return res.status(400).json({ success: false, message: 'No pending return request for this booking' });
    }

    booking.status = 'completed';
    booking.itemReturnedAt = new Date();
    await booking.save();
    await freeItemRange(booking);

    notifyUser(booking.renter, SOCKET_EVENTS.RENTAL_COMPLETED, { bookingId: booking._id });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function freeItemRange(booking) {
  const item = await RentalItem.findById(booking.item);
  if (!item) return;
  item.bookedRanges = item.bookedRanges.filter((r) => !r.booking.equals(booking._id));
  await item.save();
  notifyItemWatchers(item._id, SOCKET_EVENTS.ITEM_AVAILABILITY_CHANGED, { itemId: item._id });
}

// ==================== 5. CANCEL (only before item is collected) ====================
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await RentalBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isOwner = booking.owner.equals(req.user.id);
    const isRenter = booking.renter.equals(req.user.id);
    if (!isOwner && !isRenter) return res.status(403).json({ success: false, message: 'Not part of this booking' });
    if (!['pending_payment', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking can no longer be cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellation = { cancelledBy: req.user.id, reason, cancelledAt: new Date() };
    await booking.save();
    await freeItemRange(booking); // no-op if range was never blocked (still pending_payment)

    const otherParty = isOwner ? booking.renter : booking.owner;
    notifyUser(otherParty, SOCKET_EVENTS.BOOKING_CANCELLED, { bookingId: booking._id, reason });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== 6. EXTEND RENTAL (renter pays for more time) ====================
export const requestExtension = async (req, res) => {
  try {
    const { newEndDate } = req.body;
    const booking = await RentalBooking.findOne({ _id: req.params.bookingId, renter: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['confirmed', 'item_collected'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking is not in a rentable state to extend' });
    }

    const requestedEnd = new Date(newEndDate);
    if (requestedEnd <= booking.endDate) {
      return res.status(400).json({ success: false, message: 'newEndDate must be after the current endDate' });
    }

    // Make sure no one else has booked the item in the gap between old and new endDate
    const item = await RentalItem.findById(booking.item);
    const otherRanges = item.bookedRanges.filter((r) => !r.booking.equals(booking._id));
    if (!isRangeFree(otherRanges, booking.endDate, requestedEnd)) {
      return res.status(409).json({ success: false, message: 'Item is booked by someone else right after your current end date' });
    }

    const additionalAmount = calculateAmount(booking.rateAtBooking, booking.endDate, requestedEnd);
    const reference = generateReference('EXT');

    booking.extensions.push({
      previousEndDate: booking.endDate,
      newEndDate: requestedEnd,
      additionalAmount,
      paymentReference: reference,
      paymentStatus: 'pending',
    });
    await booking.save();

    const paystackRes = await initializeTransaction({
      email: req.user.email,
      amountNaira: additionalAmount,
      reference,
      metadata: { bookingId: booking._id.toString(), purpose: 'rental_extension' },
    });

    if (!paystackRes.status) {
      return res.status(502).json({ success: false, message: 'Could not initialize extension payment' });
    }

    res.status(201).json({ success: true, additionalAmount, authorizationUrl: paystackRes.data.authorization_url, reference });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyExtensionPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const verification = await verifyTransaction(reference);

    const booking = await RentalBooking.findOne({ 'extensions.paymentReference': reference });
    if (!booking) return res.status(404).json({ success: false, message: 'Extension not found' });

    const extension = booking.extensions.find((e) => e.paymentReference === reference);

    if (!verification.status || verification.data.status !== 'success') {
      extension.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    if (extension.paymentStatus === 'paid') {
      return res.json({ success: true, message: 'Already processed', booking });
    }

    extension.paymentStatus = 'paid';
    extension.paidAt = new Date();
    booking.endDate = extension.newEndDate;
    booking.totalAmount += extension.additionalAmount;
    await booking.save();

    // Extend the blocked range on the item so it stays unavailable until the new return date
    const item = await RentalItem.findById(booking.item);
    const range = item.bookedRanges.find((r) => r.booking.equals(booking._id));
    if (range) range.to = extension.newEndDate;
    await item.save();

    notifyUser(booking.owner, SOCKET_EVENTS.RENTAL_EXTENDED, { bookingId: booking._id, newEndDate: booking.endDate });
    notifyItemWatchers(item._id, SOCKET_EVENTS.ITEM_AVAILABILITY_CHANGED, { itemId: item._id });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== 7. REVIEWS (both directions, after completion) ====================
export const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await RentalBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review after the rental is completed' });
    }

    const isOwner = booking.owner.equals(req.user.id);
    const isRenter = booking.renter.equals(req.user.id);
    if (!isOwner && !isRenter) return res.status(403).json({ success: false, message: 'Not part of this booking' });

    const role = isRenter ? 'renter_to_owner' : 'owner_to_renter';
    const reviewee = isRenter ? booking.owner : booking.renter;

    const review = await Review.create({
      booking: booking._id,
      item: booking.item,
      reviewer: req.user.id,
      reviewee,
      role,
      rating,
      comment,
    });

    // Keep the item's denormalized rating in sync (only for renter -> owner/item reviews)
    if (role === 'renter_to_owner') {
      const stats = await Review.aggregate([
        { $match: { item: booking.item, role: 'renter_to_owner' } },
        { $group: { _id: '$item', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats.length) {
        await RentalItem.findByIdAndUpdate(booking.item, {
          ratingAverage: stats[0].avg,
          ratingCount: stats[0].count,
        });
      }
    }

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already reviewed this rental' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== LISTINGS ====================
export const getMyBookingsAsRenter = async (req, res) => {
  const bookings = await RentalBooking.find({ renter: req.user.id }).populate('item').sort('-createdAt');
  res.json({ success: true, bookings });
};

export const getMyBookingsAsOwner = async (req, res) => {
  const bookings = await RentalBooking.find({ owner: req.user.id }).populate('item renter', 'title firstName lastName').sort('-createdAt');
  res.json({ success: true, bookings });
};


















