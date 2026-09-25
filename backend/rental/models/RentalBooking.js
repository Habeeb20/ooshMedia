import mongoose from 'mongoose';

const extensionSchema = new mongoose.Schema(
  {
    previousEndDate: { type: Date, required: true },
    newEndDate: { type: Date, required: true },
    additionalAmount: { type: Number, required: true },
    paymentReference: String,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    paidAt: Date,
  },
  { _id: true }
);

const rentalBookingSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Current effective range (extensions push endDate forward)
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    pickupOption: { type: String, enum: ['self-pickup', 'delivery'], required: true },
    pickupTime: { type: Date, required: true }, // exact date+time renter selected for pickup
    deliveryAddress: {
      address: String,
      city: String,
      area: String,
    },

    rateAtBooking: {
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    depositAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }, // rate*duration + deposit + deliveryFee (at time of booking)

    payment: {
      reference: { type: String, unique: true, sparse: true },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      paidAt: Date,
    },

    status: {
      type: String,
      enum: [
        'pending_payment', // booking created, awaiting Paystack confirmation
        'confirmed', // paid, owner notified, item held for pickup/delivery
        'item_collected', // renter confirmed they received the item
        'return_requested', // renter/owner has flagged the item as returned, awaiting confirmation
        'completed', // return confirmed, item is free again
        'cancelled',
      ],
      default: 'pending_payment',
      index: true,
    },

    itemCollectedAt: Date,
    itemReturnedAt: Date,

    extensions: [extensionSchema],

    deliveryAddress: {
  address: String,
  city: String,
  area: String,
  state: String,   // NEW — required when pickupOption === 'delivery'
  lga: String,      // NEW — optional, improves fee accuracy
},

    cancellation: {
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      cancelledAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('RentalBooking', rentalBookingSchema);