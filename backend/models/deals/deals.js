import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const dealSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    price: { type: Number }, // for sell posts
    priceNegotiable: { type: Boolean, default: false },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    }
  }],
    location: { type: String },
    status: {
      type: String,
      enum: ['active', 'finalized', 'closed'],
      default: 'active',
    },

    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Tags for search
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Recompute average rating before save
dealSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = +(sum / this.reviews.length).toFixed(1);
  }

});

export default mongoose.model('Deal', dealSchema);