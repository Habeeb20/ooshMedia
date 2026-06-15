import mongoose from 'mongoose';

const negotiationSchema = new mongoose.Schema({
  from: { type: String, enum: ['seller', 'rider'], required: true },
  amount: { type: Number, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const deliveryRequestSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    sellerAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    distanceKm: { type: Number },
    durationMinutes: { type: Number },

    offeredAmount: { type: Number, required: true },   // seller's initial offer
    agreedAmount: { type: Number },                    // final agreed price
    negotiations: [negotiationSchema],

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'negotiating', 'cancelled'],
      default: 'pending',
    },

    trackingStatus: {
      type: String,
      enum: ['awaiting_pickup', 'on_the_way', 'arrived', 'collected'],
      default: 'awaiting_pickup',
    },

    riderLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('DeliveryRequest', deliveryRequestSchema);