import mongoose from 'mongoose';

// Tracks a voucher application from reservation through confirm/release,
// independent of the Order it eventually attaches to (the reservation is
// created BEFORE the order exists — Paystack hasn't been charged yet).
//
// This is also what backs admin visibility into every voucher-funded
// transaction, including which seller(s) the discounted items belonged to.
const voucherRedemptionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    code: { type: String, required: true },
    voucherCategory: { type: String, required: true }, // as returned by wallet API
    voucherType: { type: String, enum: ['fixed', 'percentage'] },

    orderReference: { type: String, required: true, unique: true }, // ours, sent to wallet as order_reference
    redemptionReference: { type: String, index: true }, // wallet's reference, set once reserved

    matchedItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        quantity: Number,
        subtotalKobo: Number,
      },
    ],
    unmatchedSubtotalKobo: { type: Number, default: 0 }, // rest of the cart, untouched by the voucher
    matchedSubtotalKobo: { type: Number, required: true }, // what was sent to wallet as cart_kobo

    discountKobo: { type: Number, required: true },
    amountToChargeKobo: { type: Number, required: true }, // matched-portion remainder after discount
    deliveryFeeKobo: { type: Number, default: 0 },
    grandTotalToChargeKobo: { type: Number, required: true }, // what Paystack actually charges the buyer

    status: {
      type: String,
      enum: ['reserved', 'confirmed', 'released', 'expired', 'failed'],
      default: 'reserved',
      index: true,
    },

    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // set once the order is created post-confirm

    paystackReference: String,
    reservedExpiresAt: Date,
    confirmedAt: Date,
    releasedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('VoucherRedemption', voucherRedemptionSchema);