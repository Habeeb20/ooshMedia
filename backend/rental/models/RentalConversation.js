import mongoose from 'mongoose';

const rentalConversationSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalBooking', required: true, unique: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // [owner, renter]

    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: Date,
    },

    // Per-user unread count, keyed by userId string, e.g. { "64f...": 3 }
    unreadCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

rentalConversationSchema.index({ participants: 1 });

export default mongoose.model('RentalConversation', rentalConversationSchema);