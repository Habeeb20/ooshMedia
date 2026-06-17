import User from '../models/user.js';
import Order from '../models/order/Order.js';

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




export const getRiderDashboard = async (req, res) => {
  try {
    const riderId = req.user._id;

    // Get Rider Profile
    const rider = await User.findById(riderId)
      .select('riderProfile firstName lastName phoneNumber');

    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider not found" });
    }

    // Get All Orders Assigned to This Rider
    const deliveries = await Order.find({
      'delivery.assignedRider': riderId
    })
      .populate('buyer', 'firstName lastName phoneNumber')
      .populate('seller', 'firstName lastName businessProfile')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    // Monthly Earnings & Stats
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          'delivery.assignedRider': riderId,
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          earnings: { $sum: "$delivery.agreedDeliveryFee" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalEarnings = deliveries.reduce((sum, order) => 
      sum + (order.delivery?.agreedDeliveryFee || 0), 0
    );

    const completed = deliveries.filter(o => o.status === 'delivered').length;

    res.json({
      success: true,
      riderProfile: rider.riderProfile,
      deliveries,
      monthlyStats,
      stats: {
        totalDeliveries: deliveries.length,
        completed,
        pending: deliveries.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
        totalEarnings
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};