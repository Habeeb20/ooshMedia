import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  proposedPrice: { type: Number },
  attachments: [String],
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'shortlisted'], 
    default: 'pending' 
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  postType: { 
    type: String, 
    enum: ['post', 'contract', 'supply'], 
    required: true,
    default: 'post'
  },

  title: { type: String },
  content: { type: String, required: true },
  
  category: { type: String },
  subCategory: { type: String },
  tags: [{ type: String }],

  images: [{ 
    url: String, 
    publicId: String 
  }],

  // Contract / Supply fields
  budget: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'NGN' }
  },
  deadline: { type: Date },
  location: { type: String },
  requirements: [{ type: String }],
  deliverables: [{ type: String }],

  // Engagement
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },

  // Repost reference
  isRepost: { type: Boolean, default: false },
  originalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  repostComment: { type: String },

  reviews: [reviewSchema],
  applications: [applicationSchema],

  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },

  applicationCount: { type: Number, default: 0 },

}, { timestamps: true });

postSchema.index({ content: 'text', title: 'text', tags: 'text' });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ postType: 1, createdAt: -1 });
postSchema.index({ category: 1 });

export default mongoose.model('Post', postSchema);