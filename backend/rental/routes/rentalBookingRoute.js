import express from 'express';
import {
  createBooking,
  verifyBookingPayment,
  markItemCollected,
  markItemReturned,
  confirmReturn,
  cancelBooking,
  requestExtension,
  verifyExtensionPayment,
  submitReview,
  getMyBookingsAsRenter,
  getMyBookingsAsOwner,
} from '../controllers/rentalBookingController.js'
import { verifyToken } from '../../middleware/verifyToken.js';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RentalBookings
 *   description: Booking, payment, pickup/return, extension and review flow
 */

/**
 * @swagger
 * /api/rentals/items/{itemId}/book:
 *   post:
 *     summary: Request to rent an item (initializes Paystack payment)
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate, pickupOption, pickupTime]
 *             properties:
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               pickupOption: { type: string, enum: [self-pickup, delivery] }
 *               pickupTime: { type: string, format: date-time }
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   address: { type: string }
 *                   city: { type: string }
 *                   area: { type: string }
 *     responses:
 *       201: { description: Booking created, Paystack authorization URL returned }
 *       409: { description: Date range already booked }
 */
router.post('/items/:itemId/book', verifyToken, createBooking);

/**
 * @swagger
 * /api/rentals/bookings/verify/{reference}:
 *   get:
 *     summary: Verify Paystack payment and confirm the booking (also usable as a webhook/callback target)
 *     tags: [RentalBookings]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking confirmed; owner notified in real time }
 */
router.get('/bookings/verify/:reference', verifyBookingPayment);

/**
 * @swagger
 * /api/rentals/bookings/{bookingId}/collected:
 *   put:
 *     summary: Renter confirms they have received the item
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status moved to item_collected }
 */
router.put('/bookings/:bookingId/collected', verifyToken, markItemCollected);

/**
 * @swagger
 * /api/rentals/bookings/{bookingId}/return:
 *   put:
 *     summary: Flag the item as returned (owner confirming closes it out; renter flagging requests owner confirmation)
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status updated (return_requested or completed); item availability refreshed }
 */
router.put('/bookings/:bookingId/return', verifyToken, markItemReturned);

/**
 * @swagger
 * /api/rentals/bookings/{bookingId}/confirm-return:
 *   put:
 *     summary: Owner confirms a renter-initiated return request
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking completed; item freed for new bookings }
 */
router.put('/bookings/:bookingId/confirm-return', verifyToken, confirmReturn);

/**
 * @swagger
 * /api/rentals/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel a booking before the item has been collected
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { reason: { type: string } }
 *     responses:
 *       200: { description: Booking cancelled; date range freed }
 */
router.put('/bookings/:bookingId/cancel', verifyToken, cancelBooking);

/**
 * @swagger
 * /api/rentals/bookings/{bookingId}/extend:
 *   post:
 *     summary: Request to extend an active rental (initializes payment for the extra time)
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newEndDate]
 *             properties: { newEndDate: { type: string, format: date } }
 *     responses:
 *       201: { description: Extension payment initialized }
 *       409: { description: Item booked by someone else right after current end date }
 */
router.post('/bookings/:bookingId/extend', verifyToken, requestExtension);

/**
 * @swagger
 * /api/rentals/bookings/extend/verify/{reference}:
 *   get:
 *     summary: Verify extension payment and push the item's blocked range out to the new end date
 *     tags: [RentalBookings]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Extension applied }
 */
router.get('/bookings/extend/verify/:reference', verifyExtensionPayment);

/**
 * @swagger
 * /api/rentals/bookings/{bookingId}/review:
 *   post:
 *     summary: Submit a review after a rental is completed (either party may review the other)
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review saved }
 *       400: { description: Already reviewed, or rental not completed yet }
 */
router.post('/bookings/:bookingId/review', verifyToken, submitReview);

/**
 * @swagger
 * /api/rentals/bookings/mine/as-renter:
 *   get:
 *     summary: List bookings where the current user is the renter
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of bookings }
 */
router.get('/bookings/mine/as-renter', verifyToken, getMyBookingsAsRenter);

/**
 * @swagger
 * /api/rentals/bookings/mine/as-owner:
 *   get:
 *     summary: List bookings where the current user is the item owner
 *     tags: [RentalBookings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of bookings }
 */
router.get('/bookings/mine/as-owner', verifyToken, getMyBookingsAsOwner);

export default router;