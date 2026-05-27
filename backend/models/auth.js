import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
  phoneNumber: { type: String, sparse: true },
  alternateContact: String,
  state: String,
  lga: String,
  dateOfBirth: Date,
  role: { type: String, enum: ['user', 'entity'], default: 'user' },
  profilePicture: String,
  password: { type: String, required: true },

    uniqueNumber: { type: String, unique: true, sparse: true },
    referralCode: { type: String, unique: true, sparse: true },
    referralPoints: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },


    // ==================== BUSINESS PROFILE (For Entities) ====================
  businessProfile: {
    businessName: { type: String },
    businessAddress: { type: String },
    
    // Can accept single or multiple categories
    entityCategory: [{
      type: String,
   
    }],

    yearsInBusiness: { type: Number, min: 0 },
    staffCount: { type: Number, min: 0 },
    registeredBusiness: { type: Boolean, default: false },

    // Opening Hours (e.g. ["Mon-Fri: 8am-6pm", "Saturday: 9am-4pm"])
    openingHours: [{ type: String }],

    // Social & Engagement
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    reviews: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }],

    // Gallery - Images from Cloudinary + Videos from S3
    gallery: [{
      url: String,
      publicId: String,        // Cloudinary public_id for images
      type: { 
        type: String, 
        enum: ['image', 'video'], 
        default: 'image' 
      },
      platform: {              // To know where it's stored
        type: String, 
        enum: ['cloudinary', 's3'], 
        default: 'cloudinary' 
      }
    }],

    verified: { type: Boolean, default: false },
    businessDocuments: [String], // For CAC, Tax ID, etc.

    // ==================== TRACKING FIELDS ====================
  businessProfileCompleted: { 
    type: Boolean, 
    default: false 
  },
  businessProfileUpdatedAt: { 
    type: Date 
  },
  businessProfileCompletionPercentage: { 
    type: Number, 
    default: 0 
  },
  },

}, { timestamps: true });

// Index for better performance
userSchema.index({ "businessProfile.businessName": "text" });

export default mongoose.model('User', userSchema);












