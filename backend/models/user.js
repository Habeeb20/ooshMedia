
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
    isRider: { type: Boolean, default: false },
  phoneNumber: { type: String, sparse: true },
  alternateContact: String,
  state: String,
  lga: String,
  dateOfBirth: Date,
  role: { type: String, enum: ['user', 'entity', 'admin'], default: 'user' },
  profilePicture: String,
  password: { type: String, required: true },

    uniqueNumber: { type: String, unique: true, sparse: true },
    referralCode: { type: String, unique: true, sparse: true },
    referralPoints: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   // ==================== wallet profile ====================
    // Inside userSchema
isWallet: { type: Boolean, default: false },
walletAccount: {
  accountNumber: String,
  bankName: String,
  providerSlug: String,
  externalId: String,        // ID from external wallet API
  createdAt: Date,
},

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
    likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

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
      platform: {              // To know where it's storedc
        type: String, 
        enum: ['cloudinary', 's3'], 
        default: 'cloudinary' 
      }
    }],

    verified: { type: Boolean, default: false },
    businessDocuments: [String], // For CAC, Tax ID, etc.
    isSeller:   { type: Boolean, default: false },
isEmployer: { type: Boolean, default: false },

// Refs to the separate profile documents
sellerProfile:   { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile' },
employerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerProfile' },

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


    // ==================== RIDER PROFILE ====================

  riderProfile: {
    vehicleType: {
      type: String,
      enum: ['bike', 'car', 'van', 'truck', 'bicycle'],
      // required: function() { return this.isRider; }
    },
    vehicleBrand: String,
    vehicleModel: String,
    vehicleYear: Number,
    vehicleColor: String,
    licensePlate: { type: String, unique: true, sparse: true },

    // Documents
    ridersLicense: {
      url: String,
      publicId: String
    },
    vehicleImage: {
      url: String,
      publicId: String
    },
    insuranceDocument: {
      url: String,
      publicId: String
    },

    // Availability & Stats
    isAvailable: { type: Boolean, default: true },
  
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    completedDeliveries: { type: Number, default: 0 },

    // Bank Details for Payouts
 
      bankName: String,
      accountNumber: String,
      accountName: String,
      bankCode: String,
      recipientCode: String,
    


    verified: { type: Boolean, default: false },
    verificationRequestedAt: Date,
    verifiedAt: Date
  },


    // ==================== SELLER PROFILE ====================
  isSeller: { type: Boolean, default: false },
  sellerProfile: {
    sellerTypes: [{
      type: String,
      enum: ['manufacturer', 'wholesaler', 'retailer', 'distributor', "agent"]
    }],
  market: { type: String },
  // Add inside sellerProfile: { ... } in models/User.js
inventoryAccess: {
  paid: { type: Boolean, default: false },
  amount: Number,
  reference: String,
  paidAt: Date,
},

controlRoom: {
  codeHash: String,      // bcrypt hash of the creator's 4-digit access code
  activatedAt: Date,
  codeIssuedAt: Date,
},
    // Seller Chain (especially for Manufacturers)
    sellerChain: [{
      businessName: String,
      email: String,
      phoneNumber: String,
      address: String,
      relationship: { 
        type: String, 
        enum: ['wholesaler', 'retailer', 'distributor',  "agent"] 
      },

        // Purchase history from this supplier/distributor
  purchaseHistory: [{
    productName: {
      type: String,
      required: true
    },

    category: String,

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    unit: {
      type: String, // pcs, cartons, bags, kg, litres, etc.
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: 'NGN'
    },

    purchaseDate: {
      type: Date,
      required: true
    },

    invoiceNumber: String,

    paymentMethod: {
      type: String,
      enum: [
        'cash',
        'bank_transfer',
        'card',
        'pos',
        'mobile_money',
        'credit'
      ]
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'paid'
    },

    deliveryDate: Date,

    deliveryStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ],
      default: 'delivered'
    },

    notes: String,

    receiptUrl: String, // Cloudinary/S3 receipt upload

    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
    }],

     acceptedPaymentMethods: {
    type: String,
    enum: ['online_only', 'on_delivery_only', 'both'],
    default: 'both',
  },

bankDetails: {
      bankName: { 
        type: String, 
        required: false 
      },
      accountNumber: { 
        type: String, 
        required: false,
    
      },
      accountName: { 
        type: String, 
        required: false 
      },

        bankCode: String,  
           recipientCode: String, 
      // Optional: For future verification
      isVerified: { 
        type: Boolean, 
        default: false 
      },
      verifiedAt: { 
        type: Date 
      }
    },
  
    // Product Categories (Multiple selection)
    productCategories: [{ type: String }],   // Will match your product categories JSON

    // Additional seller info
    shopName: String,
    shopDescription: String,
    verifiedSeller: { type: Boolean, default: false },
  },

  // ==================== EMPLOYER PROFILE ====================
  isEmployer: { type: Boolean, default: false },
  employerProfile: {
    companyName: String,
    hiringFor: [{ type: String }],           // Job categories
    totalEmployees: Number,
    aboutCompany: String,
  },

  // Tracking fields
  businessProfileCompleted: { type: Boolean, default: false },
  businessProfileUpdatedAt: Date,
  businessProfileCompletionPercentage: { type: Number, default: 0 },


  ///////////--------Verify---------////////////

identityVerification: {
  nin: {
    number: { type: String, select: false },
    last4: String,
    verified: { type: Boolean, default: false },
    matchedName: String,
    verifiedAt: Date,
    sessionId: String,
    status:    String,       
    source:     String,   
    provider:     String,
    matched_name:   String,
    first_name:    String,
    last_name:    String,
    middle_name:   String,
    date_of_birth:  String,
    gender:         String,
    phone_number:   String,
    state_of_origin:String,
    photo:          String,
    confidence:     String,
    cost:           String,
  },
  bvn: {
    number: { type: String, select: false },
    last4: String,
    verified: { type: Boolean, default: false },
    matchedName: String,
    verifiedAt: Date,
    sessionId: String,
       status:    String,       
    source:     String,   
    provider:     String,
    matched_name:   String,
    first_name:    String,
    last_name:    String,
    middle_name:   String,
    date_of_birth:  String,
    gender:         String,
    phone_number:   String,
    state_of_origin:String,
    photo:          String,
    confidence:     String,
    cost:           String,
  },
  votersCard: {
    vin: { type: String, select: false },
    last4: String,
    imageUrl: String,
    verified: { type: Boolean, default: false },
    matchedName: String,
    verifiedAt: Date,
    sessionId: String,
       status:    String,       
    source:     String,   
    provider:     String,
    matched_name:   String,
    first_name:    String,
    last_name:    String,
    middle_name:   String,
    date_of_birth:  String,
    gender:         String,
    phone_number:   String,
    state_of_origin:String,
    photo:          String,
    confidence:     String,
    cost:           String,
  },
  driverLicense: {
    number: { type: String, select: false },
    last4: String,
    verified: { type: Boolean, default: false },
    matchedName: String,
    expiryDate: Date,
    verifiedAt: Date,
    sessionId: String,
       status:    String,       
    source:     String,   
    provider:     String,
    matched_name:   String,
    first_name:    String,
    last_name:    String,
    middle_name:   String,
    date_of_birth:  String,
    gender:         String,
    phone_number:   String,
    state_of_origin:String,
    photo:          String,
    confidence:     String,
    cost:           String,
  },
  passport: {
    number: { type: String, select: false },
    last4: String,
    verified: { type: Boolean, default: false },
    matchedName: String,
    expiryDate: Date,
    verifiedAt: Date,
    sessionId: String,
  },
  cac: {
    rcNumber: { type: String, select: false },
    last4: String,
    verified: { type: Boolean, default: false },
    matchedBusinessName: String,
    registrationDate: Date,
    verifiedAt: Date,
    sessionId: String,
       status:    String,       
    source:     String,   
    provider:     String,
    matched_name:   String,
    first_name:    String,
    last_name:    String,
    middle_name:   String,
    date_of_birth:  String,
    gender:         String,
    phone_number:   String,
    state_of_origin:String,
    photo:          String,
    confidence:     String,
    cost:           String,
  },
  approved: { type: Boolean, default: false, index: true },
  lastAttemptAt: Date,
},

}, { timestamps: true });

// Index for better performance
userSchema.index({ "businessProfile.businessName": "text" });
userSchema.index({ "riderProfile.currentLocation": "2dsphere" });
// userSchema.index({ "riderProfile.licensePlate": 1 });
export default mongoose.model('User', userSchema);
















































































