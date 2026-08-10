// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedSeller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  reason: {
    type: String,
 
    required: true,
  },
  otherReason: { type: String, trim: true, maxlength: 200 }, // required when reason === 'Other'
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  incidentDate: { type: Date }, // optional

  relatedProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending',
    index: true,
  },
  adminNotes: { type: String, trim: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true });

reportSchema.index({ reportedSeller: 1, status: 1 });
reportSchema.index({ reporter: 1, reportedSeller: 1 });

export default mongoose.model('Report', reportSchema);