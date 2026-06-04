import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, default: 0 },
    totalPurchased: { type: Number, default: 0 },
    transactions: [
      {
        reference: { type: String }, // Paystack reference
        amount: { type: Number },    // Amount in kobo
        pointsAdded: { type: Number },
        status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);