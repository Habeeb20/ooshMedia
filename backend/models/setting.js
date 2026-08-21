import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'global' },
  allowLoyaltyUsage: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);



