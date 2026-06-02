import Cart from '../../models/order/Cart.js';
import Product from "../../models/sellers/product.js"

// GET /cart
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
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId).populate('seller', 'bankDetails acceptedPaymentMethods');

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ message: 'Product is not available' });
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: `Only ${product.stockQuantity} units available` });
    }

    let cart = await Cart.findOne({ buyer: req.user._id });
    if (!cart) cart = new Cart({ buyer: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(i => i.product.toString() === productId);
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
        price: product.salePrice || product.price,
        name: product.name,
        image: product.images.find(i => i.isPrimary)?.url || product.images[0]?.url,
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
