import mongoose from 'mongoose';

const rentalMessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalConversation', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    attachments: [
      {
        url: String,
        publicId: String,
        type: { type: String, enum: ['image', 'video', 'file'], default: 'image' },
      },
    ],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

rentalMessageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model('RentalMessage', rentalMessageSchema);