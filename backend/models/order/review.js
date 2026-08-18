import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true // ties review to a specific completed purchase
  },
  userName: {
    type: String,
    required: false 
  },
  image:{

    type:String,

  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
}, { timestamps: true });

// Prevents a user from reviewing the same product twice for the same order
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1 });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;