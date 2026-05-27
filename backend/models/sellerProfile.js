import mongoose from 'mongoose';

const buyerDetailSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email:        { type: String },
  phoneNumber:  { type: String },
  address:      { type: String, required: true },
  buyerType: {
    type: String,
    enum: ['wholesaler', 'retailer'],
    required: true,
  },
}, { _id: true, timestamps: true });

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Which roles in the supply chain this seller occupies (can be multiple)
  chainRoles: [{
    type: String,
    enum: ['manufacturer', 'wholesaler', 'retailer'],
  }],

  // Product categories this seller deals in (refs your existing Category model)
  productCategories: [{
      type: String,
    
  }],

  // Required when chainRoles includes 'manufacturer' — at least one buyer must be registered
  registeredBuyers: [buyerDetailSchema],

  // General seller info
  storeName:        { type: String },
  storeDescription: { type: String },
  storeSlug:        { type: String, unique: true, sparse: true },
  storeLogo:        { type: String },   // Cloudinary URL
  storeBanner:      { type: String },   // Cloudinary URL

  location: {
    state: { type: String },
    lga:   { type: String },
    address: { type: String },
  },

  // Delivery & fulfilment
  shipsNationwide:   { type: Boolean, default: false },
  deliveryLocations: [{ type: String }],   // states/LGAs they ship to
  averageDeliveryDays: { type: Number, min: 0 },

  // Stats
  totalSales:    { type: Number, default: 0 },
  totalRevenue:  { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:   { type: Number, default: 0 },

  isActive:  { type: Boolean, default: true },
  isBanned:  { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },

  // Completion tracking (mirrors businessProfile pattern)
  sellerProfileCompleted:            { type: Boolean, default: false },
  sellerProfileCompletionPercentage: { type: Number, default: 0 },
  sellerProfileUpdatedAt:            { type: Date },

}, { timestamps: true });

// Enforce: manufacturers must register at least one buyer before going active
sellerProfileSchema.pre('save', function (next) {
  const isManufacturer = this.chainRoles.includes('manufacturer');
  if (isManufacturer && this.registeredBuyers.length === 0) {
    return next(new Error('Manufacturers must register at least one wholesaler or retailer buyer.'));
  }
  next();
});

sellerProfileSchema.index({ user: 1 });
sellerProfileSchema.index({ storeSlug: 1 });
sellerProfileSchema.index({ productCategories: 1 });
sellerProfileSchema.index({ 'location.state': 1, 'location.lga': 1 });

export default mongoose.model('SellerProfile', sellerProfileSchema);