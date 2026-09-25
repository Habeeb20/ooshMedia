import mongoose from 'mongoose';

const rentalItemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    category: {  type: String, required: true, trim: true },
    subcategory: {  type: String, required: true, trim: true }, // matches Category.subcategories._id

    // ==================== MEDIA ====================
    // Uploaded on the frontend to Cloudinary; only the resulting url/publicId is stored here.
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    // Optional — only allowed if owner has videoSubscription.creditsRemaining > 0 (enforced in controller)
    videos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    // ==================== RATE & DEPOSIT ====================
    rate: {
      amount: { type: Number, required: true, min: 0 },
      unit: { type: String, enum: ['hour', 'day', 'week', 'month'], default: 'day' },
      currency: { type: String, default: 'NGN' },
    },
    depositAmount: { type: Number, default: 0, min: 0 },

    // ==================== LOCATION & DELIVERY ====================
    pickupLocation: {
      address: String,
      city: String,
      area: String,
      coordinates: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
      },
    },
    deliveryAvailable: { type: Boolean, default: false },
    deliveryFee: { type: Number, default: 0, min: 0 },

    // ==================== AVAILABILITY ====================
    // A range is "blocking" while its booking is in any active state (not cancelled).
    bookedRanges: [
      {
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalBooking', required: true },
        from: { type: Date, required: true },
        to: { type: Date, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'paused', 'unavailable', 'maintenance'],
      default: 'active',
      index: true,
    },

    // ==================== ENGAGEMENT ====================
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    // ==================== RATING SUMMARY (denormalized from Review docs) ====================
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

rentalItemSchema.index({ title: 'text', description: 'text' });
rentalItemSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

export default mongoose.model('RentalItem', rentalItemSchema);