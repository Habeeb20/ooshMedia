import mongoose from 'mongoose';

const employerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  companyName:        { type: String },
  companyDescription: { type: String },
  companyLogo:        { type: String },   // Cloudinary URL
  companyWebsite:     { type: String },
  industry:           { type: String },
  companySize:        {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
  },

  location: {
    state:   { type: String },
    lga:     { type: String },
    address: { type: String },
  },

  // Stats
  totalJobsPosted: { type: Number, default: 0 },
  totalHires:      { type: Number, default: 0 },
  openRolesCount:  { type: Number, default: 0 },
  averageRating:   { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:     { type: Number, default: 0 },

  isActive:   { type: Boolean, default: true },
  isBanned:   { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },

  // Completion tracking
  employerProfileCompleted:            { type: Boolean, default: false },
  employerProfileCompletionPercentage: { type: Number, default: 0 },
  employerProfileUpdatedAt:            { type: Date },

}, { timestamps: true });

employerProfileSchema.index({ user: 1 });
employerProfileSchema.index({ industry: 1 });
employerProfileSchema.index({ 'location.state': 1 });

export default mongoose.model('EmployerProfile', employerProfileSchema);