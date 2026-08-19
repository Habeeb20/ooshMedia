import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  channel: { type: String, default: 'paystack' },
  paidAt: Date,
}, { timestamps: true });

export default mongoose.model('FeePayment', feePaymentSchema);