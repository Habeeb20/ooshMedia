import Cart from '../../models/order/Cart.js';
import Product from "../../models/sellers/product.js"

// GET /cart

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get the logged-in user's server-side cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart
 */

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product', 'name images price stockQuantity status seller acceptedPaymentMethods');
    if (!cart) return res.json({ items: [], totalAmount: 0 });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /cart/add
// export const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const product = await Product.findById(productId).populate('seller', 'bankDetails acceptedPaymentMethods');

//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     if (product.status !== 'active') return res.status(400).json({ message: 'Product is not available' });
//     if (product.stockQuantity < quantity) {
//       return res.status(400).json({ message: `Only ${product.stockQuantity} units available` });
//     }

//     let cart = await Cart.findOne({ buyer: req.user._id });
//     if (!cart) cart = new Cart({ buyer: req.user._id, items: [] });

//     const existingIdx = cart.items.findIndex(i => i.product.toString() === productId);
//     if (existingIdx > -1) {
//       const newQty = cart.items[existingIdx].quantity + quantity;
//       if (newQty > product.stockQuantity) {
//         return res.status(400).json({ message: `Only ${product.stockQuantity} units available` });
//       }
//       cart.items[existingIdx].quantity = newQty;
//     } else {
//       cart.items.push({
//         product: product._id,
//         seller: product.seller._id,
//         quantity,
//         price: product.salePrice || product.price,
//         name: product.name,
//         image: product.images.find(i => i.isPrimary)?.url || product.images[0]?.url,
//       });
//     }

//     await cart.save();
//     res.json({ message: 'Added to cart', cart });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, varietyName } = req.body;
    const product = await Product.findById(productId).populate('seller', 'bankDetails acceptedPaymentMethods');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ message: 'Product is not available' });

    let selectedVariety = null;
    let unitPrice = product.salePrice || product.price;
    let itemImage = product.images.find(i => i.isPrimary)?.url || product.images[0]?.url;
    let itemName = product.name;

    if (product.hasVariety) {
      if (!varietyName) {
        return res.status(400).json({ message: 'Please select an option for this product' });
      }
      selectedVariety = product.varieties.find(v => v.name === varietyName);
      if (!selectedVariety) {
        return res.status(400).json({ message: 'Selected option is no longer available' });
      }
      unitPrice = selectedVariety.price;
      itemImage = selectedVariety.image || itemImage;
      itemName = `${product.name} - ${selectedVariety.name}`;
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: `Only ${product.stockQuantity} units available` });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) cart = new Cart({ buyer: req.user._id, items: [] });

    // Match on product AND variety — different varieties of the same product
    // are separate cart lines, same variety merges quantity.
    const existingIdx = cart.items.findIndex(i =>
      i.product.toString() === productId &&
      (i.variety?.name || null) === (selectedVariety?.name || null)
    );

    if (existingIdx > -1) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > product.stockQuantity) {
        return res.status(400).json({ message: `Only ${product.stockQuantity} units available` });
      }
      cart.items[existingIdx].quantity = newQty;
    } else {
      cart.items.push({
        product: product._id,
        seller: product.seller._id,
        quantity,
        price: unitPrice,
        name: itemName,
        image: itemImage,
        variety: selectedVariety ? {
          name: selectedVariety.name,
          price: selectedVariety.price,
          type: selectedVariety.type,
          image: selectedVariety.image,
        } : undefined,
      });
    }

    await cart.save();
    res.json({ message: 'Added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /cart/item/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (quantity > product.stockQuantity) {
      return res.status(400).json({ message: `Only ${product.stockQuantity} units available` });
    }

    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /cart/item/:productId
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /cart/fulfillment
export const updateFulfillment = async (req, res) => {
  try {
    const { fulfillmentType, pickup, delivery, paymentMethod } = req.body;
    const cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (fulfillmentType) cart.fulfillmentType = fulfillmentType;
    if (pickup) cart.pickup = { ...cart.pickup, ...pickup };
    if (delivery) cart.delivery = { ...cart.delivery, ...delivery };
    if (paymentMethod) cart.paymentMethod = paymentMethod;

    await cart.save();
    res.json({ message: 'Fulfillment updated', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ buyer: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};








/**
 * @swagger
 * /api/cart/sync:
 *   post:
 *     summary: Merge a guest (localStorage) cart into the logged-in user's server-side cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     varietyName: { type: string, nullable: true }
 *                     qty: { type: number }
 *     responses:
 *       200:
 *         description: Cart synced, returns the merged cart
 *       400:
 *         description: Invalid payload
 *       500:
 *         description: Server error
 */
export const syncCart = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items must be an array' });
    }

    // dedupe/normalize incoming lines first — client could theoretically send
    // duplicate productId+varietyName pairs across separate cart entries
    const incoming = new Map();
    for (const raw of items) {
      const productId = raw?.productId;
      const varietyName = raw?.varietyName || null;
      const qty = Number(raw?.qty) || 0;

      if (!productId || qty <= 0) continue;

      const key = `${productId}::${varietyName || ''}`;
      incoming.set(key, {
        productId,
        varietyName,
        qty: (incoming.get(key)?.qty || 0) + qty,
      });
    }

    // resolve real product data server-side — never trust client-sent price/name/image
    const productIds = [...new Set([...incoming.values()].map((i) => i.productId))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const resolvedItems = [];
    const skipped = [];

    for (const { productId, varietyName, qty } of incoming.values()) {
      const product = productMap.get(String(productId));

      if (!product || product.status !== 'active') {
        skipped.push({ productId, reason: 'Product not found or inactive' });
        continue;
      }

      let price = product.salePrice || product.price;
      let name = product.name;
      let image = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
      let variety; // subdocument shape: { name, price, type, image }

      if (varietyName) {
        const varietyDoc = product.varieties?.find((v) => v.name === varietyName);
        if (!varietyDoc) {
          skipped.push({ productId, varietyName, reason: 'Variety no longer available' });
          continue;
        }
        price = varietyDoc.price;
        name = `${product.name} - ${varietyDoc.name}`;
        image = varietyDoc.image || image;
        variety = {
          name: varietyDoc.name,
          price: varietyDoc.price,
          type: varietyDoc.type, // must be 'food' or 'drink' per schema enum
          image: varietyDoc.image,
        };
      }

      resolvedItems.push({
        product: product._id,
        variety,
        name,
        price,
        image,
        seller: product.seller,
        quantity: qty,
      });
    }

    // merge into existing server cart rather than overwrite — a second sync
    // (e.g. logging in on another device) shouldn't wipe out items already saved
    let cart = await Cart.findOne({ buyer: buyerId });

    if (!cart) {
      cart = new Cart({ buyer: buyerId, items: resolvedItems });
    } else {
      for (const newItem of resolvedItems) {
        const existing = cart.items.find(
          (i) =>
            String(i.product) === String(newItem.product) &&
            (i.variety?.name || null) === (newItem.variety?.name || null)
        );

        if (existing) {
          existing.quantity += newItem.quantity;
          existing.price = newItem.price; // keep price current
          if (newItem.variety) existing.variety = newItem.variety; // keep variety snapshot current
        } else {
          cart.items.push(newItem);
        }
      }
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Cart synced',
      cart,
      skipped: skipped.length ? skipped : undefined,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};