
import Ticket from '../models/ticket.js';
import User from '../models/user.js';
import { safeCreateExternalTicket } from '../utills/supportApi.js';
// POST /api/tickets  (auth required — req.user comes from your JWT middleware)
export const createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required.' });
    }

    const user = await User.findById(req.user._id).select(
      'firstName lastName email phoneNumber alternateContact'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const customerName = `${user.firstName} ${user.lastName}`.trim();
    const customerEmail = user.email || user.alternateContact;
    const customerPhone = user.phoneNumber;
console.log(customerEmail)
    if (!customerEmail) {
      return res.status(400).json({
        message: 'Add an email address to your profile before submitting a support ticket.',
      });
    }

    // 1. Save locally first — this is the source of truth for your app
    const ticket = await Ticket.create({
      user: user._id,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      description,
    });

    // 2. Sync to the external helpdesk — never blocks the response on failure
    const result = await safeCreateExternalTicket({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      subject,
      description,
    });

    if (result.ok) {
      ticket.external.synced = true;
      ticket.external.ticketId = result.ticketId;
      ticket.external.syncedAt = new Date();
      console.log("succesfully submitted")
    } else {
      ticket.external.synced = false;
      ticket.external.error = result.error;
    }
    await ticket.save();

    return res.status(201).json({
      message: 'Support ticket submitted.',
      ticket,
    });
  } catch (err) {
    console.error('[createTicket] Error:', err);
    return res.status(500).json({ message: 'Failed to submit ticket. Please try again.' });
  }
};

// GET /api/tickets  (the logged-in user's own tickets)
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ tickets });
  } catch (err) {
    console.error('[getMyTickets] Error:', err);
    return res.status(500).json({ message: 'Failed to fetch tickets.' });
  }
};

// GET /api/tickets/:id
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    return res.status(200).json({ ticket });
  } catch (err) {
    console.error('[getTicketById] Error:', err);
    return res.status(500).json({ message: 'Failed to fetch ticket.' });
  }
};