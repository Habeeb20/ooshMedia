import User from '../models/user.js';
import axios from 'axios';
import Product from '../models/sellers/product.js';
// ====================== CREATE / UPDATE SELLER PROFILE ======================
export const updateSellerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'entity') {
      return res.status(403).json({ success: false, message: "Only entities can become sellers" });
    }

    const { sellerTypes, productCategories, shopName, shopDescription, market,    bankDetails  } = req.body;

    user.isSeller = true;
    user.sellerProfile.shopName = user.bussinessProfile?.businessName || shopName;
    user.sellerProfile = {
      ...user.sellerProfile,
      sellerTypes: sellerTypes || user.sellerProfile?.sellerTypes || [],
      market: market || user.sellerProfile?.market || [],
      productCategories: productCategories || user.sellerProfile?.productCategories || [],
    //   shopName: shopName || user.sellerProfile?.shopName,
      shopDescription: shopDescription || user.sellerProfile?.shopDescription,

       bankDetails: {
        bankName: bankDetails?.bankName || user.sellerProfile.bankDetails?.bankName || "",
        accountNumber: bankDetails?.accountNumber || user.sellerProfile.bankDetails?.accountNumber || "",
        accountName: bankDetails?.accountName || user.sellerProfile.bankDetails?.accountName || "",
        isVerified: user.sellerProfile.bankDetails?.isVerified || false,
        verifiedAt: user.sellerProfile.bankDetails?.verifiedAt
      }
    };

    await user.save();

    res.json({
      success: true,
      message: "Seller profile updated successfully",
      sellerProfile: user.sellerProfile
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update seller profile" });
  }
};




// ====================== ADD TO SELLER CHAIN ======================
export const addSellerChain = async (req, res) => {
  try {
    const userId = req.user._id;
    const { businessName, email, phoneNumber, address, relationship } = req.body;

    const user = await User.findById(userId);
    if (!user?.isSeller) {
      return res.status(400).json({ success: false, message: "User must be a seller first" });
    }

    if (!user.sellerProfile) user.sellerProfile = {};
    if (!user.sellerProfile.sellerChain) user.sellerProfile.sellerChain = [];

    user.sellerProfile.sellerChain.push({
      businessName,
      email,
      phoneNumber,
      address,
      relationship
    });

    await user.save();

    res.json({
      success: true,
      message: "Seller added to chain successfully",
      sellerChain: user.sellerProfile.sellerChain
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Failed to add seller chain" });
  }
};

// ====================== EDIT SELLER CHAIN ======================
export const editSellerChain = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chainId } = req.params;
    const { businessName, email, phoneNumber, address, relationship } = req.body;

    const user = await User.findById(userId);
    if (!user?.sellerProfile?.sellerChain) {
      return res.status(404).json({ success: false, message: "Seller chain not found" });
    }

    const chainIndex = user.sellerProfile.sellerChain.findIndex(
      chain => chain._id.toString() === chainId
    );

    if (chainIndex === -1) {
      return res.status(404).json({ success: false, message: "Chain entry not found" });
    }

    // Update the specific chain entry
    user.sellerProfile.sellerChain[chainIndex] = {
      ...user.sellerProfile.sellerChain[chainIndex],
      businessName,
      email,
      phoneNumber,
      address,
      relationship
    };

    await user.save();

    res.json({
      success: true,
      message: "Seller chain updated successfully",
      sellerChain: user.sellerProfile.sellerChain
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update seller chain" });
  }
};

// ====================== DELETE SELLER CHAIN ======================
export const deleteSellerChain = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chainId } = req.params;

    const user = await User.findById(userId);
    if (!user?.sellerProfile?.sellerChain) {
      return res.status(404).json({ success: false, message: "Seller chain not found" });
    }

    user.sellerProfile.sellerChain = user.sellerProfile.sellerChain.filter(
      chain => chain._id.toString() !== chainId
    );

    await user.save();

    res.json({
      success: true,
      message: "Seller removed from chain successfully",
      sellerChain: user.sellerProfile.sellerChain
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete seller chain" });
  }
};

// ====================== GET SELLER PROFILE ======================
export const getSellerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('isSeller sellerProfile');

    res.json({
      success: true,
      isSeller: user.isSeller,
      sellerProfile: user.sellerProfile || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch seller profile" });
  }
};


// controllers/sellerController.js
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ isSeller: true })
      .select(
        'username firstName lastName profilePicture state lga ' +
        'businessProfile.businessName businessProfile.entityCategory ' +
        'businessProfile.yearsInBusiness businessProfile.verified ' +
        'businessProfile.likes businessProfile.views businessProfile.shares ' +
        'businessProfile.reviews businessProfile.shopDescription ' +
        'sellerProfile.shopName sellerProfile.sellerTypes sellerProfile.productCategories'
      )
      .populate('businessProfile.reviews.user', 'firstName lastName profilePicture'); // Optional: populate reviewer info

    res.json({
      success: true,
      count: sellers.length,
      sellers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch sellers" });
  }
};



// ====================== SELLER STATS CONTROLLERS ======================
export const likeSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const userId = req.user._id;

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    // Ensure businessProfile exists
    if (!seller.businessProfile) {
      seller.businessProfile = {};
    }
    if (!seller.businessProfile.likedBy) {
      seller.businessProfile.likedBy = [];
    }

    // Check if user already liked
    const alreadyLiked = seller.businessProfile.likedBy.some(
      likedUserId => likedUserId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this seller"
      });
    }

    // Add like
    seller.businessProfile.likedBy.push(userId);
    seller.businessProfile.likes = (seller.businessProfile.likes || 0) + 1;

    await seller.save();

    res.json({
      success: true,
      message: "Seller liked successfully",
      likes: seller.businessProfile.likes
    });

  } catch (error) {
    console.error("Like Seller Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
// Increment Seller Views
export const viewSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findByIdAndUpdate(
      sellerId,
      { $inc: { 'businessProfile.views': 1 } },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      views: seller.businessProfile.views
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Increment Seller Shares
export const shareSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findByIdAndUpdate(
      sellerId,
      { $inc: { 'businessProfile.shares': 1 } },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: "Share recorded",
      shares: seller.businessProfile.shares
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add Review & Rating to Seller
export const reviewSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const seller = await User.findByIdAndUpdate(
      sellerId,
      {
        $push: {
          'businessProfile.reviews': {
            user: userId,
            rating,
            comment,
            createdAt: new Date()
          }
        },
        $inc: { 'businessProfile.comments': 1 } // Optional: increment comment count
      },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    res.json({
      success: true,
      message: "Review added successfully",
      reviewCount: seller.businessProfile.reviews.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const getSellerById = async (req, res) => {
 
  try {
    const seller = await User.findById(req.params.id)
      .select(
        'username firstName lastName email phoneNumber state lga profilePicture role ' +
        'businessProfile sellerProfile'
      )
      .populate('businessProfile.reviews.user', 'firstName lastName profilePicture');
    

    // if (!seller || !seller.isSeller) {
    //   return res.status(404).json({ success: false, message: "Seller not found" });
    // }

    res.json({
      success: true,
      seller
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};







export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.id })
      .select('name price images salePrice status stockQuantity')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


























// ====================== GET SELLER REVIEWS ======================
export const getSellerReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('businessProfile sellerProfile firstName lastName username');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    // Get reviews from businessProfile
    const reviews = user.businessProfile?.reviews || [];

    // Populate reviewer info if needed
    const populatedReviews = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await User.findById(review.user).select('firstName lastName username profilePicture');
        return {
          ...review.toObject(),
          user: reviewer ? {
            firstName: reviewer.firstName,
            lastName: reviewer.lastName,
            username: reviewer.username,
            profilePicture: reviewer.profilePicture
          } : null
        };
      })
    );

    res.json({
      success: true,
      reviews: populatedReviews,
      totalReviews: populatedReviews.length
    });

  } catch (error) {
    console.error("Get Seller Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};



export const getSellerDistributors = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId).select('sellerProfile.sellerChain');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    const sellerChain = seller.sellerProfile?.sellerChain || [];

    // Extract only distributor names (businessName)
    const distributors = sellerChain.map(chain => ({
      id: chain._id,
      businessName: chain.businessName,
      relationship: chain.relationship,
      email: chain.email,
      phoneNumber: chain.phoneNumber
    }));

    res.json({
      success: true,
      count: distributors.length,
      distributors
    });

  } catch (error) {
    console.error("Get Distributors Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch distributors"
    });
  }
};






























// Add these fields to your existing userSchema in User.js:

/*
  // Seller-specific fields (add to your existing schema)
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  shopName: String,
  
  // Payment preferences
  acceptedPaymentMethods: {
    type: String,
    enum: ['online_only', 'on_delivery_only', 'both'],
    default: 'both',
  },
  
  // Bank details for Paystack transfers
  bankDetails: {
    bankName: String,
    bankCode: String,          // Paystack bank code
    accountNumber: String,
    accountName: String,
    recipientCode: String,     // Paystack transfer recipient code
  },
*/

// Controller to save bank details and create Paystack transfer recipient:


export const updateBankDetails = async (req, res) => {
  try {
    const { bankName, bankCode, accountNumber, accountName } = req.body;

    // Create Paystack transfer recipient
    const paystackRes = await axios.post(
      'https://api.paystack.co/transferrecipient',
      {
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const recipientCode = paystackRes.data.data.recipient_code;

    await User.findByIdAndUpdate(req.user._id, {
      'sellerProfile.bankDetails': { bankName, bankCode, accountNumber, accountName, recipientCode },
    });

    res.json({ message: 'Bank details saved', recipientCode });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
};

export const getBanks = async (req, res) => {
  try {
    const { data } = await axios.get('https://api.paystack.co/bank', {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    res.json(data.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePaymentPreferences = async (req, res) => {
  try {
    const { acceptedPaymentMethods } = req.body;
    await User.findByIdAndUpdate(req.user._id, { acceptedPaymentMethods });
    res.json({ message: 'Preferences updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
