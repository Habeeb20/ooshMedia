


import mongoose from 'mongoose';

// Full audit trail of "where did the money for this order go". One row per
// seller-share / platform-fee / transport-fee movement, for every order.
const settlementHistorySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = estore itself
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = estore itself

    // Only set on 'transport_fee' rows — the rider assigned to this order's
    // delivery, so ops can see who to remit the transport fee to. May be
    // null at first (rider isn't always assigned at checkout time) and gets
    // synced in later once one is assigned.
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Amount actually owed to the rider — defaults to delivery.agreedDeliveryFee
    // when set, otherwise the full transportFee charged to the buyer. Kept
    // separate from `amount` (what the estore collected) since the two can differ.
    riderAmount: { type: Number, default: null },

    type: {
      type: String,
        enum: ['sale_share', 'platform_fee', 'transport_fee', 'loyalty_points', 'loyalty_redemption'],
  
      required: true,
    },

    amount: { type: Number, required: true },

    destination: {
      type: String,
      enum: ['seller_subaccount', 'estore'],
      required: true,
    },

    // How the money actually moved (or is expected to move)
    method: {
      type: String,
      enum: ['split', 'fallback_main_account', 'transfer', 'cash_pending', 'loyalty_points'],
      required: true,
    },

    // Whether the estore has *collected* this amount (split settled by
    // Paystack, cash received, etc). This is NOT the same as the seller/rider
    // having been paid out — see payoutStatus below for that.
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    // ==================== ADMIN MANUAL PAYOUT TRACKING ====================
    // Only meaningful for rows where money is sitting in the estore account
    // but is owed OUT to a seller or rider (sale_share with destination
    // 'estore', or any transport_fee row with a riderAmount). Rows paid
    // automatically via Paystack split are 'not_applicable' — Paystack
    // already sent that money directly, nothing for an admin to do.
    payoutStatus: {
      type: String,
      enum: ['not_applicable', 'owed', 'paid', 'payout_failed'],
      default: 'not_applicable',
      index: true,
    },
    payoutReference: String,        // Paystack transfer_code for the manual payout
    payoutAmount: Number,           // what was actually transferred (== amount or riderAmount)
    paidAt: Date,
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who triggered it
    payoutError: String,

    paymentMethod: { type: String, enum: ['online', 'on_delivery'] },

    paystackReference: String,
    paystackTransferCode: String,
    splitCode: String,

    error: String,
    meta: mongoose.Schema.Types.Mixed,

    type: {
  type: String,
  enum: ['sale_share', 'platform_fee', 'transport_fee', 'loyalty_redemption'],
  required: true,
},
// for loyalty_redemption rows specifically:
loyaltyPointsUsed: Number,
loyaltyValueNGN: Number,   // 1 point = ₦1 (adjust ratio as needed)
  },
  { timestamps: true }
);

settlementHistorySchema.index({ seller: 1, createdAt: -1 });
settlementHistorySchema.index({ order: 1, type: 1 });
settlementHistorySchema.index({ payoutStatus: 1, createdAt: -1 });

// Keep payoutStatus in sync automatically whenever a row is created/edited
// directly through .save() (bulk insertMany/updateMany calls in the order
// controller still need to set it explicitly — see adminSettlementController
// helper `computeInitialPayoutStatus`).
settlementHistorySchema.pre('save', function (next) {
  if (this.isNew && this.payoutStatus === 'not_applicable') {
    const oweable =
      (this.type === 'sale_share' && this.destination === 'estore' && this.method !== 'split') ||
      (this.type === 'transport_fee' && this.riderAmount > 0);
    if (oweable) this.payoutStatus = 'owed';
  }

});

export default mongoose.model('SettlementHistory', settlementHistorySchema);

// NOTE for callers using insertMany() (e.g. recordCheckoutSettlementHistory in
// the order controller): insertMany does NOT run the pre('save') hook above,
// so `payoutStatus` must be set explicitly on each row object before passing
// it in. .create() and .save() calls (e.g. settleCashOrderPayouts) don't need
// this — the hook already handles them.
export const computeInitialPayoutStatus = ({ type, destination, method, riderAmount }) => {
  const oweable =
    (type === 'sale_share' && destination === 'estore' && method !== 'split') ||
    (type === 'transport_fee' && riderAmount > 0);
     (type === 'loyalty_redemption')
  return oweable ? 'owed' : 'not_applicable';
};


