// controllers/staff/staffController.js
import bcrypt from 'bcryptjs';
import User from '../../models/user.js';
import Staff, {SIDEBAR_KEYS} from '../../models/sellers/staff.js';
import Transaction from '../../models/order/Transaction.js';
import { sendEmail } from '../../utills/sendEmail.js';
import { generate4DigitCode } from '../../utills/sendOtp.js';
import { signControlRoomToken } from '../../middleware/controlRoomAuth.js';
import { sendSMSViaKudi } from '../../utills/sendOtp.js';
import mongoose from 'mongoose';

// ── Creator activation ──────────────────────────────────────────────
// POST /api/staff/activate-creator   (requires normal auth — req.user)
// export const activateCreatorControlRoom = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

//     if (!user.sellerProfile?.inventoryAccess?.paid) {
//       return res.status(403).json({ success: false, message: 'Unlock inventory access before activating the Control Room.' });
//     }
//     if (!user.email && !user.alternateContact) {
//       return res.status(400).json({ success: false, message: 'Add an email to your account first.' });
//     }

//     const code = generate4DigitCode();
//     const hashedCode = await bcrypt.hash(code, 10);

//     user.sellerProfile.controlRoom = {
//       codeHash: hashedCode,
//       activatedAt: new Date(),
//       codeIssuedAt: new Date(),
//     };
//     await user.save();

//     await sendEmail({
//       to:  user.alternateContact || user.email ,
//       subject: 'Your Control Room access code',
//       html: `<p>Hi ${user.firstName},</p>
//              <p>Your Control Room access code is:</p>
//              <h2 style="letter-spacing:4px;">${code}</h2>
//              <p>Use this code to manage your staff and track their sales. Keep it private.</p>`,
//     });

//     return res.status(200).json({ success: true, message: 'Access code sent to your email.' });
   
//   } catch (err) {
//     console.error('[activateCreatorControlRoom]', err);
//     return res.status(500).json({ success: false, message: 'Could not activate Control Room.' });
//   }
// };

export const activateCreatorControlRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!user.sellerProfile?.inventoryAccess?.paid) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unlock inventory access before activating the Control Room.' 
      });
    }

    if (!user.email && !user.alternateContact) {
      return res.status(400).json({ 
        success: false, 
        message: 'Add an email or alternate contact to your account first.' 
      });
    }

    const code = generate4DigitCode();
    const hashedCode = await bcrypt.hash(code, 10);

    // Activate Control Room
    user.sellerProfile.controlRoom = {
      codeHash: hashedCode,
      activatedAt: new Date(),
      codeIssuedAt: new Date(),
    };

    await user.save();

    const contactEmail = user.email || user.alternateContact;
    const contactPhone = user.alternateContact || user.phone;
    const htmlMessage = `
      <p>Hi ${user.firstName},</p>
      <p>Your Control Room access code is:</p>
      <h2 style="letter-spacing:4px;">${code}</h2>
      <p>Use this code to manage your staff and track their sales. Keep it private.</p>
    `;

    let emailSent = false;
    let smsSent = false;

    // Try Email First
    if (contactEmail) {
      try {
        await sendEmail({
          to: contactEmail,
          subject: 'Your Control Room access code',
          html: htmlMessage,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error('[activateCreatorControlRoom] Email failed:', emailErr);
      }
    }

    // Fallback to SMS if email failed or no email exists
    if ((!emailSent || !contactEmail) && contactPhone) {
      try {
        await sendSMSViaKudi(contactPhone, `
          Hi ${user.firstName}, 
          Your Control Room access code is: ${code}
          Keep it private.
        `);
        smsSent = true;
      } catch (smsErr) {
        console.error('[activateCreatorControlRoom] SMS failed:', smsErr);
      }
    }

    // Final Response
    if (emailSent || smsSent) {
      return res.status(200).json({ 
        success: true, 
        message: emailSent 
          ? 'Access code sent to your email.' 
          : 'Access code sent via SMS.' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send access code via both email and SMS.' 
      });
    }

  } catch (err) {
    console.error('[activateCreatorControlRoom]', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Could not activate Control Room.' 
    });
  }
};
// POST /api/staff/reissue-creator-code (in case the code is lost)
// export const reissueCreatorCode = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user?.sellerProfile?.controlRoom?.activatedAt) {
//       return res.status(400).json({ success: false, message: 'Control Room has not been activated yet.' });
//     }

//     const code = generate4DigitCode();
//     user.sellerProfile.controlRoom.codeHash = await bcrypt.hash(code, 10);
//     user.sellerProfile.controlRoom.codeIssuedAt = new Date();
//     await user.save();

//     await sendEmail({
//       to: user.email || user.alternateContact,
//       subject: 'Your new Control Room access code',
//       html: `<p>Your new Control Room access code is:</p><h2 style="letter-spacing:4px;">${code}</h2>`,
//     });

//     return res.status(200).json({ success: true, message: 'New code sent to your email.' });
//   } catch (err) {
//     console.error('[reissueCreatorCode]', err);
//     return res.status(500).json({ success: false, message: 'Could not reissue code.' });
//   }
// };

export const reissueCreatorCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user?.sellerProfile?.controlRoom?.activatedAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Control Room has not been activated yet.' 
      });
    }

    const code = generate4DigitCode();
    const hashedCode = await bcrypt.hash(code, 10);

    // Update code
    user.sellerProfile.controlRoom.codeHash = hashedCode;
    user.sellerProfile.controlRoom.codeIssuedAt = new Date();
    await user.save();

    const contactEmail = user.email || user.alternateContact;
    const contactPhone = user.phone || user.alternateContact;

    const htmlMessage = `
      <p>Hi ${user.firstName},</p>
      <p>Your new Control Room access code is:</p>
      <h2 style="letter-spacing:4px;">${code}</h2>
      <p>Use this code to manage your staff and track their sales. Keep it private.</p>
    `;

    let emailSent = false;
    let smsSent = false;

    // Try Email First
    if (contactEmail) {
      try {
        await sendEmail({
          to: contactEmail,
          subject: 'Your new Control Room access code',
          html: htmlMessage,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error('[reissueCreatorCode] Email failed:', emailErr);
      }
    }

    // Fallback to SMS if email failed or no email
    if ((!emailSent || !contactEmail) && contactPhone) {
      try {
        await sendSMSViaKudi(contactPhone, `
          Hi ${user.firstName}, 
          Your new Control Room access code is: ${code}
          Keep it private.
        `);
        smsSent = true;
      } catch (smsErr) {
        console.error('[reissueCreatorCode] SMS failed:', smsErr);
      }
    }

    // Response
    if (emailSent || smsSent) {
      return res.status(200).json({ 
        success: true, 
        message: emailSent 
          ? 'New code sent to your email.' 
          : 'New code sent via SMS.' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send new access code via both email and SMS.' 
      });
    }

  } catch (err) {
    console.error('[reissueCreatorCode]', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Could not reissue code.' 
    });
  }
};

// ── Control Room login ──────────────────────────────────────────────
// POST /api/staff/control-room/login   (requires normal auth — req.user)
export const controlRoomLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Enter your 4-digit code.' });

    const user = await User.findById(req.user._id);
    const roomAuth = user?.sellerProfile?.controlRoom;
    if (!roomAuth?.codeHash) {
      return res.status(400).json({ success: false, message: 'Control Room has not been activated yet.' });
    }

    const isMatch = await bcrypt.compare(String(code), roomAuth.codeHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect code.' });
    }

    const token = signControlRoomToken(user._id.toString());
    return res.status(200).json({ success: true, controlRoomToken: token });
  } catch (err) {
    console.error('[controlRoomLogin]', err);
    return res.status(500).json({ success: false, message: 'Could not log in to Control Room.' });
  }
};

// ── Staff management (all require requireControlRoomAuth) ───────────
// POST /api/staff
// export const createStaff = async (req, res) => {
//   try {
//     const { fullName, email, phoneNumber, age, role } = req.body;
//     if (!fullName || !email) {
//       return res.status(400).json({ success: false, message: 'Full name and email are required.' });
//     }

//     const code = generate4DigitCode();

//     const staff = await Staff.create({
//       creator: req.creatorId,
//       fullName,
//       email: email.toLowerCase(),
//       phoneNumber,
//       age,
//       role,
//       code,
//     });

//     await sendEmail({
//       to: email,
//       subject: `You've been added as staff`,
//       html: `<p>Hi ${fullName},</p>
//              <p>You've been added as staff${role ? ` (${role})` : ''}. Your login code for the POS is:</p>
//              <h2 style="letter-spacing:4px;">${code}</h2>
//              <p>Use this code at the point of sale to clock in under your name.</p>`,
//     });

//     return res.status(201).json({ success: true, staff });
//   } catch (err) {
//     console.error('[createStaff]', err);
//     return res.status(500).json({ success: false, message: 'Could not add staff member.' });
//   }
// };

export const createStaff = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, age, role } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name and email are required.' 
      });
    }

    const code = generate4DigitCode();

    const staff = await Staff.create({
      creator: req.creatorId,
      fullName,
      email: email.toLowerCase(),
      phoneNumber,
      age,
      role,
      code,
    });

    const htmlMessage = `
      <p>Hi ${fullName},</p>
      <p>You've been added as staff${role ? ` (${role})` : ''}.</p>
      <p>Your login code for the POS is:</p>
      <h2 style="letter-spacing:4px;">${code}</h2>
      <p>Use this code at the point of sale to clock in under your name.</p>
    `;

    let emailSent = false;
    let smsSent = false;

    // Try Email First
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: `You've been added as staff`,
          html: htmlMessage,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error('[createStaff] Email failed:', emailErr);
      }
    }

    // Fallback to SMS if email failed or phone exists
    if ((!emailSent || !email) && phoneNumber) {
      try {
        await sendSMSViaKudi(phoneNumber, `
          Hi ${fullName}, 
          You've been added as staff${role ? ` (${role})` : ''}.
          Your POS login code is: ${code}
          Keep it private.
        `);
        smsSent = true;
      } catch (smsErr) {
        console.error('[createStaff] SMS failed:', smsErr);
      }
    }

    // Final Response
    if (emailSent || smsSent) {
      return res.status(201).json({ 
        success: true, 
        staff,
        message: emailSent 
          ? 'Staff added and code sent via email.' 
          : 'Staff added and code sent via SMS.' 
      });
    } else {
      return res.status(201).json({ 
        success: true, 
        staff,
        message: 'Staff added successfully. (Code sending failed)' 
      });
    }

  } catch (err) {
    console.error('[createStaff]', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Could not add staff member.' 
    });
  }
};

// GET /api/staff
export const listStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ creator: req.creatorId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, staff });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not load staff.' });
  }
};

// put /api/staff/:id/active
export const toggleStaffActive = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, creator: req.creatorId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found.' });

    staff.isActive = !staff.isActive;
    await staff.save();

    return res.status(200).json({ success: true, staff });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not update staff status.' });
  }
};

// put /api/staff/:id/permissions  body: { permissions: { stock: true, POS: false, ... } }
export const updateStaffPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const staff = await Staff.findOne({ _id: req.params.id, creator: req.creatorId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found.' });

    const sanitized = {};
    for (const key of SIDEBAR_KEYS) {
      sanitized[key] = !!permissions?.[key];
    }
    staff.permissions = sanitized;
    await staff.save();

    return res.status(200).json({ success: true, staff });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not update permissions.' });
  }
};

// DELETE /api/staff/:id
export const removeStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ _id: req.params.id, creator: req.creatorId });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found.' });
    return res.status(200).json({ success: true, message: 'Staff removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not remove staff.' });
  }
};

// ── POS clock-in (requires normal seller auth — the device is on the seller's session) ──
// POST /api/staff/pos-login   body: { code }
export const staffPOSLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Enter your 4-digit code.' });

    const staff = await Staff.findOne({ creator: req.user._id, code: String(code), isActive: true });
    if (!staff) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive staff code.' });
    }

    staff.lastLoginAt = new Date();
    await staff.save();

    return res.status(200).json({
      success: true,
      staff: { id: staff._id, fullName: staff.fullName, role: staff.role, permissions: staff.permissions },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not clock in.' });
  }
};
const resolveRange = (range) => {
  const now = new Date();
  let start;
  let end = null;

  switch (range) {
    case 'all':
      return { start: null, end: null };
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '48h':
      start = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      break;
    case 'thisWeek': {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diffToMonday);
      d.setHours(0, 0, 0, 0);
      start = d;
      break;
    }
    case 'lastWeek': {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diffToMonday - 7);
      d.setHours(0, 0, 0, 0);
      start = d;
      end = new Date(d);
      end.setDate(end.getDate() + 7);
      break;
    }
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last3Months':
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case 'last6Months':
      start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  return { start, end };
};

export const getStaffSalesSummary = async (req, res) => {
  try {
    const range = req.query.range || '24h';
    const { start, end } = resolveRange(range);

    const match = {
      seller: new mongoose.Types.ObjectId(req.creatorId),
      isPOS: true,
    };

    if (start) {
      match.createdAt = end ? { $gte: start, $lte: end } : { $gte: start };
    }

    const results = await Transaction.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } }, // so transactions within each group come out newest-first
      {
        $group: {
          _id: { $ifNull: ['$staff', 'unattributed'] },
          staffName: { $first: { $ifNull: ['$staffName', 'Unattributed'] } },
          totalSales: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          transactions: { $push: '$$ROOT' }, // full document for every transaction in this group
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    return res.status(200).json({ success: true, range, data: results });
  } catch (err) {
    console.error('[getStaffSalesSummary]', err);
    return res.status(500).json({ success: false, message: 'Could not load sales summary.' });
  }
};