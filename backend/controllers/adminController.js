import User from "../models/user.js";



export const adminLogin = async (req, res) => {
      const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Superadmin credentials required.',
      });
    }



    const token = generateToken(user._id, 'admin');

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}


