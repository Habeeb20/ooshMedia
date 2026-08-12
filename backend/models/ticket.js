import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Snapshot of contact details at time of submission (denormalized on purpose,
    // so the ticket still makes sense even if the user later edits their profile)
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },

    subject: { type: String, required: true, maxlength: 255 },
    description: { type: String, required: true },

    status: {
      type: String,
      enum: ['open', 'pending', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },

    // Result of the call to the external support/helpdesk API
    external: {
      synced: { type: Boolean, default: false },
      ticketId: String, // ID returned by api-esurpport.edirect.ng
      error: String, // last sync error, if any, for debugging
      syncedAt: Date,
    },

    // Thread of replies, in case you want to show a conversation view later
    // (populate this yourself once you wire up webhooks/polling for agent replies)
    replies: [
      {
        from: { type: String, enum: ['user', 'agent'], required: true },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

ticketSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Ticket', ticketSchema);