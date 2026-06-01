import mongoose from 'mongoose';

const adSubscriptionSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // What type of ad
  adType: {
    type: String,
    enum: ['flash_sale', 'discount_deals', 'trending_now', 'top_sellers', 'top_products', 'anniversary_deals', 'company_ads'],
    required: true
  },

  // Which products are featured (not required for company_ads)
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // For company ads
  companyAd: {
    title: String,
    description: String,
    imageUrl: String,
    imagePublicId: String,
    ctaText: String,
    ctaLink: String,
  },

  // For product ads - discount/flash sale details
  discountPercentage: { type: Number, min: 0, max: 100 },
  flashSalePrice: { type: Number },
  adBannerImage: { type: String },

  plan: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    required: true
  },

  duration: {
    type: Number, // in days
    required: true
  },

  amount: { type: Number, required: true }, // amount paid in kobo

  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending'
  },

  paymentReference: { type: String, unique: true, sparse: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },

  startDate: { type: Date },
  endDate: { type: Date },

  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },

}, { timestamps: true });

adSubscriptionSchema.index({ seller: 1, status: 1 });
adSubscriptionSchema.index({ adType: 1, status: 1, endDate: 1 });

export default mongoose.model('AdSubscription', adSubscriptionSchema);