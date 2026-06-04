import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Conversation = unique (deal, sender, recipient) pair — normalized so smaller id is always first
const conversationSchema = new mongoose.Schema(
  {
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // always 2
    messages: [messageSchema],
    lastMessage: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);