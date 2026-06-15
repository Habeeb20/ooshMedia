import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { updateRiderProfile, getRiderProfile } from '../controllers/riderController.js';
const router = express.Router();

router.get('/profile', verifyToken, getRiderProfile);
router.put('/profile', verifyToken, updateRiderProfile);

export default router;