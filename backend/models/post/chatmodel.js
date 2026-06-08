// models/chat/postChat.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

const postChatSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [messageSchema],
  lastMessage: { type: String },
  lastMessageAt: { type: Date },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

postChatSchema.index({ post: 1, participants: 1 }, { unique: false });
postChatSchema.index({ lastMessageAt: -1 });

const PostChat = mongoose.models.PostChat || mongoose.model('PostChat', postChatSchema);
export default PostChat;