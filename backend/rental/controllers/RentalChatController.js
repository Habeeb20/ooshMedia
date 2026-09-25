import RentalBooking from '../models/RentalBooking.js';
import RentalConversation from '../models/RentalConversation.js';
import RentalMessage from '../models/Rentalmessage.js';

import { notifyUser, SOCKET_EVENTS } from '../utils/socket.js';

// Add these two to your existing SOCKET_EVENTS map in utils/socket.js:
//   NEW_MESSAGE: 'rental:new_message',
//   MESSAGES_READ: 'rental:messages_read',
// (Everything else — notifyUser, the socket registry — is reused as-is.)

// Chat only opens once the rental is actually on: payment has gone through
// at least once. Blocked while still pending_payment; still allowed through
// item_collected / return_requested / completed so pickup/return logistics
// and post-rental questions can be handled in the same thread. Cancelled
// bookings can still be read but not written to.
const CHATTABLE_STATUSES = ['confirmed', 'item_collected', 'return_requested', 'completed'];

async function assertParticipant(booking, userId) {
  const isOwner = booking.owner.equals(userId);
  const isRenter = booking.renter.equals(userId);
  if (!isOwner && !isRenter) {
    const err = new Error('Not part of this booking');
    err.statusCode = 403;
    throw err;
  }
  return { isOwner, isRenter };
}

async function getOrCreateConversation(booking) {
  let conversation = await RentalConversation.findOne({ booking: booking._id });
  if (conversation) return conversation;

  conversation = await RentalConversation.create({
    booking: booking._id,
    item: booking.item,
    participants: [booking.owner, booking.renter],
    unreadCounts: { [booking.owner.toString()]: 0, [booking.renter.toString()]: 0 },
  });
  return conversation;
}

// ==================== SEND MESSAGE ====================
// POST /api/rentals/bookings/:bookingId/messages   { text }
export const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Message text is required.' });

    const booking = await RentalBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const { isOwner } = await assertParticipant(booking, req.user.id);

    if (!CHATTABLE_STATUSES.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: booking.status === 'pending_payment'
          ? 'Chat unlocks once your payment is confirmed.'
          : 'This rental has been cancelled — chat is closed.',
      });
    }

    const conversation = await getOrCreateConversation(booking);
    const otherUserId = isOwner ? booking.renter : booking.owner;

    const message = await RentalMessage.create({
      conversation: conversation._id,
      sender: req.user.id,
      text: text.trim(),
      readBy: [req.user.id],
    });

    conversation.lastMessage = { text: message.text, sender: req.user.id, sentAt: message.createdAt };
    const currentUnread = conversation.unreadCounts.get(otherUserId.toString()) || 0;
    conversation.unreadCounts.set(otherUserId.toString(), currentUnread + 1);
    await conversation.save();

    // Real-time push to the other party, same pattern as your other
    // notifyUser() calls elsewhere in rentalBookingController.js.
    notifyUser(otherUserId, SOCKET_EVENTS.NEW_MESSAGE, {
      conversationId: conversation._id,
      bookingId: booking._id,
      message: {
        _id: message._id,
        text: message.text,
        sender: req.user.id,
        createdAt: message.createdAt,
      },
    });

    res.status(201).json({ success: true, message, conversationId: conversation._id });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ==================== GET MESSAGES (+ marks them read) ====================
// GET /api/rentals/bookings/:bookingId/messages?before=<ISO date>&limit=30
export const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { before, limit = 30 } = req.query;

    const booking = await RentalBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    await assertParticipant(booking, req.user.id);

    const conversation = await RentalConversation.findOne({ booking: booking._id });
    if (!conversation) return res.json({ success: true, messages: [], conversationId: null });

    const query = { conversation: conversation._id };
    if (before) query.createdAt = { $lt: new Date(before) };

    const messages = await RentalMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 100))
      .populate('sender', 'firstName lastName profilePicture');

    // Mark unread messages as read by this user, and clear their unread count.
    await RentalMessage.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user.id }, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    conversation.unreadCounts.set(req.user.id.toString(), 0);
    await conversation.save();

    const otherUserId = booking.owner.equals(req.user.id) ? booking.renter : booking.owner;
    notifyUser(otherUserId, SOCKET_EVENTS.MESSAGES_READ, { conversationId: conversation._id, readBy: req.user.id });

    res.json({ success: true, messages: messages.reverse(), conversationId: conversation._id });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// ==================== MY CONVERSATIONS (inbox list) ====================
// GET /api/rentals/conversations
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await RentalConversation.find({ participants: req.user.id })
      .sort({ 'lastMessage.sentAt': -1 })
      .populate('item', 'title images')
      .populate('participants', 'firstName lastName profilePicture')
      .populate({ path: 'booking', select: 'status startDate endDate' });

    const withUnread = conversations.map((c) => ({
      ...c.toObject(),
      unreadCount: c.unreadCounts.get(req.user.id.toString()) || 0,
    }));

    res.json({ success: true, conversations: withUnread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};