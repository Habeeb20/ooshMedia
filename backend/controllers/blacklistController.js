
import User from '../models/user.js';
// POST /api/admin/users/:id/blacklist  (admin)  body: { reason }
export const blacklistUser = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ success: false, message: 'Reason is required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlacklisted = true;
    user.blacklist = user.blacklist || {};
    user.blacklist.reason = reason.trim();
    user.blacklist.blacklistedAt = new Date();
    user.blacklist.blacklistedBy = req.user._id;
    user.blacklist.history = user.blacklist.history || [];
    user.blacklist.history.push({ action: 'blacklisted', reason: reason.trim(), by: req.user._id });

    await user.save();
    res.json({ success: true, message: 'User blacklisted', user });
  } catch (err) {
    console.error('blacklistUser error:', err);
    res.status(500).json({ success: false, message: 'Failed to blacklist user' });
  }
};

// POST /api/admin/users/:id/unblacklist  (admin)
export const unblacklistUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlacklisted = false;
    user.blacklist.unblacklistedAt = new Date();
    user.blacklist.unblacklistedBy = req.user._id;
    user.blacklist.history = user.blacklist.history || [];
    user.blacklist.history.push({ action: 'unblacklisted', by: req.user._id });

    await user.save();
    res.json({ success: true, message: 'User unblacklisted', user });
  } catch (err) {
    console.error('unblacklistUser error:', err);
    res.status(500).json({ success: false, message: 'Failed to unblacklist user' });
  }
};

// GET /api/admin/users?blacklisted=true  (admin) — reuse for listing sellers to manage
export const getUsersForAdmin = async (req, res) => {
  try {
    const { blacklisted, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (blacklisted !== undefined) filter.isBlacklisted = blacklisted === 'true';
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { 'businessProfile.businessName': new RegExp(search, 'i') },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName username email phoneNumber businessProfile.businessName isSeller isBlacklisted blacklist')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getUsersForAdmin error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// GET /api/blacklist/public — PUBLIC, no auth, no reporter/report details exposed
export const getPublicBlacklist = async (req, res) => {
  try {
    const users = await User.find({ isBlacklisted: true })
      .select('firstName lastName username businessProfile.businessName businessProfile.businessAddress state lga blacklist.blacklistedAt blacklist.reason profilePicture isSeller')
      .sort({ 'blacklist.blacklistedAt': -1 });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('getPublicBlacklist error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blacklist' });
  }
};