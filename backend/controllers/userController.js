import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'
import { generateAndSendOTP, verifyOTP } from '../utills/sendOtp.js';
import axios from "axios"
import { uploadVideoToS3 } from '../utills/s3BucketUpload.js';
import { generateFallbackEmail } from './walletController.js';
import { sendEmail } from '../utills/sendEmail.js';
import { generateToken } from '../utills/sendEmail.js';

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit

// Build the safe user object returned to the client
const toClientUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  profilePicture: user.profilePicture,
  isRider: user.isRider,
  isSeller: user.isSeller,
  isEmployer: user.isEmployer,
  uniqueNumber: user.uniqueNumber,
  referralCode: user.referralCode,
  referralPoints: user.referralPoints,
  businessProfileCompleted: user.businessProfileCompleted,
});
// ==================== SEND OTP ====================
export const sendOTP = async (req, res) => {
  try {
    const { email, phone, type } = req.body;

    let contact = email || phone;

    if (!contact || !type) {
      return res.status(400).json({ 
        success: false, 
        message: "Contact and type are required" 
      });
    }

    await generateAndSendOTP({ contact, type });

    res.json({ 
      success: true, 
      message: `OTP sent successfully to ${contact}` 
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send OTP" 
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { contact, otp } = req.body;

    const result = verifyOTP(contact, otp);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const signup = async (req, res) => {
  try {
    const {
      firstName, lastName, username, email, phoneNumber,
      alternateContact, state, lga, dateOfBirth,
      role, profilePicture, password,    referralCode 
    } = req.body;

 const orConditions = [];
if (email) orConditions.push({ email: email.toLowerCase() });
if (phoneNumber) orConditions.push({ phoneNumber });

if (orConditions.length === 0) {
  return res.status(400).json({
    status: false,
    message: "Email or phone number is required",
  });
}

const existingUser = await User.findOne({ $or: orConditions });
    if (existingUser) {
   console.log("i am here")
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

       // Handle Referral
    if (referralCode) {
      const referrer = await User.findOne({ 
        referralCode: referralCode.toUpperCase().trim() 
      });

      if (referrer) {
        referrer.referralPoints += 20;
        referrer.referralCount += 1;
        newUser.referredBy = referrer._id;
        await referrer.save();
      }
    }

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      alternateContact,
      state,
      lga,
      dateOfBirth,
      role,
      profilePicture,
      password: hashedPassword,
      referralCode: referralCode?.toUpperCase().trim()
    });

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        firstName: newUser.firstName,
        role: newUser.role,
        profilePicture: newUser.profilePicture
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to create account" });
  }
};





// ==================== NEW: LOGIN ====================
export const login = async (req, res) => {
  try {
    const { contact, password } = req.body; // contact can be email or phone or username

    const user = await User.findOne({
      $or: [{ email: contact }, { phoneNumber: contact }, { username: contact }]
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
// ── Contact login (email, phone, or username + password) ───────────


// export const login = async (req, res) => {
//   try {
//     const { contact, password } = req.body;

//     if (!contact || !password) {
//       return res.status(400).json({ success: false, message: 'Contact and password are required' });
//     }

//     const normalizedContact = contact.trim().toLowerCase();

//     const user = await User.findOne({
//       $or: [
//         { email: normalizedContact },
//         { phoneNumber: contact.trim() },
//         { username: normalizedContact },
//       ],
//     }).select('+password');

//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     const token = generateToken(user);

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       token,
//       user: toClientUser(user),
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Server error during login' });
//   }
// };

// ── e-Auth step 1: request a code (email only — OTP needs an inbox) ─
export const requestEAuthOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.eAuthOtp = { code, expiresAt, attempts: 0 };
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your Estores login code',
      html: `<p>Hi ${user.firstName},</p><p>Your login code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    });

    res.status(200).json({ success: true, message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending code' });
  }
};

// ── e-Auth step 2: verify the code and log in ───────────────────────
export const verifyEAuthOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+eAuthOtp.code');

    if (!user || !user.eAuthOtp?.code) {
      return res.status(401).json({ success: false, message: 'Invalid or expired code' });
    }

    if (user.eAuthOtp.expiresAt < new Date()) {
      user.eAuthOtp = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Code has expired. Please request a new one.' });
    }

    if (user.eAuthOtp.attempts >= 5) {
      user.eAuthOtp = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new code.' });
    }

    if (user.eAuthOtp.code !== code.trim()) {
      user.eAuthOtp.attempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({ success: false, message: 'Incorrect code' });
    }

    user.eAuthOtp = undefined;
    await user.save({ validateBeforeSave: false });

       const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: toClientUser(user),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};
// ==================== NEW: FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { contact, type } = req.body; // email or phone

    const user = await User.findOne(
      type === 'email' ? { email: contact } : { phoneNumber: contact }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    await generateAndSendOTP({ contact, type });
    
    res.json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { contact, otp, newPassword } = req.body;

    const result = verifyOTP(contact, otp);
    if (!result.success) return res.status(400).json({ message: result.message });

    const user = await User.findOne({ 
      $or: [{ email: contact }, { phoneNumber: contact }] 
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
};



export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;   // Make sure you're using req.user._id (not userId)

 // For debugging

    const user = await User.findById(userId).select(
      'firstName lastName username email phoneNumber alternateContact profilePicture isSeller role state lga isRider dateOfBirth createdAt businessProfile sellerProfile'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24)
    );

    const dashboardData = {
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        alternateContact:user.alternateContact,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role,
        isRider:user.isRider,
        state: user.state,
        lga: user.lga,
        isSeller: user.isSeller,
        dateOfBirth: user.dateOfBirth,
        accountAge: `${accountAge} days`,
        memberSince: new Date(user.createdAt).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'long'
        }),
        // Include full business profile
        businessProfile: user.businessProfile || null,
        sellerProfile: user.sellerProfile || null
      },
      stats: {
        profileComplete: calculateProfileCompletion(user),
        accountAge: accountAge,
        status: "Active",
        businessProfileCompleted: user.businessProfileCompleted || false,
        businessProfileCompletionPercentage: user.businessProfileCompletionPercentage || 0,
      },
      message: `Welcome back, ${user.firstName}!`
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });
  }
};

// Helper Function
const calculateProfileCompletion = (user) => {
  let completed = 0;
  let total = 8;

  if (user.firstName) completed++;
  if (user.lastName) completed++;
  if (user.username) completed++;
  if (user.email || user.phoneNumber) completed++;
  if (user.profilePicture) completed++;
  if (user.state) completed++;
  if (user.lga) completed++;
  if (user.dateOfBirth) completed++;

  return Math.round((completed / total) * 100);
};




export const updateBusinessProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // if (user.role !== 'entity') {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: "Only business entities can update business profile" 
    //   });
    // }

    const {
      // Basic User Info
      firstName,
      lastName,
      state,
      lga,
      profilePicture,
      isRider,

      // Business Profile Fields
      businessName,
      businessAddress,
      entityCategory,
      yearsInBusiness,
      staffCount,
      registeredBusiness,
      openingHours,
    } = req.body;

    // ==================== UPDATE BASIC USER INFO ====================
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (state) user.state = state;
    if (lga) user.lga = lga;
    if (isRider) user.isRider = isRider;
    if (profilePicture) user.profilePicture = profilePicture;

    // ==================== HANDLE GALLERY (Existing Logic) ====================
    let gallery = user.businessProfile?.gallery || [];

    if (req.body.gallery && Array.isArray(req.body.gallery)) {
      gallery = [...gallery, ...req.body.gallery];
    }

    if (req.files && req.files.length > 0) {
      const videoUploads = await Promise.all(
        req.files.map(file => uploadVideoToS3(file, 'business-gallery'))
      );

      const videoEntries = videoUploads.map(upload => ({
        url: upload.url,
        publicId: upload.key,
        type: 'video',
        platform: 's3'
      }));

      gallery = [...gallery, ...videoEntries];
    }

    // ==================== UPDATE BUSINESS PROFILE ====================
    user.businessProfile = {
      ...user.businessProfile,
      businessName: businessName || user.businessProfile?.businessName,
      businessAddress: businessAddress || user.businessProfile?.businessAddress,
      entityCategory: entityCategory || user.businessProfile?.entityCategory || [],
      yearsInBusiness: yearsInBusiness !== undefined ? Number(yearsInBusiness) : user.businessProfile?.yearsInBusiness,
      staffCount: staffCount !== undefined ? Number(staffCount) : user.businessProfile?.staffCount,
      registeredBusiness: registeredBusiness !== undefined ? registeredBusiness : user.businessProfile?.registeredBusiness,
      openingHours: openingHours || user.businessProfile?.openingHours || [],
      gallery: gallery,
    };

    // Calculate Completion Percentage
    const completionPercentage = calculateBusinessProfileCompletion(user.businessProfile);

    user.businessProfileCompleted = completionPercentage === 100;
    user.businessProfileUpdatedAt = new Date();
    user.businessProfileCompletionPercentage = completionPercentage;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        state: user.state,
        lga: user.lga,
        profilePicture: user.profilePicture,
        isRider: user.isRider
      },
      businessProfile: user.businessProfile,
      completionPercentage,
      isCompleted: user.businessProfileCompleted
    });

  } catch (error) {
    console.error("Business Profile Update Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};

// Helper Function (unchanged)
const calculateBusinessProfileCompletion = (profile) => {
  if (!profile) return 0;

  let score = 0;
  const totalFields = 7;

  if (profile.businessName?.trim()) score++;
  if (profile.businessAddress?.trim()) score++;
  if (profile.entityCategory?.length > 0) score++;
  if (profile.yearsInBusiness !== undefined && profile.yearsInBusiness > 0) score++;
  if (profile.staffCount !== undefined && profile.staffCount > 0) score++;
  if (profile.registeredBusiness !== undefined) score++;
  if (profile.openingHours?.length > 0) score++;

  return Math.round((score / totalFields) * 100);
};

const WALLET_BASE = 'https://api-ewallet.eroot.ng/api';



export const createWallet = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isWallet) {
      return res.status(400).json({ success: false, message: 'Wallet already created' });
    }

    // ── Resolve email — generate fallback if missing ──────────────
    const email = user.email
      || (user.alternateContact?.includes('@') ? user.alternateContact : null)
      || generateFallbackEmail(user._id, user.username);

    // ── Normalise phone to 080XXXXXXXXX ──────────────────────────
    const rawPhone = user.phoneNumber || user.alternateContact || '';
    let phone = rawPhone.replace(/\s+/g, '').replace(/^\+/, '');
    if (phone.startsWith('234')) phone = '0' + phone.slice(3);

    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'A valid phone number is required' });
    }

    const payload = {
      first_name:     user.firstName,
      last_name:      user.lastName,
      email:          email || user.alternateContact,          // ← real or generated fallback
      password:       'password123',
      phone:          phone  || user.alternateContact,          // ← normalised 080XXXXXXXXX
      preferred_bank: 'wema-bank',
      provider_slug:  'wema-bank',
      metadata: [
        { key: 'user_id',  value: user._id.toString() },
        { key: 'username', value: user.username },
      ],
    };

    console.log('Wallet create payload →', payload);

    const walletRes = await axios.post(
      `${WALLET_BASE}/register`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const responseData = walletRes.data;
    console.log('Wallet API response →', responseData);

    // ── Extract token returned by the API after registration ──────
    const walletToken =
      responseData?.token ||
      responseData?.access_token ||
      responseData?.data?.token ||
      responseData?.data?.access_token ||
      null;

    // ── Extract dedicated account details ─────────────────────────
    const dedicated = responseData?.dedicated_account || {};

    // ── Persist to user document ──────────────────────────────────
    user.isWallet          = true;
    user.walletAccount     = {
      accountNumber: dedicated.account_number || 'N/A',
      accountName:   dedicated.account_name   || `${user.firstName} ${user.lastName}`,
      bankName:      dedicated.bank_name       || 'Wema Bank',
      currency:      dedicated.currency        || 'NGN',
      providerSlug:  'wema-bank',
      customerCode:  responseData?.customer?.customer_code || null,
      externalId:    responseData?.user?.id?.toString()   || null,
      walletEmail:   email,       // ← save whichever email was used (real or fallback)
      walletToken:   walletToken, // ← save token for future API calls
      createdAt:     new Date(),
    };

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Wallet created successfully',
      wallet:  user.walletAccount,
    });

  } catch (error) {
    const apiError = error.response?.data;
    console.error('createWallet error →', apiError || error.message);

    return res.status(500).json({
      success: false,
      message: apiError?.message || 'Failed to create wallet',
      details: apiError || null,
    });
  }
};



export const getWalletStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isWallet walletAccount firstName lastName email phoneNumber alternateContact');
    res.json({ success: true, isWallet: user.isWallet, wallet: user.walletAccount, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

























