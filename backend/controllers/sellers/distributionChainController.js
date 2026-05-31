
import User from '../../models/user.js';
import Product from '../../models/sellers/product.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// ====================== SEARCH DISTRIBUTION CHAIN ======================
export const searchDistributionChain = async (req, res) => {
  try {
    const { query, type, page = 1, limit = 12 } = req.query;
    const cacheKey = `chain_${type}_${query?.trim()}_${page}_${limit}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, fromCache: true });
    }

    if (!query?.trim()) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    let results = {};

    if (type === 'seller') {
      results = await searchBySeller(query.trim(), parseInt(page), parseInt(limit));
    } else if (type === 'product') {
      results = await searchByProduct(query.trim(), parseInt(page), parseInt(limit));
    } else {
      return res.status(400).json({ success: false, message: 'Invalid search type. Use seller or product' });
    }
console.log(results)
    cache.set(cacheKey, results);
    res.status(200).json({ success: true, data: results });

  } catch (error) {
    console.error('Distribution Chain Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== SEARCH BY SELLER ======================
// const searchBySeller = async (searchTerm, page, limit) => {
//   const skip = (page - 1) * limit;

//   // Use .lean() to get plain objects
//   const mainSeller = await User.findOne({
//     $or: [
//       { "businessProfile.businessName": { $regex: searchTerm, $options: 'i' } },
//       { "sellerProfile.shopName": { $regex: searchTerm, $options: 'i' } },
//       { email: { $regex: searchTerm, $options: 'i' } },
//       { username: { $regex: searchTerm, $options: 'i' } }
//     ],
//     isSeller: true
//   }).lean().select(`
//     firstName lastName username email phoneNumber state lga profilePicture referralPoints
//     businessProfile sellerProfile
//   `);

//   if (!mainSeller) {
//     return { mainSeller: null, upstream: [], downstream: [], pagination: { page, limit, total: 0 } };
//   }
//   console.log(mainSeller)

//   const upstream = await User.find({
//     "sellerProfile.sellerChain": {
//       $elemMatch: {
//         $or: [
//           { email: mainSeller.email },
//           { businessName: { $regex: searchTerm, $options: 'i' } }
//         ]
//       }
//     },
//     isSeller: true
//   })
//   .lean()
//   .select('businessProfile.businessName email username profilePicture')
//   .skip(skip)
//   .limit(limit);

//   const downstream = mainSeller.sellerProfile?.sellerChain || [];

//   return {
//     mainSeller,
//     upstream,
//     downstream,
//     pagination: { page, limit, total: upstream.length }
//   };
// };


const searchBySeller = async (searchTerm, page, limit) => {
  const skip = (page - 1) * limit;

  const mainSeller = await User.findOne({
    $or: [
      { "businessProfile.businessName": { $regex: searchTerm, $options: 'i' } },
      { "sellerProfile.shopName": { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { username: { $regex: searchTerm, $options: 'i' } }
    ],
    isSeller: true
  }).lean().select(`
    firstName lastName username email phoneNumber state lga profilePicture referralPoints
    businessProfile sellerProfile
  `);

  if (!mainSeller) {
    return { mainSeller: null, upstream: [], downstream: [], pagination: { page, limit, total: 0 } };
  }

  // Build match conditions only from fields that exist on mainSeller
  const chainMatchConditions = [];

  if (mainSeller.email) {
    chainMatchConditions.push({ "sellerProfile.sellerChain.email": mainSeller.email });
  }
  if (mainSeller.phoneNumber) {
    chainMatchConditions.push({ "sellerProfile.sellerChain.phoneNumber": mainSeller.phoneNumber });
  }
  if (mainSeller.businessProfile?.businessName) {
    chainMatchConditions.push({
      "sellerProfile.sellerChain.businessName": {
        $regex: mainSeller.businessProfile.businessName,
        $options: 'i'
      }
    });
  }

  // If no identifiers found, upstream is empty
  const upstream = chainMatchConditions.length > 0
    ? await User.find({
        $or: chainMatchConditions,
        isSeller: true,
        _id: { $ne: mainSeller._id } // exclude the seller themselves
      })
      .lean()
      .select('businessProfile.businessName email username profilePicture sellerProfile.sellerChain')
      .skip(skip)
      .limit(limit)
    : [];

  const downstream = mainSeller.sellerProfile?.sellerChain || [];

  return {
    mainSeller,
    upstream,
    downstream,
    pagination: { page, limit, total: upstream.length }
  };
};
// ====================== SEARCH BY PRODUCT ======================
const searchByProduct = async (searchTerm, page, limit) => {
  const skip = (page - 1) * limit;

  const products = await Product.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } },
      { subCategory: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ]
  })
  .populate({
    path: 'seller',
    select: 'businessProfile sellerProfile email username phoneNumber state lga profilePicture referralPoints',
    match: { isSeller: true }
  })
  .lean()
  .skip(skip)
  .limit(limit);

  const sellerIds = [...new Set(products.map(p => p.seller?._id).filter(Boolean))];

  const sellers = await User.find({
    _id: { $in: sellerIds },
    isSeller: true
  }).lean().select(`
    businessProfile sellerProfile email username phoneNumber state lga profilePicture referralPoints
  `);

  const enrichedSellers = sellers.map(seller => ({
    ...seller,
    upstreamCount: 0, // You can enhance this later
    downstreamCount: seller.sellerProfile?.sellerChain?.length || 0,
    downstream: seller.sellerProfile?.sellerChain || []
  }));

  return {
    products,
    sellers: enrichedSellers,
    pagination: { page, limit, total: sellers.length }
  };
};