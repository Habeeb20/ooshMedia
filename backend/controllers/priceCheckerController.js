import mongoose from 'mongoose';
import Product from '../models/sellers/product.js';


export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      sellerType,      // manufacturer | wholesaler | retailer | distributor | agent
      state,
      minPrice,
      maxPrice,
      sort,            // 'newest' | 'oldest'
      page = 1,
      limit = 20,
    } = req.query;

    const pipeline = [];

    // ---- Join seller (User) ----
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'seller',
        foreignField: '_id',
        as: 'sellerData',
      },
    });
    pipeline.push({ $unwind: '$sellerData' });

    // ---- Match stage (build dynamically) ----
    const match = { status: 'active' };

    if (category) match.category = category;

    if (minPrice || maxPrice) {
      match.price = {};
      if (minPrice) match.price.$gte = Number(minPrice);
      if (maxPrice) match.price.$lte = Number(maxPrice);
    }

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (state) {
      match['sellerData.state'] = state;
    }

    if (sellerType) {
      match['sellerData.sellerProfile.sellerTypes'] = sellerType;
    }

    pipeline.push({ $match: match });

    // ---- Sort ----
    pipeline.push({
      $sort: { createdAt: sort === 'oldest' ? 1 : -1 },
    });

    // ---- Pagination ----
    const skip = (Number(page) - 1) * Number(limit);
    const facetPipeline = [
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          // ---- full product details ----
          name: 1,
          description: 1,
          price: 1,
          salePrice: 1,
          category: 1,
          subCategory: 1,
          stockQuantity: 1,
          lowStockThreshold: 1,
          part: 1,
          whatPart: 1,
          subCategoryPart: 1,
          images: 1,
          videos: 1,
          sku: 1,
          brand: 1,
          weight: 1,
          dimensions: 1,
          status: 1,
          tags: 1,
          specifications: 1,
          views: 1,
          likes: 1,
          ratings: 1,
          sold: 1,
          createdAt: 1,
          updatedAt: 1,

          // ---- full seller details ----
          seller: {
            _id: '$sellerData._id',
            firstName: '$sellerData.firstName',
            lastName: '$sellerData.lastName',
            username: '$sellerData.username',
            email: '$sellerData.email',
            phoneNumber: '$sellerData.phoneNumber',
            alternateContact: '$sellerData.alternateContact',
            state: '$sellerData.state',
            lga: '$sellerData.lga',
            profilePicture: '$sellerData.profilePicture',
            role: '$sellerData.role',
            isSeller: '$sellerData.isSeller',

            businessProfile: '$sellerData.businessProfile',

            sellerProfile: {
              sellerTypes: '$sellerData.sellerProfile.sellerTypes',
              market: '$sellerData.sellerProfile.market',
              acceptedPaymentMethods: '$sellerData.sellerProfile.acceptedPaymentMethods',
              bankDetails: '$sellerData.sellerProfile.bankDetails',
              productCategories: '$sellerData.sellerProfile.productCategories',
              shopName: '$sellerData.sellerProfile.shopName',
              shopDescription: '$sellerData.sellerProfile.shopDescription',
              verifiedSeller: '$sellerData.sellerProfile.verifiedSeller',
              // full distribution / seller chain
              sellerChain: '$sellerData.sellerProfile.sellerChain',
            },
          },
        },
      },
    ];

    pipeline.push({
      $facet: {
        data: facetPipeline,
        totalCount: [{ $count: 'count' }],
      },
    });

    const result = await Product.aggregate(pipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalResults: total,
      totalPages: Math.ceil(total / Number(limit)),
      products: data,
    });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
};

// Single product with full seller + seller chain
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate({
        path: 'seller',
        select: '-password', // never expose password
      })
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: err.message });
  }
};

// Helper endpoint: list of distinct categories & states for filter dropdowns
export const getFilterOptions = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const states = await mongoose.model('User').distinct('state', { isSeller: true });

    res.status(200).json({
      success: true,
      categories: categories.filter(Boolean),
      states: states.filter(Boolean),
      sellerTypes: ['manufacturer', 'wholesaler', 'retailer', 'distributor', 'agent'],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch filter options' });
  }
};