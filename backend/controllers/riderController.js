import User from '../models/user.js';

// Update Rider Profile
export const updateRiderProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;


    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Enable rider mode
    user.isRider = true;

    // Update rider profile
    user.riderProfile = {
      ...user.riderProfile,
      ...updateData,
      verificationRequestedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: "Rider profile updated successfully",
      rider: user.riderProfile
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Current User Rider Profile
export const getRiderProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('riderProfile isRider firstName lastName phoneNumber');

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      isRider: user.isRider,
      riderProfile: user.riderProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};