import express from 'express';
import { sendOTP, verifyOtp, signup, login, forgotPassword, resetPassword, getDashboard, updateBusinessProfile, createWallet, getWalletStatus, requestEAuthOtp, verifyEAuthOtp } from '../controllers/userController.js';
import {verifyToken} from "../middleware/verifyToken.js"
import {upload} from "../middleware/multer.js"
const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get("/", verifyToken, getDashboard);
router.get("/dashboard", verifyToken, getDashboard);
router.put(
  '/profile',
  verifyToken,
  upload.array('gallery', 20),     // Max 10 files, field name = "gallery"
  updateBusinessProfile
);
router.post('/create', verifyToken, createWallet);
router.get('/status', verifyToken, getWalletStatus);

router.post('/e-auth/request', requestEAuthOtp);
router.post('/e-auth/verify', verifyEAuthOtp);
export default router;