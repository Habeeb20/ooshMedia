
// import User from '../../models/user.js';
// import Product from '../../models/sellers/product.js';
// import NodeCache from 'node-cache';

// const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// // ====================== SEARCH DISTRIBUTION CHAIN ======================
// export const searchDistributionChain = async (req, res) => {
//   try {
//     const { query, type, page = 1, limit = 12 } = req.query;
//     const cacheKey = `chain_${type}_${query?.trim()}_${page}_${limit}`;

//     const cached = cache.get(cacheKey);
//     if (cached) {
//       return res.status(200).json({ success: true, data: cached, fromCache: true });
//     }

//     if (!query?.trim()) {
//       return res.status(400).json({ success: false, message: 'Search query is required' });
//     }

//     let results = {};

//     if (type === 'seller') {
//       results = await searchBySeller(query.trim(), parseInt(page), parseInt(limit));
//     } else if (type === 'product') {
//       results = await searchByProduct(query.trim(), parseInt(page), parseInt(limit));
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid search type. Use seller or product' });
//     }
// console.log(results)
//     cache.set(cacheKey, results);
//     res.status(200).json({ success: true, data: results });

//   } catch (error) {
//     console.error('Distribution Chain Error:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // ====================== SEARCH BY SELLER ======================
// // const searchBySeller = async (searchTerm, page, limit) => {
// //   const skip = (page - 1) * limit;

// //   // Use .lean() to get plain objects
// //   const mainSeller = await User.findOne({
// //     $or: [
// //       { "businessProfile.businessName": { $regex: searchTerm, $options: 'i' } },
// //       { "sellerProfile.shopName": { $regex: searchTerm, $options: 'i' } },
// //       { email: { $regex: searchTerm, $options: 'i' } },
// //       { username: { $regex: searchTerm, $options: 'i' } }
// //     ],
// //     isSeller: true
// //   }).lean().select(`
// //     firstName lastName username email phoneNumber state lga profilePicture referralPoints
// //     businessProfile sellerProfile
// //   `);

// //   if (!mainSeller) {
// //     return { mainSeller: null, upstream: [], downstream: [], pagination: { page, limit, total: 0 } };
// //   }
// //   console.log(mainSeller)

// //   const upstream = await User.find({
// //     "sellerProfile.sellerChain": {
// //       $elemMatch: {
// //         $or: [
// //           { email: mainSeller.email },
// //           { businessName: { $regex: searchTerm, $options: 'i' } }
// //         ]
// //       }
// //     },
// //     isSeller: true
// //   })
// //   .lean()
// //   .select('businessProfile.businessName email username profilePicture')
// //   .skip(skip)
// //   .limit(limit);

// //   const downstream = mainSeller.sellerProfile?.sellerChain || [];

// //   return {
// //     mainSeller,
// //     upstream,
// //     downstream,
// //     pagination: { page, limit, total: upstream.length }
// //   };
// // };


// const searchBySeller = async (searchTerm, page, limit) => {
//   const skip = (page - 1) * limit;

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

//   // Build match conditions only from fields that exist on mainSeller
//   const chainMatchConditions = [];

//   if (mainSeller.email) {
//     chainMatchConditions.push({ "sellerProfile.sellerChain.email": mainSeller.email });
//   }
//   if (mainSeller.phoneNumber) {
//     chainMatchConditions.push({ "sellerProfile.sellerChain.phoneNumber": mainSeller.phoneNumber });
//   }
//   if (mainSeller.businessProfile?.businessName) {
//     chainMatchConditions.push({
//       "sellerProfile.sellerChain.businessName": {
//         $regex: mainSeller.businessProfile.businessName,
//         $options: 'i'
//       }
//     });
//   }

//   // If no identifiers found, upstream is empty
//   const upstream = chainMatchConditions.length > 0
//     ? await User.find({
//         $or: chainMatchConditions,
//         isSeller: true,
//         _id: { $ne: mainSeller._id } // exclude the seller themselves
//       })
//       .lean()
//       .select('businessProfile.businessName email username profilePicture sellerProfile.sellerChain')
//       .skip(skip)
//       .limit(limit)
//     : [];

//   const downstream = mainSeller.sellerProfile?.sellerChain || [];

//   return {
//     mainSeller,
//     upstream,
//     downstream,
//     pagination: { page, limit, total: upstream.length }
//   };
// };
// // ====================== SEARCH BY PRODUCT ======================
// const searchByProduct = async (searchTerm, page, limit) => {
//   const skip = (page - 1) * limit;

//   const products = await Product.find({
//     $or: [
//       { name: { $regex: searchTerm, $options: 'i' } },
//       { category: { $regex: searchTerm, $options: 'i' } },
//       { subCategory: { $regex: searchTerm, $options: 'i' } },
//       { tags: { $regex: searchTerm, $options: 'i' } }
//     ]
//   })
//   .populate({
//     path: 'seller',
//     select: 'businessProfile sellerProfile email username phoneNumber state lga profilePicture referralPoints',
//     match: { isSeller: true }
//   })
//   .lean()
//   .skip(skip)
//   .limit(limit);

//   const sellerIds = [...new Set(products.map(p => p.seller?._id).filter(Boolean))];

//   const sellers = await User.find({
//     _id: { $in: sellerIds },
//     isSeller: true
//   }).lean().select(`
//     businessProfile sellerProfile email username phoneNumber state lga profilePicture referralPoints
//   `);

//   const enrichedSellers = sellers.map(seller => ({
//     ...seller,
//     upstreamCount: 0, // You can enhance this later
//     downstreamCount: seller.sellerProfile?.sellerChain?.length || 0,
//     downstream: seller.sellerProfile?.sellerChain || []
//   }));

//   return {
//     products,
//     sellers: enrichedSellers,
//     pagination: { page, limit, total: sellers.length }
//   };
// };














































import User from '../../models/user.js';
import NodeCache from 'node-cache';
import Product from '../../models/sellers/product.js';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// ====================== RECURSIVE HELPER FUNCTIONS ======================

/**
 * Recursively build downstream chain (who this seller sells to)
 */
const buildDownstreamChain = async (seller, depth = 3, visited = new Set()) => {
  if (depth <= 0 || !seller?.sellerProfile?.sellerChain?.length) {
    return [];
  }

  const chain = [];

  for (const entry of seller.sellerProfile.sellerChain) {
    const identifier = entry.email || entry.businessName || entry.phoneNumber;
    if (!identifier || visited.has(identifier)) continue;

    visited.add(identifier);

    // Find the actual user document for this chain entry
    const downstreamSeller = await User.findOne({
      $or: [
        { email: entry.email },
        { "businessProfile.businessName": entry.businessName },
        { phoneNumber: entry.phoneNumber }
      ],
      isSeller: true
    }).lean().select(`
      firstName lastName username email phoneNumber 
      businessProfile.businessName profilePicture
      sellerProfile.sellerChain
    `);

    if (downstreamSeller) {
      const subChain = await buildDownstreamChain(downstreamSeller, depth - 1, visited);
      
      chain.push({
        ...entry,
        _id: downstreamSeller._id,
        username: downstreamSeller.username,
        businessName: downstreamSeller.businessProfile?.businessName || entry.businessName,
        profilePicture: downstreamSeller.profilePicture,
        downstream: subChain,           // Recursive population
        downstreamCount: subChain.length
      });
    } else {
      // If user not found in system, still return the entry
      chain.push({ ...entry, downstream: [], downstreamCount: 0 });
    }
  }

  return chain;
};

/**
 * Recursively build upstream chain (who sells to this seller)
 */
const buildUpstreamChain = async (seller, depth = 3, visited = new Set()) => {
  if (depth <= 0) return [];

  const upstream = await User.find({
    "sellerProfile.sellerChain": {
      $elemMatch: {
        $or: [
          { email: seller.email },
          { phoneNumber: seller.phoneNumber },
          { businessName: seller.businessProfile?.businessName }
        ]
      }
    },
    isSeller: true,
    _id: { $ne: seller._id }
  })
  .lean()
  .select(`
    firstName lastName username email phoneNumber 
    businessProfile.businessName profilePicture
    sellerProfile.sellerChain
  `)
  .limit(15); // Prevent too deep explosion

  const result = [];

  for (const up of upstream) {
    const identifier = up.email || up.businessProfile?.businessName;
    if (visited.has(identifier)) continue;
    visited.add(identifier);

    const subUpstream = await buildUpstreamChain(up, depth - 1, visited);

    result.push({
      ...up,
      upstream: subUpstream,
      upstreamCount: subUpstream.length
    });
  }

  return result;
};

// ====================== MAIN SEARCH FUNCTIONS ======================

const searchBySeller = async (searchTerm, page = 1, limit = 12) => {
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
    return { 
      mainSeller: null, 
      upstream: [], 
      downstream: [], 
      pagination: { page, limit, total: 0 } 
    };
  }

  // Build recursive chains
  const visitedDown = new Set();
  const visitedUp = new Set();

  const downstream = await buildDownstreamChain(mainSeller, 4, visitedDown); // Max depth 4
  const upstream = await buildUpstreamChain(mainSeller, 3, visitedUp);       // Max depth 3

  return {
    mainSeller,
    upstream,
    downstream,
    pagination: { 
      page, 
      limit, 
      total: upstream.length + downstream.length 
    }
  };
};

// Keep your existing searchByProduct as it is (unless you want to enhance it too)
const searchByProduct = async (searchTerm, page = 1, limit = 12) => {
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

// ====================== MAIN CONTROLLER ======================
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

    cache.set(cacheKey, results);
    res.status(200).json({ success: true, data: results });

  } catch (error) {
    console.error('Distribution Chain Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};