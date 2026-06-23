
import Product from '../../models/sellers/product.js';
import mongoose from 'mongoose';
import User from '../../models/user.js';

// Create Product
export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const product = await Product.create({
      ...req.body,
      seller: sellerId,
      sku: req.body.sku || `PROD-${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Seller Products
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { seller: sellerId };
    if (status) query.status = status;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: Number(page)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: sellerId },
      req.body,
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const product = await Product.findOneAndDelete({ _id: id, seller: sellerId });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, action } = req.body; // action: 'add' or 'subtract'

    const product = await Product.findOne({ _id: id, seller: req.user._id });

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (action === 'add') {
      product.stockQuantity += Number(quantity);
    } else if (action === 'subtract') {
      product.stockQuantity = Math.max(0, product.stockQuantity - Number(quantity));
    }

    if (product.stockQuantity <= product.lowStockThreshold) {
      product.status = 'low_stock';
    } else if (product.stockQuantity === 0) {
      product.status = 'out_of_stock';
    } else {
      product.status = 'active';
    }

    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      stockQuantity: product.stockQuantity,
      status: product.status
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getProductStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get all products for this seller
    const products = await Product.find({ seller: sellerId });

    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    
    const lowStock = products.filter(p => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0).length;
    const outOfStock = products.filter(p => p.stockQuantity === 0).length;
    const activeProducts = products.filter(p => p.status === 'active').length;

    // Monthly sales simulation (you can replace with real order data later)
    const monthlySales = [
      { name: 'Jan', sales: 4200000 },
      { name: 'Feb', sales: 3800000 },
      { name: 'Mar', sales: 5100000 },
      { name: 'Apr', sales: 4600000 },
      { name: 'May', sales: 5900000 },
    ];

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalStockValue,
        lowStock,
        outOfStock,
        activeProducts,
        monthlySales
      }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics"
    });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: "seller",
        select: `
          firstName
          lastName
          username
          email
          phoneNumber
          alternateContact
          state
          lga
          profilePicture
          role
          isSeller
          sellerProfile
          businessProfile
          createdAt
        `,
      });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getAllPartProducts = async (req, res) => {
  try {
    const products = await Product.find({ part: true })
      .populate({
        path: "seller",
        select: `
          firstName
          lastName
          username
          email
          phoneNumber
          alternateContact
          state
          lga
          profilePicture
          role
          isSeller
          sellerProfile
          businessProfile
          createdAt
        `,
      });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};



// Like a Product
export const likeProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product liked",
      likes: product.likes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// View a Product (Increment Views)
export const viewProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // You can also track who viewed it if needed (optional)
    res.json({
      success: true,
      views: product.views
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Optional: Record Rating for Product
export const rateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating } = req.body; // 1-5

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating" });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { ratings: rating } }, // You might want average logic later
      { new: true }
    );

    res.json({
      success: true,
      message: "Rating recorded",
      totalRatings: product.ratings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};











export const getProductsByCategory = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      page = 1,
      limit = 20,
      sort = 'newest',
      minPrice,
      maxPrice,
      status = 'active',
    } = req.query;

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'category is required as a query parameter',
      });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build the filter
    const filter = {
      category: { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' },
    };

    if (subCategory && subCategory.trim()) {
      filter.subCategory = { $regex: `^${escapeRegex(subCategory.trim())}$`, $options: 'i' };
    }

    if (status !== 'all') {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Build the sort
    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popular: { sold: -1, likes: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'seller',
          select:
            'firstName lastName username profilePicture state lga role ' +
            'businessProfile.businessName businessProfile.verified businessProfile.gallery ' +
            'sellerProfile.shopName sellerProfile.shopDescription sellerProfile.verifiedSeller ' +
            'sellerProfile.market sellerProfile.acceptedPaymentMethods',
        })
        .lean(),
      Product.countDocuments(filter),
    ]);

    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: `No products found in category "${category}"`,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Shape the response: flatten the seller's "public storefront" identity
    // so the frontend doesn't have to know about businessProfile/sellerProfile nesting.
    const data = products.map((product) => ({
      ...product,
      seller: shapeSeller(product.seller),
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Picks a display name + storefront-relevant fields from a populated seller,
 * regardless of whether they're an individual ('user') or a business ('entity').
 */
function shapeSeller(seller) {
  if (!seller) return null;

  const isBusiness = seller.role === 'entity';
  const businessName = seller.businessProfile?.businessName;
  const shopName = seller.sellerProfile?.shopName;

  return {
    _id: seller._id,
    displayName: shopName || businessName || `${seller.firstName} ${seller.lastName}`.trim(),
    username: seller.username,
    avatar: seller.profilePicture || seller.businessProfile?.gallery?.[0]?.url || null,
    location: [seller.lga, seller.state].filter(Boolean).join(', '),
    isBusiness,
    verified: Boolean(seller.businessProfile?.verified || seller.sellerProfile?.verifiedSeller),
    shopDescription: seller.sellerProfile?.shopDescription || null,
    market: seller.sellerProfile?.market || null,
    acceptedPaymentMethods: seller.sellerProfile?.acceptedPaymentMethods || 'both',
  };
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}