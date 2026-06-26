import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },

  category: { type: String, required: true },
  subCategory: {type:String, required: true},

  stockQuantity: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  part:{type: Boolean, default: false},
  whatPart:{type: String},
  subCategoryPart:{type: String},

  images: [{
    url: String,
    publicId: String,
    isPrimary: { type: Boolean, default: false }
  }],

  videos: [{        // From S3
    url: String,
    key: String
  }],

  sku: { type: String, unique: true },
  brand: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'out_of_stock'],
    default: 'active'
  },

  tags: [String],
  specifications: Map, // Flexible key-value specs

  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  ratings:{ type: Number, default: 0 },
  sold: { type: Number, default: 0 },

}, { timestamps: true });

productSchema.index({ seller: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' });

// export default mongoose.model('Product', productSchema);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;