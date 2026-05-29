
import Product from '../../models/sellers/product.js';

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