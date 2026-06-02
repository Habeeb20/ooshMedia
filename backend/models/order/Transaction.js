import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['sale', 'refund', 'transfer', 'pos_sale'], required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  sellerAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['online', 'on_delivery', 'pos_cash', 'pos_transfer'] },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paystackReference: String,
  paystackTransferCode: String,
  description: String,
  // POS-specific fields
  isPOS: { type: Boolean, default: false },
  customerName: String,
  customerPhone: String,
  receiptNumber: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    subtotal: Number,
  }],
}, { timestamps: true });

transactionSchema.pre('save', async function (next) {
  if (!this.receiptNumber && this.isPOS) {
    const count = await mongoose.model('Transaction').countDocuments({ isPOS: true });
    this.receiptNumber = `RCP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }

});

export default mongoose.model('Transaction', transactionSchema);
