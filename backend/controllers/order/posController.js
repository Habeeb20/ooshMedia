import Transaction from '../../models/order/Transaction.js';
import Product from '../../models/sellers/product.js';
import User from '../../models/user.js';

// POST /pos/sale
// Seller (or clocked-in staff) creates a walk-in sale from the POS terminal
export const createPOSSale = async (req, res) => {
  try {
    const { items, customerName, customerPhone, paymentMethod, staffId, staffName } = req.body;
    // items: [{ productId, quantity, price }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, seller: req.user._id });
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;
      enrichedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal,
      });

      product.stockQuantity -= item.quantity;
      product.sold += item.quantity;
      if (product.stockQuantity <= 0) product.status = 'out_of_stock';
      await product.save();
    }

    const platformFee = +(totalAmount * 0.10).toFixed(2);
    const sellerAmount = +(totalAmount - platformFee).toFixed(2);

    const tx = await Transaction.create({
      seller: req.user._id,
      type: 'pos_sale',
      amount: +totalAmount.toFixed(2),
      platformFee,
      sellerAmount,
      paymentMethod: paymentMethod || 'pos_cash',
      paymentStatus: 'completed',
      customerName,
      customerPhone,
      isPOS: true,
      items: enrichedItems,
      staff: staffId || null,
      staffName: staffName || null,
    });

    res.json({ message: 'Sale recorded', transaction: tx });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /pos/receipt/:txId
export const getPOSReceipt = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.txId).populate('seller', 'firstName lastName shopName phoneNumber email');
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    if (tx.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /pos/history
export const getPOSHistory = async (req, res) => {
  try {
    const { from, to, paymentMethod, staffId } = req.query;
    const query = { seller: req.user._id, isPOS: true };
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (staffId) query.staff = staffId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};