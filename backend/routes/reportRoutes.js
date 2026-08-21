// routes/reportRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/verifyToken.js';
import { createReport, getReportById, getReports, updateReportStatus } from '../controllers/reportController.js';
import { blacklistUser, unblacklistUser, getPublicBlacklist, getUsersForAdmin } from '../controllers/blacklistController.js';


const router = express.Router();

// Reports
router.post('/reports', verifyToken, createReport);
router.get('/admin/reports', verifyToken, isAdmin, getReports);
router.get('/admin/reports/:id',verifyToken, isAdmin, getReportById);
router.put('/admin/reports/:id', verifyToken, isAdmin, updateReportStatus);

// Blacklist (admin)
router.get('/admin/users', verifyToken, isAdmin, getUsersForAdmin);
router.post('/admin/users/:id/blacklist', verifyToken, isAdmin, blacklistUser);
router.post('/admin/users/:id/unblacklist', verifyToken, isAdmin, unblacklistUser);

// Blacklist (public)
router.get('/blacklist/public', getPublicBlacklist);

export default router;