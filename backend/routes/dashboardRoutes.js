import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';

import { verifyToken, adminOnly } from '../middleware/verifyToken.js';



const router = express.Router();

// ---- Logged-in user dashboard ----
router.get('/', verifyToken, getDashboardData);


export default router;