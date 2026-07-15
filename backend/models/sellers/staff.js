// models/staff/Staff.js
import mongoose from 'mongoose';

// Keep this list in sync with the "Seller Tools" pages in Dashboard.jsx
export const SIDEBAR_KEYS = [
  'stock', 'inventory', 'POS', 'sellerDelivery',
  'deliveryTracking', 'sellerChain', 'products', 'customerAnalytics',
];

const defaultPermissions = () =>
  SIDEBAR_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {});

const staffSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, trim: true },
    age: { type: Number, min: 16 },
    role: { type: String, trim: true }, // e.g. Cashier, Sales Rep, Store Manager

    // 4-digit login PIN. Intentionally plain text — the creator needs to be
    // able to view/reissue it at a glance from the Control Room, so it's
    // treated as a low-stakes access PIN rather than a real password.
    code: { type: String, required: true },

    isActive: { type: Boolean, default: true },

    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: defaultPermissions,
    },

    lastLoginAt: Date,
  },
  { timestamps: true }
);

staffSchema.index({ creator: 1, code: 1 });

export default mongoose.model('Staff', staffSchema);