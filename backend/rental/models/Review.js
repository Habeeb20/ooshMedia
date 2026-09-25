import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalBooking', required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalItem', required: true, index: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Who is reviewing whom, in this rental
    role: { type: String, enum: ['renter_to_owner', 'owner_to_renter'], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// A booking can only get one review per direction (prevents double-reviewing the same rental)
reviewSchema.index({ booking: 1, role: 1 }, { unique: true });

export default mongoose.model('Reviewrental', reviewSchema);