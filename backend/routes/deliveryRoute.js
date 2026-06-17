import express from 'express';
import axios from 'axios';
import DeliveryRequest from '../models/deliveryRequest.js';
import Order from '../models/order/Order.js';
import User from '../models/user.js';
import { sendEmail } from '../utills/sendEmail.js';
import { verifyToken } from '../middleware/verifyToken.js';
import dotenv from "dotenv"
import { getIO } from '../socket.js';



dotenv.config()
const router = express.Router();

// ─── GET ALL RIDERS ───────────────────────────────────────────────────────────
router.get('/riders', verifyToken, async (req, res) => {
  try {
    const riders = await User.find({ isRider: true})
      .select('firstName lastName username profileImage phone riderDetails averageRating');
    res.json({ success: true, riders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/calculate-distance', verifyToken, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    console.log('calculate-distance body:', req.body);

    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'origin and destination required' });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json`;
    const { data } = await axios.get(url, {
      params: {
        origins: origin,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        units: 'metric',
      },
    });

    console.log('Google Maps response:', JSON.stringify(data, null, 2));

    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== 'OK') {
      console.log('Bad element:', element);
      return res.status(400).json({ success: false, message: 'Could not calculate distance' });
    }

    const distanceKm = element.distance.value / 1000;
    const durationMinutes = Math.ceil(element.duration.value / 60);
    const suggestedFee = Math.round(distanceKm * 150);

    res.json({
      success: true,
      distanceKm,
      durationMinutes,
      suggestedFee,
      distanceText: element.distance.text,
      durationText: element.duration.text,
    });
  } catch (err) {
    console.error('calculate-distance error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ─── SEND DELIVERY REQUEST (Seller → Rider) ───────────────────────────────────
router.post('/request', verifyToken, async (req, res) => {
  try {
    const { orderId, riderId, offeredAmount, sellerAddress, distanceKm, durationMinutes } = req.body;
console.log(req.body)
    const order = await Order.findById(orderId).populate('buyer', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const rider = await User.findById(riderId).select('firstName lastName email phone isRider');
    console.log(rider)
    if (!rider || !rider.isRider)

      return res.status(400).json({ success: false, message: 'Invalid rider' });

    const seller = await User.findById(req.user._id).select('firstName lastName email');

    // Cancel any existing pending requests for this order to this rider
    await DeliveryRequest.updateMany(
      { order: orderId, rider: riderId, status: 'pending' },
      { status: 'cancelled' }
    );

    const deliveryReq = await DeliveryRequest.create({
      order: orderId,
      seller: req.user._id,
      rider: riderId,
      buyer: order.buyer._id,
      sellerAddress,
      deliveryAddress: order.delivery.address,
      distanceKm,
      durationMinutes,
      offeredAmount,
      negotiations: [{ from: 'seller', amount: offeredAmount, message: 'Initial offer' }],
    });

    // Notify rider via socket
    getIO().to(`user_${riderId}`).emit('delivery:new_request', {
      requestId: deliveryReq._id,
      orderId,
      offeredAmount,
      sellerAddress,
      deliveryAddress: order.delivery.address,
      distanceKm,
      durationMinutes,
      sellerName: `${seller.firstName} ${seller.lastName}`,
    });

    // Email rider
    await sendEmail({
      to: rider.email,
      subject: '🚴 New Delivery Request',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#881337;padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:#fff;margin:0">New Delivery Request</h2>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #f1f5f9;border-radius:0 0 12px 12px">
            <p>Hi <strong>${rider.firstName}</strong>,</p>
            <p><strong>${seller.firstName} ${seller.lastName}</strong> has sent you a delivery request.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;color:#64748b">Pickup</td><td style="padding:8px;font-weight:600">${sellerAddress}</td></tr>
              <tr style="background:#fdf2f8"><td style="padding:8px;color:#64748b">Delivery</td><td style="padding:8px;font-weight:600">${order.delivery.address}</td></tr>
              <tr><td style="padding:8px;color:#64748b">Distance</td><td style="padding:8px;font-weight:600">${distanceKm?.toFixed(1)} km</td></tr>
              <tr style="background:#fdf2f8"><td style="padding:8px;color:#64748b">Offered Amount</td><td style="padding:8px;font-weight:600;color:#881337">₦${offeredAmount.toLocaleString()}</td></tr>
            </table>
            <p>Log in to accept, reject, or negotiate.</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ success: true, deliveryRequest: deliveryReq });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RIDER: GET MY REQUESTS ───────────────────────────────────────────────────
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await DeliveryRequest.find({ rider: req.user._id })
      .populate('order', 'orderNumber totalAmount delivery items status')
      .populate('seller', 'firstName lastName phone profileImage')
      .populate('buyer', 'firstName lastName phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SELLER: GET REQUESTS FOR AN ORDER ───────────────────────────────────────
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const requests = await DeliveryRequest.find({ order: req.params.orderId, seller: req.user._id })
      .populate('rider', 'firstName lastName phone profileImage riderDetails averageRating')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RIDER: RESPOND (accept / reject / negotiate) ────────────────────────────
router.put('/:requestId/respond', verifyToken, async (req, res) => {
  try {
    const { action, counterAmount, message } = req.body;
    // action: 'accept' | 'reject' | 'negotiate'

    const request = await DeliveryRequest.findById(req.params.requestId)
      .populate('seller', 'firstName lastName email  alternateContact')
      .populate('buyer', 'firstName lastName email  phoneNumber')
      .populate('rider', 'firstName lastName email  phoneNumber profileImage')
      .populate('order', 'orderNumber delivery items totalAmount');

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (String(request.rider._id) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorised' });

    if (action === 'accept') {
      const finalAmount = request.negotiations.at(-1)?.amount || request.offeredAmount;
      request.status = 'accepted';
      request.agreedAmount = finalAmount;
      request.trackingStatus = 'awaiting_pickup';

      // Update order with agreed delivery price
      await Order.findByIdAndUpdate(request.order._id, {
        'delivery.assignedRider': request.rider._id,
        'delivery.agreedDeliveryFee': finalAmount,
        'delivery.deliveryRequestId': request._id,
      });

      // Email seller
      await sendEmail({
        to: request.seller.email || request.seller.alternateContact,
        subject: '✅ Rider Accepted Your Delivery Request',
        html: riderAcceptedEmailHtml(request, finalAmount),
      });

      // Email buyer
      await sendEmail({
        to: request.buyer.email,
        subject: '🚴 Your Order Has Been Assigned to a Rider',
        html: buyerAssignedEmailHtml(request, finalAmount),
      });

      // Socket notify seller and buyer
      getIO().to(`user_${request.seller._id}`).emit('delivery:accepted', { requestId: request._id, agreedAmount: finalAmount });
      getIO().to(`user_${request.buyer._id}`).emit('delivery:assigned', {
        requestId: request._id,
        agreedAmount: finalAmount,
        rider: {
          name: `${request.rider.firstName} ${request.rider.lastName}`,
          phone: request.rider.phone,
          photo: request.rider.profileImage,
        },
      });

    } else if (action === 'reject') {
      request.status = 'rejected';

      await sendEmail({
        to: request.seller.email,
        subject: '❌ Rider Rejected Your Delivery Request',
        html: `<p>Hi ${request.seller.firstName}, <strong>${request.rider.firstName} ${request.rider.lastName}</strong> has rejected your delivery request for order <strong>${request.order.orderNumber}</strong>. Please try another rider.</p>`,
      });

      getIO().to(`user_${request.seller._id}`).emit('delivery:rejected', { requestId: request._id });

    } else if (action === 'negotiate') {
      if (!counterAmount) return res.status(400).json({ success: false, message: 'counterAmount required' });
      request.status = 'negotiating';
      request.negotiations.push({ from: 'rider', amount: counterAmount, message });

      await sendEmail({
        to: request.seller.email,
        subject: '💬 Rider Counter-Offer on Delivery',
        html: `<p>Hi ${request.seller.firstName}, <strong>${request.rider.firstName}</strong> has countered with <strong>₦${counterAmount.toLocaleString()}</strong> for order ${request.order.orderNumber}. ${message ? `Message: "${message}"` : ''} Log in to respond.</p>`,
      });

      getIO().to(`user_${request.seller._id}`).emit('delivery:negotiation', {
        requestId: request._id,
        counterAmount,
        message,
        from: 'rider',
      });
    }

    await request.save();
    res.json({ success: true, request });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SELLER: COUNTER-NEGOTIATE ────────────────────────────────────────────────
router.put('/:requestId/counter', verifyToken, async (req, res) => {
  try {
    const { counterAmount, message } = req.body;
    const request = await DeliveryRequest.findById(req.params.requestId)
      .populate('rider', 'firstName lastName email')
      .populate('seller', 'firstName lastName');

    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(request.seller._id) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorised' });

    request.status = 'negotiating';
    request.negotiations.push({ from: 'seller', amount: counterAmount, message });
    await request.save();

    await sendEmail({
      to: request.rider.email,
      subject: '💬 New Counter-Offer from Seller',
      html: `<p>Hi ${request.rider.firstName}, <strong>${request.seller.firstName}</strong> has countered with <strong>₦${counterAmount.toLocaleString()}</strong>. ${message ? `Message: "${message}"` : ''} Log in to respond.</p>`,
    });

    getIO().to(`user_${request.rider._id}`).emit('delivery:negotiation', {
      requestId: request._id,
      counterAmount,
      message,
      from: 'seller',
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RIDER: UPDATE TRACKING STATUS ───────────────────────────────────────────
router.put('/:requestId/tracking', verifyToken, async (req, res) => {
  try {
    const { trackingStatus } = req.body;
    const validStatuses = ['awaiting_pickup', 'on_the_way', 'arrived'];
    if (!validStatuses.includes(trackingStatus))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const request = await DeliveryRequest.findById(req.params.requestId)
      .populate('seller', 'firstName lastName email')
      .populate('buyer', 'firstName lastName email');

    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(request.rider) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorised' });

    request.trackingStatus = trackingStatus;
    await request.save();

    const statusLabels = {
      on_the_way: 'On the way',
      arrived: 'Arrived at destination',
    };

    // Notify both seller and buyer
    const label = statusLabels[trackingStatus];
    if (label) {
      try {
          [request.seller, request.buyer].forEach(async (person) => {
        await sendEmail({
          to: person.email || person.alternateContact,
          subject: `📍 Delivery Update: ${label}`,
          html: `<p>Hi ${person.firstName}, your rider is now <strong>${label}</strong>.</p>`,
        });
      });
      } catch (error) {
        console.log(error)
      }
    
    }

    getIO().to(`user_${request.seller._id}`).emit('delivery:tracking_update', { requestId: request._id, trackingStatus });
    getIO().to(`user_${request.buyer._id}`).emit('delivery:tracking_update', { requestId: request._id, trackingStatus });

    res.json({ success: true, trackingStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RIDER: UPDATE LOCATION (real-time) ──────────────────────────────────────
router.put('/:requestId/location', verifyToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const request = await DeliveryRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(request.rider) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorised' });

    request.riderLocation = { lat, lng, updatedAt: new Date() };
    await request.save();

    // Broadcast to seller and buyer rooms
    getIO().to(`user_${request.seller}`).emit('delivery:location_update', { requestId: request._id, lat, lng });
    getIO().to(`user_${request.buyer}`).emit('delivery:location_update', { requestId: request._id, lat, lng });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── RIDER: VERIFY DELIVERY CODE ─────────────────────────────────────────────
router.post('/:requestId/verify-code', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const request = await DeliveryRequest.findById(req.params.requestId)
      .populate('order')
      .populate('seller', 'firstName email')
      .populate('buyer', 'firstName email');

    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(request.rider) !== String(req.user._id))
      return res.status(403).json({ success: false, message: 'Not authorised' });

    const order = request.order;
    if (order.delivery.deliveryCode !== code)
      return res.status(400).json({ success: false, message: 'Incorrect delivery code. Please try again.' });

    // Mark delivered
    order.delivery.isCodeVerified = true;
    order.status = 'delivered';
    order.seller = request.seller._id
    await order.save();

    request.trackingStatus = 'collected';
    await request.save();

    // Notify both
    getIO().to(`user_${request.seller._id}`).emit('delivery:tracking_update', { requestId: request._id, trackingStatus: 'collected' });
    getIO().to(`user_${request.buyer._id}`).emit('delivery:tracking_update', { requestId: request._id, trackingStatus: 'collected' });

    try {
        await sendEmail({
      to: request.buyer.email || request.buyer.alternateContact,
      subject: '✅ Order Delivered Successfully!',
      html: `<p>Hi ${request.buyer.firstName}, your order <strong>${order.orderNumber}</strong> has been delivered. Thank you for shopping with us!</p>`,
    });

    await sendEmail({
      to: request.seller.email || request.seller.alternateContact ,
      subject: '✅ Order Delivered',
      html: `<p>Hi ${request.seller.firstName}, order <strong>${order.orderNumber}</strong> has been delivered successfully.</p>`,
    });
    } catch (error) {
      console.log(error)
    }

  

    res.json({ success: true, message: 'Order marked as delivered!' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET SINGLE REQUEST (for tracking page) ───────────────────────────────────
router.get('/:requestId', verifyToken, async (req, res) => {
  try {
    const request = await DeliveryRequest.findById(req.params.requestId)
      .populate('order', 'orderNumber delivery items totalAmount status')
      .populate('seller', 'firstName lastName phone profileImage address')
      .populate('rider', 'firstName lastName phone profileImage riderDetails')
      .populate('buyer', 'firstName lastName phone');
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── EMAIL HELPERS ────────────────────────────────────────────────────────────
function riderAcceptedEmailHtml(request, amount) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#881337;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0">Rider Accepted!</h2>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #f1f5f9;border-radius:0 0 12px 12px">
        <p>Hi <strong>${request.seller.firstName}</strong>,</p>
        <p><strong>${request.rider.firstName} ${request.rider.lastName}</strong> has accepted your delivery request.</p>
        <p>Agreed delivery fee: <strong style="color:#881337">₦${amount.toLocaleString()}</strong></p>
        <p>The buyer has been notified. You can now hand over the order.</p>
      </div>
    </div>`;
}

function buyerAssignedEmailHtml(request, amount) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#881337;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0">Your Order is on its way! 🚴</h2>
      </div>
      <div style="padding:24px;background:#fff;border:1px solid #f1f5f9;border-radius:0 0 12px 12px">
        <p>Hi <strong>${request.buyer.firstName}</strong>,</p>
        <p>Your order has been assigned to a rider.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b">Rider Name</td><td style="padding:8px;font-weight:600">${request.rider.firstName} ${request.rider.lastName}</td></tr>
          <tr style="background:#fdf2f8"><td style="padding:8px;color:#64748b">Rider Phone</td><td style="padding:8px;font-weight:600">${request.rider.phone}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Delivery Fee</td><td style="padding:8px;font-weight:600;color:#881337">₦${amount.toLocaleString()}</td></tr>
          <tr style="background:#fdf2f8"><td style="padding:8px;color:#64748b">Delivery Address</td><td style="padding:8px;font-weight:600">${request.order.delivery?.address}</td></tr>
        </table>
        <p>You can track your rider in real time from your order page.</p>
        <p style="background:#fef2f2;border-left:4px solid #881337;padding:12px;border-radius:4px">
          <strong>Your delivery code: ${request.order.delivery?.deliveryCode}</strong><br/>
          Share this code with the rider <strong>only</strong> when they arrive to confirm delivery.
        </p>
      </div>
    </div>`;
}

export default router;