import mongoose from 'mongoose';

const productVideoSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Optional link to an actual product listing, if this video showcases one
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },

  // Cloudinary video — the string returned from CloudinaryUpload.jsx
  video: {
    url: { type: String, required: true },      // secure_url from Cloudinary
    publicId: { type: String, required: true }, // public_id, needed for deletion later
    duration: Number,                            // seconds, optional (Cloudinary returns this)
    format: String,                               // e.g. "mp4"
    platform: {
      type: String,
      enum: ['cloudinary', 's3'],
      default: 'cloudinary',
    },
  },

  // Optional thumbnail (Cloudinary can auto-generate one, or upload separately)
  thumbnail: {
    url: String,
    publicId: String,
  },

  description: {
    type: String,
    required: true,
    maxlength: 500,
  },

  tags: [{ type: String }],

  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged'],
    default: 'active',
    index: true,
  },

  // Engagement, mirroring businessProfile pattern
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },

}, { timestamps: true });

productVideoSchema.index({ seller: 1, createdAt: -1 });

export default mongoose.model('ProductVideo', productVideoSchema);