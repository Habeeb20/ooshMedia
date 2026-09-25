import express from 'express';
import {
  getRentalStats,
  getAllRentalItems,
  getRentalItemById,
  getAllRentalBookings,
  getRentalBookingById,
} from '../controllers/adminRentalController.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

// Mount as: app.use('/api/admin/rentals', adminRentalRoutes)
router.use(verifyToken);

router.get('/stats', getRentalStats);

router.get('/items', getAllRentalItems);
router.get('/items/:itemId', getRentalItemById);

router.get('/bookings', getAllRentalBookings);
router.get('/bookings/:bookingId', getRentalBookingById);

export default router;