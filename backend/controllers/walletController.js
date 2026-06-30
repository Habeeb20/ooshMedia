
// import User from '../models/user.js';
// import WalletTransaction from '../models/WalletTransaction.js';

// import axios from 'axios';

// const WALLET_BASE = 'https://api-ewallet.eroot.ng/api';

// // ─── helper: forward auth header if needed by external API ───────
// const walletHeaders = () => ({ 'Content-Type': 'application/json' });

// // =====================================================================
// // POST /api/wallet/record
// // Save a transaction to local DB (called after every wallet operation)
// // =====================================================================
// export const recordTransaction = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const {
//       type, direction, amount, fee,
//       recipient, narration, reference,
//       externalReference, transferCode,
//       status, failReason, apiSnapshot,
//       balanceBefore, balanceAfter,
//     } = req.body;

//     const tx = await WalletTransaction.create({
//       user: userId,
//       type,
//       direction,
//       amount,
//       fee:              fee || 0,
//       recipient:        recipient || {},
//       narration,
//       reference,
//       externalReference,
//       transferCode,
//       status:           status || 'success',
//       failReason,
//       apiSnapshot,
//       balanceBefore,
//       balanceAfter,
//     });

//     return res.status(201).json({ success: true, data: tx });
//   } catch (err) {
//     console.error('recordTransaction error:', err.message);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // =====================================================================
// // GET /api/wallet/history
// // Fetch paginated transaction history from local DB
// // =====================================================================
// export const getTransactionHistory = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const limit  = parseInt(req.query.limit)  || 20;
//     const page   = parseInt(req.query.page)   || 1;
//     const skip   = (page - 1) * limit;
//     const type   = req.query.type; // optional filter

//     const filter = { user: userId };
//     if (type) filter.type = type;

//     const [txns, total] = await Promise.all([
//       WalletTransaction.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       WalletTransaction.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       data:    txns,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     console.error('getTransactionHistory error:', err.message);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // =====================================================================
// // GET /api/wallet/balance
// // Fetch live balance from external wallet API
// // =====================================================================
// export const getWalletBalance = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).lean();
//     if (!user?.email) {
//       return res.status(400).json({ success: false, message: 'User email not found' });
//     }

//     const response = await axios.get(
//       `${WALLET_BASE}/balance`,
//       { email: user.email },
//       { headers: walletHeaders() }
//     );

//     return res.status(200).json({
//       success: true,
//       data:    response.data?.data || response.data,
//     });
//   } catch (err) {
//     console.error('getWalletBalance error:', err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.response?.data?.message || 'Failed to fetch balance',
//     });
//   }
// };

// // =====================================================================
// // GET /api/wallet/banks
// // Fetch list of supported banks from external wallet API
// // =====================================================================
// export const fetchBanks = async (req, res) => {
//   try {
//     const response = await axios.get(
//       `${WALLET_BASE}/fetch/bank/provider/public`,
//       { headers: walletHeaders() }
//     );

//     return res.status(200).json({
//       success: true,
//       data:    response.data?.data || response.data,
//     });
//   } catch (err) {
//     console.error('fetchBanks error:', err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.response?.data?.message || 'Failed to fetch banks',
//     });
//   }
// };

// // =====================================================================
// // POST /api/wallet/verify-account
// // Verify a bank account number before transfer
// // =====================================================================
// export const verifyAccount = async (req, res) => {
//   try {
//     const { account_number, bank_code } = req.body;

//     if (!account_number || !bank_code) {
//       return res.status(400).json({ success: false, message: 'account_number and bank_code are required' });
//     }

//     const response = await axios.post(
//       `${WALLET_BASE}/verify-account`,
//       { account_number, bank_code },
//       { headers: walletHeaders() }
//     );

//     return res.status(200).json({
//       success: true,
//       data:    response.data?.data || response.data,
//     });
//   } catch (err) {
//     console.error('verifyAccount error:', err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.response?.data?.message || 'Account verification failed',
//     });
//   }
// };

// // =====================================================================
// // POST /api/wallet/transfer
// // Create recipient + execute transfer + save to local DB
// // =====================================================================
// export const transferFunds = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user   = await User.findById(userId).lean();

//     if (!user?.email) {
//       return res.status(400).json({ success: false, message: 'User email not found' });
//     }

//     const {
//       account_number, bank_code, account_name,
//       amount, narration,
//     } = req.body;

//     if (!account_number || !bank_code || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'account_number, bank_code and amount are required',
//       });
//     }

//     const ref = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

//     // 1. Create recipient
//     const recRes = await axios.post(
//       `${WALLET_BASE}/create-receipient`,
//       {
//         email:          user.email,
//         account_number,
//         bank_code,
//         name:           account_name || '',
//       },
//       { headers: walletHeaders() }
//     );

//     const recipientCode =
//       recRes.data?.data?.recipient_code ||
//       recRes.data?.recipient_code;

//     if (!recipientCode) {
//       return res.status(400).json({ success: false, message: 'Could not create transfer recipient' });
//     }

//     // 2. Execute transfer (amount in kobo)
//     const transferRes = await axios.post(
//       `${WALLET_BASE}/transfer`,
//       {
//         email:     user.email,
//         amount:    Number(amount) * 100,
//         recipient: recipientCode,
//         reason:    narration || 'Transfer',
//         reference: ref,
//       },
//       { headers: walletHeaders() }
//     );

//     const transferData = transferRes.data?.data || transferRes.data;

//     // 3. Save to local DB
//     const tx = await WalletTransaction.create({
//       user:      userId,
//       type:      'transfer',
//       direction: 'debit',
//       amount:    Number(amount),
//       recipient: {
//         accountNumber: account_number,
//         accountName:   account_name || transferData?.recipient?.details?.account_name || '',
//         bankCode:      bank_code,
//       },
//       narration:         narration || 'Transfer',
//       reference:         ref,
//       externalReference: transferData?.reference || '',
//       transferCode:      transferData?.transfer_code || '',
//       status:            'success',
//       apiSnapshot:       transferData,
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Transfer successful',
//       data:    { transaction: tx, transfer: transferData },
//     });

//   } catch (err) {
//     console.error('transferFunds error:', err.response?.data || err.message);

//     // Still save a failed record
//     await WalletTransaction.create({
//       user:      req.user._id,
//       type:      'transfer',
//       direction: 'debit',
//       amount:    Number(req.body.amount || 0),
//       recipient: {
//         accountNumber: req.body.account_number,
//         accountName:   req.body.account_name || '',
//         bankCode:      req.body.bank_code,
//       },
//       narration:  req.body.narration || 'Transfer',
//       status:     'failed',
//       failReason: err.response?.data?.message || err.message,
//     }).catch(() => {});

//     return res.status(500).json({
//       success: false,
//       message: err.response?.data?.message || 'Transfer failed',
//     });
//   }
// };

// // =====================================================================
// // POST /api/wallet/withdraw
// // Withdraw to user's own registered bank account
// // =====================================================================
// export const withdrawFunds = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user   = await User.findById(userId).lean();

//     if (!user?.email) {
//       return res.status(400).json({ success: false, message: 'User email not found' });
//     }

//     if (!user.walletAccount?.accountNumber) {
//       return res.status(400).json({ success: false, message: 'No bank account linked to your wallet' });
//     }

//     const { amount, narration } = req.body;
//     if (!amount) {
//       return res.status(400).json({ success: false, message: 'Amount is required' });
//     }

//     const ref = `WDR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

//     // 1. Create recipient using user's own wallet bank account
//     const recRes = await axios.post(
//       `${WALLET_BASE}/create-receipient`,
//       {
//         email:          user.email,
//         account_number: user.walletAccount.accountNumber,
//         bank_code:      user.walletAccount.bankCode || '',
//         name:           `${user.firstName} ${user.lastName}`,
//       },
//       { headers: walletHeaders() }
//     );

//     const recipientCode =
//       recRes.data?.data?.recipient_code ||
//       recRes.data?.recipient_code;

//     if (!recipientCode) {
//       return res.status(400).json({ success: false, message: 'Could not create withdrawal recipient' });
//     }

//     // 2. Execute transfer
//     const transferRes = await axios.post(
//       `${WALLET_BASE}/transfer`,
//       {
//         email:     user.email,
//         amount:    Number(amount) * 100,
//         recipient: recipientCode,
//         reason:    narration || 'Withdrawal',
//         reference: ref,
//       },
//       { headers: walletHeaders() }
//     );

//     const transferData = transferRes.data?.data || transferRes.data;

//     // 3. Save to local DB
//     const tx = await WalletTransaction.create({
//       user:      userId,
//       type:      'withdrawal',
//       direction: 'debit',
//       amount:    Number(amount),
//       recipient: {
//         accountNumber: user.walletAccount.accountNumber,
//         accountName:   `${user.firstName} ${user.lastName}`,
//         bankName:      user.walletAccount.bankName || 'Wema Bank',
//       },
//       narration:         narration || 'Withdrawal',
//       reference:         ref,
//       externalReference: transferData?.reference || '',
//       transferCode:      transferData?.transfer_code || '',
//       status:            'success',
//       apiSnapshot:       transferData,
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Withdrawal successful',
//       data:    { transaction: tx },
//     });

//   } catch (err) {
//     console.error('withdrawFunds error:', err.response?.data || err.message);

//     await WalletTransaction.create({
//       user:      req.user._id,
//       type:      'withdrawal',
//       direction: 'debit',
//       amount:    Number(req.body.amount || 0),
//       status:    'failed',
//       failReason: err.response?.data?.message || err.message,
//     }).catch(() => {});

//     return res.status(500).json({
//       success: false,
//       message: err.response?.data?.message || 'Withdrawal failed',
//     });
//   }
// };

// // =====================================================================
// // POST /api/wallet/external-history
// // Fetch transfer history from external wallet API
// // =====================================================================
// export const getExternalHistory = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).lean();
//     if (!user?.email) {
//       return res.status(400).json({ success: false, message: 'User email not found' });
//     }

//     const response = await axios.post(
//       `${WALLET_BASE}/transfer-history`,
//       { email: user.email },
//       { headers: walletHeaders() }
//     );

//     return res.status(200).json({
//       success: true,
//       data:    response.data?.data || response.data,
//     });
//   } catch (err) {
//     console.error('getExternalHistory error:', err.response?.data || err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.response?.data?.message || 'Failed to fetch history',
//     });
//   }
// };














import User from '../models/user.js';
import WalletTransaction from '../models/walletTransaction.js';
import axios from 'axios';

const WALLET_BASE = 'https://api-ewallet.eroot.ng/api';

// =====================================================================
// HELPERS
// =====================================================================

// ─── Generate fallback email for users with no email ─────────────
export const generateFallbackEmail = (userId, username) => {
  const rand = Math.random().toString(36).slice(2, 8);
  const slug = (username || userId?.toString()?.slice(-6) || rand)
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${slug}_${rand}@eroot.wallet.ng`;
};

// ─── Resolve the email used during wallet registration ───────────
// Priority: saved walletEmail → user.email → generated fallback
const resolveWalletEmail = (user) =>
  user?.walletAccount?.walletEmail ||
  user?.email ||
  generateFallbackEmail(user?._id, user?.username);

// ─── Build auth headers for external wallet API calls ────────────
// 1. Use saved token if present (fastest)
// 2. Login with walletEmail + password123 to get a fresh token
const walletHeaders = async (user) => {
  // Prefer saved token
  if (user?.walletAccount?.walletToken) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.walletAccount.walletToken}`,
    };
  }

  // Login to get a token
  const email = resolveWalletEmail(user);
  try {
    const res = await axios.post(
      `${WALLET_BASE}/login`,
      { email, password: 'password123' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const token =
      res.data?.token ||
      res.data?.access_token ||
      res.data?.data?.token ||
      res.data?.data?.access_token;

    if (!token) throw new Error('Login returned no token');

    // Persist fresh token back to DB so next call is instant
    await User.findByIdAndUpdate(user._id, {
      'walletAccount.walletToken': token,
    });

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (loginErr) {
    console.error('walletHeaders login failed:', loginErr.response?.data || loginErr.message);
    throw new Error('Could not authenticate with wallet API');
  }
};

// ─── Reference generator ─────────────────────────────────────────
const makeRef = (prefix = 'TXN') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// =====================================================================
// POST /api/wallet/record
// Save any wallet transaction to local DB (fallback + audit trail)
// =====================================================================
export const recordTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type, direction, amount, fee,
      recipient, narration, reference,
      externalReference, transferCode,
      status, failReason, apiSnapshot,
      balanceBefore, balanceAfter,
    } = req.body;

    const tx = await WalletTransaction.create({
      user:             userId,
      type,
      direction,
      amount,
      fee:              fee || 0,
      recipient:        recipient || {},
      narration,
      reference,
      externalReference,
      transferCode,
      status:           status || 'success',
      failReason,
      apiSnapshot,
      balanceBefore,
      balanceAfter,
    });

    return res.status(201).json({ success: true, data: tx });
  } catch (err) {
    console.error('recordTransaction error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================================================
// GET /api/wallet/history?page=1&limit=20&type=transfer
// Fetch paginated transaction history from local DB
// =====================================================================
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit  = parseInt(req.query.limit) || 20;
    const page   = parseInt(req.query.page)  || 1;
    const skip   = (page - 1) * limit;
    const type   = req.query.type;

    const filter = { user: userId };
    if (type) filter.type = type;

    const [txns, total] = await Promise.all([
      WalletTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data:    txns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getTransactionHistory error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================================================
// GET /api/wallet/balance
// Fetch live balance from external wallet API
// =====================================================================
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const email = resolveWalletEmail(user);

    const response = await axios.get(
      `${WALLET_BASE}/balance`,
      { email },
      { headers: await walletHeaders(user) }
    );

    return res.status(200).json({
      success: true,
      data:    response.data?.data || response.data,
    });
  } catch (err) {
    console.error('getWalletBalance error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to fetch balance',
    });
  }
};

// =====================================================================
// GET /api/wallet/banks
// Public endpoint — no auth needed
// =====================================================================
export const fetchBanks = async (req, res) => {
  try {
    const response = await axios.get(
      `${WALLET_BASE}/fetch/bank/provider/public`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    return res.status(200).json({
      success: true,
      data:    response.data?.data || response.data,
    });
  } catch (err) {
    console.error('fetchBanks error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to fetch banks',
    });
  }
};

// =====================================================================
// POST /api/wallet/verify-account
// Verify a bank account number before transfer
// =====================================================================
export const verifyAccount = async (req, res) => {
  try {
    const { account_number, bank_code } = req.body;
    if (!account_number || !bank_code) {
      return res.status(400).json({ success: false, message: 'account_number and bank_code are required' });
    }

    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const response = await axios.post(
      `${WALLET_BASE}/verify-account`,
      { account_number, bank_code },
      { headers: await walletHeaders(user) }
    );

    return res.status(200).json({
      success: true,
      data:    response.data?.data || response.data,
    });
  } catch (err) {
    console.error('verifyAccount error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Account verification failed',
    });
  }
};

// =====================================================================
// POST /api/wallet/transfer
// Create recipient → transfer → save to local DB
// =====================================================================
export const transferFunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const user   = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { account_number, bank_code, account_name, amount, narration } = req.body;
    if (!account_number || !bank_code || !amount) {
      return res.status(400).json({ success: false, message: 'account_number, bank_code and amount are required' });
    }

    const email   = resolveWalletEmail(user);
    const headers = await walletHeaders(user);
    const ref     = makeRef('TXN');

    // 1. Create recipient
    const recRes = await axios.post(
      `${WALLET_BASE}/create-receipient`,
      { email, account_number, bank_code, name: account_name || '' },
      { headers }
    );
    const recipientCode =
      recRes.data?.data?.recipient_code ||
      recRes.data?.recipient_code;

    if (!recipientCode) {
      return res.status(400).json({ success: false, message: 'Could not create transfer recipient' });
    }

    // 2. Execute transfer (kobo)
    const transferRes = await axios.post(
      `${WALLET_BASE}/transfer`,
      { email, amount: Number(amount) * 100, recipient: recipientCode, reason: narration || 'Transfer', reference: ref },
      { headers }
    );
    const transferData = transferRes.data?.data || transferRes.data;

    // 3. Save to local DB
    const tx = await WalletTransaction.create({
      user:             userId,
      type:             'transfer',
      direction:        'debit',
      amount:           Number(amount),
      recipient: {
        accountNumber:  account_number,
        accountName:    account_name || transferData?.recipient?.details?.account_name || '',
        bankCode:       bank_code,
      },
      narration:         narration || 'Transfer',
      reference:         ref,
      externalReference: transferData?.reference || '',
      transferCode:      transferData?.transfer_code || '',
      status:            'success',
      apiSnapshot:       transferData,
    });

    return res.status(200).json({
      success: true,
      message: 'Transfer successful',
      data:    { transaction: tx, transfer: transferData },
    });

  } catch (err) {
    console.error('transferFunds error:', err.response?.data || err.message);
    // Save failed record
    await WalletTransaction.create({
      user:      req.user._id,
      type:      'transfer',
      direction: 'debit',
      amount:    Number(req.body.amount || 0),
      recipient: { accountNumber: req.body.account_number, accountName: req.body.account_name || '', bankCode: req.body.bank_code },
      narration: req.body.narration || 'Transfer',
      status:    'failed',
      failReason: err.response?.data?.message || err.message,
    }).catch(() => {});

    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Transfer failed',
    });
  }
};

// =====================================================================
// POST /api/wallet/withdraw
// Withdraw to user's own bank account saved on wallet
// =====================================================================
export const withdrawFunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const user   = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.walletAccount?.accountNumber) {
      return res.status(400).json({ success: false, message: 'No bank account linked to your wallet' });
    }

    const { amount, narration } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

    const email   = resolveWalletEmail(user);
    const headers = await walletHeaders(user);
    const ref     = makeRef('WDR');

    // 1. Create recipient (user's own account)
    const recRes = await axios.post(
      `${WALLET_BASE}/create-receipient`,
      {
        email,
        account_number: user.walletAccount.accountNumber,
        bank_code:      user.walletAccount.bankCode || '',
        name:           `${user.firstName} ${user.lastName}`,
      },
      { headers }
    );
    const recipientCode =
      recRes.data?.data?.recipient_code ||
      recRes.data?.recipient_code;

    if (!recipientCode) {
      return res.status(400).json({ success: false, message: 'Could not create withdrawal recipient' });
    }

    // 2. Execute transfer
    const transferRes = await axios.post(
      `${WALLET_BASE}/transfer`,
      { email, amount: Number(amount) * 100, recipient: recipientCode, reason: narration || 'Withdrawal', reference: ref },
      { headers }
    );
    const transferData = transferRes.data?.data || transferRes.data;

    // 3. Save to local DB
    const tx = await WalletTransaction.create({
      user:             userId,
      type:             'withdrawal',
      direction:        'debit',
      amount:           Number(amount),
      recipient: {
        accountNumber: user.walletAccount.accountNumber,
        accountName:   `${user.firstName} ${user.lastName}`,
        bankName:      user.walletAccount.bankName || 'Wema Bank',
      },
      narration:         narration || 'Withdrawal',
      reference:         ref,
      externalReference: transferData?.reference || '',
      transferCode:      transferData?.transfer_code || '',
      status:            'success',
      apiSnapshot:       transferData,
    });

    return res.status(200).json({ success: true, message: 'Withdrawal successful', data: { transaction: tx } });

  } catch (err) {
    console.error('withdrawFunds error:', err.response?.data || err.message);
    await WalletTransaction.create({
      user:      req.user._id,
      type:      'withdrawal',
      direction: 'debit',
      amount:    Number(req.body.amount || 0),
      status:    'failed',
      failReason: err.response?.data?.message || err.message,
    }).catch(() => {});

    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Withdrawal failed',
    });
  }
};

// =====================================================================
// POST /api/wallet/external-history
// Fetch transfer history from external wallet API, fall back to local DB
// =====================================================================
export const getExternalHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const email = resolveWalletEmail(user);

    const response = await axios.post(
      `${WALLET_BASE}/transfer-history`,
      { email },
      { headers: await walletHeaders(user) }
    );

    return res.status(200).json({
      success: true,
      source:  'api',
      data:    response.data?.data || response.data,
    });
  } catch (err) {
    console.error('getExternalHistory error — falling back to local DB:', err.response?.data || err.message);

    // Fallback: return local DB records
    try {
      const txns = await WalletTransaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      return res.status(200).json({ success: true, source: 'local', data: txns });
    } catch (dbErr) {
      return res.status(500).json({ success: false, message: 'Failed to fetch transaction history' });
    }
  }
};