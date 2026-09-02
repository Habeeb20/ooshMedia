import Voucher from "../models/voucher.js";

// Flattens every voucher redemption that included at least one of this
// seller's products into a simple, sortable list — so a seller can see
// exactly which of their products were bought with a voucher, by whom,
// and how much of it was voucher-funded (useful for reconciling payouts).
export async function sellerGetVoucherSales(req, res) {
  try {
    const sellerId = req.user._id;

    const vouchers = await Voucher.find({ "redemptions.matchedItems.seller": sellerId })
      .populate("redemptions.user", "firstName lastName username phoneNumber")
      .populate("redemptions.matchedItems.product", "name images")
      .populate("redemptions.order");

    const sales = [];
    for (const v of vouchers) {
      for (const r of v.redemptions) {
        const mine = r.matchedItems.filter((m) => String(m.seller) === String(sellerId));
        for (const m of mine) {
          sales.push({
            voucherCode: v.code,
            voucherCategory: v.category,
            buyer: r.user,
            order: r.order,
            product: m.product,
            quantity: m.quantity,
            subtotalKobo: m.subtotalKobo,
            amountCoveredByVoucherKobo: m.amountCoveredKobo,
            usedAt: r.usedAt,
          });
        }
      }
    }

    sales.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
    return res.json({ sales });
  } catch (err) {
    console.error("sellerGetVoucherSales error:", err);
    return res.status(500).json({ message: "Could not load your voucher sales." });
  }
}
