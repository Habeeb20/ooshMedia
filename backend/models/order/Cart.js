import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  price: Number,        // snapshot at time of adding
  name: String,
  image: String,
});

const cartSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  fulfillmentType: { type: String, enum: ['pickup', 'delivery'], default: 'delivery' },
  pickup: {
    pickedUpBy: { type: String, enum: ['self', 'agent'], default: 'self' },
    agentPhone: String,
    agentName: String,
  },
  delivery: {
    address: String,
  },
  paymentMethod: { type: String, enum: ['online', 'on_delivery'], default: 'online' },
}, { timestamps: true });

cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

export default mongoose.model('Cart', cartSchema);
