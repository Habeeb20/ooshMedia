import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { recordTransaction,  getTransactionHistory,
  getWalletBalance,
  fetchBanks,
  verifyAccount,
  transferFunds,
  withdrawFunds,
  getExternalHistory, } from '../controllers/walletController.js';


const router = express.Router();

// All routes are protected — user must be logged in
router.use(verifyToken);

// ── Local DB ─────────────────────────────────────────────────────
router.post('/record',  recordTransaction);       // POST  /api/wallet/record
router.get('/history',  getTransactionHistory);   // GET   /api/wallet/history?page=1&limit=20&type=transfer

// ── External wallet API proxies ───────────────────────────────────
router.get ('/balance',          getWalletBalance);    // GET   /api/wallet/balance
router.get ('/banks',            fetchBanks);          // GET   /api/wallet/banks
router.post('/verify-account',   verifyAccount);       // POST  /api/wallet/verify-account
router.post('/transfer',         transferFunds);       // POST  /api/wallet/transfer
router.post('/withdraw',         withdrawFunds);       // POST  /api/wallet/withdraw
router.post('/external-history', getExternalHistory);  // POST  /api/wallet/external-history

export default router;