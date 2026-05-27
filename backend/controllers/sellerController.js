import User from '../models/user.js';

// ====================== CREATE / UPDATE SELLER PROFILE ======================
export const updateSellerProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'entity') {
      return res.status(403).json({ success: false, message: "Only entities can become sellers" });
    }

    const { sellerTypes, productCategories, shopName, shopDescription } = req.body;

    user.isSeller = true;
    user.sellerProfile.shopName = user.bussinessProfile?.businessName || shopName;
    user.sellerProfile = {
      ...user.sellerProfile,
      sellerTypes: sellerTypes || user.sellerProfile?.sellerTypes || [],
      productCategories: productCategories || user.sellerProfile?.productCategories || [],
    //   shopName: shopName || user.sellerProfile?.shopName,
      shopDescription: shopDescription || user.sellerProfile?.shopDescription,
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