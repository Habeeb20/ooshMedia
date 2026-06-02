import mongoose from 'mongoose';

const loyaltySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalPoints: { type: Number, default: 0 },
  usedPoints: { type: Number, default: 0 },
  history: [{
    type: { type: String, enum: ['earned', 'spent'] },
    points: Number,
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    description: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

loyaltySchema.virtual('availablePoints').get(function () {
  return this.totalPoints - this.usedPoints;
});

export default mongoose.model('Loyalty', loyaltySchema);
