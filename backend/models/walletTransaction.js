import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  type: {
    type: String,
    enum: ['transfer', 'withdrawal', 'deposit', 'airtime', 'bill'],
    required: true,
  },

  direction: {
    type: String,
    enum: ['debit', 'credit'],
    required: true,
  },

  amount: { type: Number, required: true, min: 0 },

  fee: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },

  // Recipient info (for transfers/withdrawals)
  recipient: {
    accountNumber: String,
    accountName:   String,
    bankName:      String,
    bankCode:      String,
  },

  // Reference IDs
  reference:         { type: String, unique: true, sparse: true }, // our own ref
  externalReference: { type: String },                             // from wallet API
  transferCode:      { type: String },                             // from wallet API

  narration:  { type: String },
  failReason: { type: String },

  // Raw API response snapshot (fallback data)
  apiSnapshot: { type: mongoose.Schema.Types.Mixed },

  // Balance snapshot at time of transaction
  balanceBefore: { type: Number },
  balanceAfter:  { type: Number },

}, { timestamps: true });

// Auto-generate reference before save
walletTransactionSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
  next();
});

walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ reference: 1 });
walletTransactionSchema.index({ status: 1 });

export default mongoose.model('WalletTransaction', walletTransactionSchema);