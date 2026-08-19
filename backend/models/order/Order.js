


import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  subtotal: Number,
  platformFee: Number,      // 1% of subtotal
  sellerAmount: Number,     // subtotal - platformFee
  transferStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  paystackTransferCode: String,
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  items: [orderItemSchema],

  fulfillmentType: { type: String, enum: ['pickup', 'delivery'], required: true },

  // Pickup details
  pickup: {
    pickedUpBy: { type: String, enum: ['self', 'agent'] },
    agentPhone: String,
    agentName: String,
    code: { type: String },                              // ← 4-digit code, same idea as delivery
    isCodeVerified: { type: Boolean, default: false },    // ← seller confirms buyer's code
  },

  // Delivery details
  delivery: {
    address: { type: String },
    deliveryCode: { type: String },         // 4-digit code
    isCodeVerified: { type: Boolean, default: false },
    assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agreedDeliveryFee: { type: Number },
    deliveryRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryRequest' },
  },

  // Distance-based transport fee (delivery orders only). Always settles to
  // the estore account — never included in a seller's split share.
  transportFee: { type: Number, default: 0 },
  transportFeeDetails: {
    distanceKm: Number,
    ratePerKm: Number,
    baseFee: Number,
    source: String,          // 'api' | 'haversine' | 'fallback_no_coordinates' | 'fallback_error'
    breakdown: [{
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      distanceKm: Number,
      fee: Number,
      source: String,
    }],
  },

  paymentMethod: { type: String, enum: ['online', 'on_delivery'], required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paystackReference: String,
  paystackAccessCode: String,

  // Whether the online payment used a Paystack split (direct-to-seller) or
  // fell back to a plain charge into the estore account.
  paystackSplitUsed: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },

  totalAmount: { type: Number, required: true },       // subtotal + transportFee (what buyer pays)
  totalPlatformFee: Number,
  totalSellerAmount: Number,

  loyaltyPointsAwarded: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },

  notes: String,
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }

});

export default mongoose.model('Order', orderSchema);