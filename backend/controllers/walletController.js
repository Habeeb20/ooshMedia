
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
import WalletTransaction from '../models/WalletTransaction.js';
import axios from 'axios';

const WALLET_BASE = 'https://api-ewallet.eroot.ng/api';
const WALLET_PASSWORD = 'password123'; // fixed password used during wallet /register

// ─── Login to wallet API and get a bearer token ───────────────────
// The external API uses email+password auth. We call /login before
// each operation to get a fresh token, then pass it as Authorization.
const getWalletToken = async (email) => {
  const res = await axios.post(
    `${WALLET_BASE}/login`,
    { email, password: WALLET_PASSWORD },
    console.log(email),
    console.log(WALLET_PASSWORD),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const token =
    res.data?.token ||
    res.data?.access_token ||
    res.data?.data?.token ||
    res.data?.data?.access_token;
  if (!token) throw new Error('Could not obtain wallet API token');
  return token;
};

// ─── Build authenticated headers for any wallet API call ─────────
const walletHeaders = async (email) => {
  const token = await getWalletToken(email);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// =====================================================================
// POST /api/wallet/record
// Save a transaction to local DB (called after every wallet operation)
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
      user: userId,
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
// GET /api/wallet/history
// Fetch paginated transaction history from local DB
// =====================================================================
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit  = parseInt(req.query.limit)  || 20;
    const page   = parseInt(req.query.page)   || 1;
    const skip   = (page - 1) * limit;
    const type   = req.query.type; // optional filter

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
    if (!user?.email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    const response = await axios.get(
      `${WALLET_BASE}/balance`,
      { email: user.email },
      { headers: await walletHeaders(user.email) }
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
// Fetch list of supported banks from external wallet API
// =====================================================================
export const fetchBanks = async (req, res) => {
  try {
    // Banks list is a public endpoint - no auth needed
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
    if (!user?.email) return res.status(400).json({ success: false, message: 'User email not found' });

    const response = await axios.post(
      `${WALLET_BASE}/verify-account`,
      { account_number, bank_code },
      { headers: await walletHeaders(user.email) }
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
// Create recipient + execute transfer + save to local DB
// =====================================================================
export const transferFunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const user   = await User.findById(userId).lean();

    if (!user?.email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    const {
      account_number, bank_code, account_name,
      amount, narration,
    } = req.body;

    if (!account_number || !bank_code || !amount) {
      return res.status(400).json({
        success: false,
        message: 'account_number, bank_code and amount are required',
      });
    }

    const ref = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // 1. Create recipient
    const recRes = await axios.post(
      `${WALLET_BASE}/create-receipient`,
      {
        email:          user.email,
        account_number,
        bank_code,
        name:           account_name || '',
      },
      { headers: await walletHeaders(user.email) }
    );

    const recipientCode =
      recRes.data?.data?.recipient_code ||
      recRes.data?.recipient_code;

    if (!recipientCode) {
      return res.status(400).json({ success: false, message: 'Could not create transfer recipient' });
    }

    // 2. Execute transfer (amount in kobo)
    const transferRes = await axios.post(
      `${WALLET_BASE}/transfer`,
      {
        email:     user.email,
        amount:    Number(amount) * 100,
        recipient: recipientCode,
        reason:    narration || 'Transfer',
        reference: ref,
      },
      { headers: await walletHeaders(user.email) }
    );

    const transferData = transferRes.data?.data || transferRes.data;

    // 3. Save to local DB
    const tx = await WalletTransaction.create({
      user:      userId,
      type:      'transfer',
      direction: 'debit',
      amount:    Number(amount),
      recipient: {
        accountNumber: account_number,
        accountName:   account_name || transferData?.recipient?.details?.account_name || '',
        bankCode:      bank_code,
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

    // Still save a failed record
    await WalletTransaction.create({
      user:      req.user._id,
      type:      'transfer',
      direction: 'debit',
      amount:    Number(req.body.amount || 0),
      recipient: {
        accountNumber: req.body.account_number,
        accountName:   req.body.account_name || '',
        bankCode:      req.body.bank_code,
      },
      narration:  req.body.narration || 'Transfer',
      status:     'failed',
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
// Withdraw to user's own registered bank account
// =====================================================================
export const withdrawFunds = async (req, res) => {
  try {
    const userId = req.user._id;
    const user   = await User.findById(userId).lean();

    if (!user?.email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    if (!user.walletAccount?.accountNumber) {
      return res.status(400).json({ success: false, message: 'No bank account linked to your wallet' });
    }

    const { amount, narration } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const ref = `WDR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // 1. Create recipient using user's own wallet bank account
    const recRes = await axios.post(
      `${WALLET_BASE}/create-receipient`,
      {
        email:          user.email,
        account_number: user.walletAccount.accountNumber,
        bank_code:      user.walletAccount.bankCode || '',
        name:           `${user.firstName} ${user.lastName}`,
      },
      { headers: await walletHeaders(user.email) }
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
      {
        email:     user.email,
        amount:    Number(amount) * 100,
        recipient: recipientCode,
        reason:    narration || 'Withdrawal',
        reference: ref,
      },
      { headers: await walletHeaders(user.email) }
    );

    const transferData = transferRes.data?.data || transferRes.data;

    // 3. Save to local DB
    const tx = await WalletTransaction.create({
      user:      userId,
      type:      'withdrawal',
      direction: 'debit',
      amount:    Number(amount),
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

    return res.status(200).json({
      success: true,
      message: 'Withdrawal successful',
      data:    { transaction: tx },
    });

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
// Fetch transfer history from external wallet API
// =====================================================================
export const getExternalHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user?.email) {
      return res.status(400).json({ success: false, message: 'User email not found' });
    }

    const response = await axios.post(
      `${WALLET_BASE}/transfer-history`,
      { email: user.email },
      { headers: await walletHeaders(user.email) }
    );

    return res.status(200).json({
      success: true,
      data:    response.data?.data || response.data,
    });
  } catch (err) {
    console.error('getExternalHistory error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to fetch history',
    });
  }
};