import mongoose from "mongoose";
import voucherCategories from "../utills/voucherCategories.js";

// One entry per user who has redeemed the voucher. A user can appear at
// most once (enforced at the query level, not just here) — that's what
// makes each voucher usable exactly `numberOfUsers` times, once per user.
const voucherRedemptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    allocatedShareKobo: { type: Number, required: true }, // this voucher's fixed per-user share
    amountUsedKobo: { type: Number, required: true }, // what was actually deducted (<= allocatedShareKobo)

    matchedItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        quantity: Number,
        subtotalKobo: Number,
        amountCoveredKobo: Number, // this item's share of the voucher discount
      },
    ],

    usedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const voucherSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, sparse: true, uppercase: true, trim: true, index: true },

    category: { type: String, required: true, enum: voucherCategories },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    totalAmountKobo: { type: Number, required: true, min: 50000 }, // ₦500 minimum — see README for this assumption
    numberOfUsers: { type: Number, required: true, min: 1, max: 10 },
    perUserShareKobo: { type: Number, required: true }, // floor(totalAmountKobo / numberOfUsers)

    expiresAt: { type: Date, required: true },

    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending", index: true },
    paystackReference: { type: String, unique: true, sparse: true },
    paystackAccessCode: String,
    paidAt: Date,

    status: {
      type: String,
      enum: ["pending_payment", "active", "fully_redeemed", "expired", "cancelled"],
      default: "pending_payment",
      index: true,
    },

    redemptions: [voucherRedemptionSchema],
  },
  { timestamps: true }
);

voucherSchema.index({ createdBy: 1, createdAt: -1 });
voucherSchema.index({ "redemptions.matchedItems.seller": 1 });

voucherSchema.virtual("slotsUsed").get(function () {
  return this.redemptions.length;
});
voucherSchema.virtual("slotsRemaining").get(function () {
  return Math.max(this.numberOfUsers - this.redemptions.length, 0);
});

voucherSchema.set("toJSON", { virtuals: true });
voucherSchema.set("toObject", { virtuals: true });

export default mongoose.models.Voucher || mongoose.model("Voucher", voucherSchema);
