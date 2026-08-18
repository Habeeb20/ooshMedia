import mongoose from 'mongoose';

// Full audit trail of "where did the money for this order go". One row per
// seller-share / platform-fee / transport-fee movement, for every order.
const settlementHistorySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = estore itself

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
      enum: ['sale_share', 'platform_fee', 'transport_fee'],
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
      enum: ['split', 'fallback_main_account', 'transfer', 'cash_pending'],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    paymentMethod: { type: String, enum: ['online', 'on_delivery'] },

    paystackReference: String,
    paystackTransferCode: String,
    splitCode: String,

    error: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

settlementHistorySchema.index({ seller: 1, createdAt: -1 });
settlementHistorySchema.index({ order: 1, type: 1 });

export default mongoose.model('SettlementHistory', settlementHistorySchema);