// controllers/admin/userLoyaltyController.js
import User from '../../models/user.js';

export const toggleUserLoyaltyUsage = async (req, res) => {
  const { userId } = req.params;
  const { enabled } = req.body;
  const user = await User.findByIdAndUpdate(
    userId, { loyaltyUsageAllowed: !!enabled }, { new: true }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ userId: user._id, loyaltyUsageAllowed: user.loyaltyUsageAllowed });
};