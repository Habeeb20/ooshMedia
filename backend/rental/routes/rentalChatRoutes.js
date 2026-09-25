import express from 'express';
import { sendMessage, getMessages, getMyConversations } from '../controllers/RentalChatController.js';
import { verifyToken } from '../../middleware/verifyToken.js';

const router = express.Router();

// Mount this alongside your other rental routers, e.g.:
//   app.use('/api/rentals', rentalChatRoutes);

router.get('/conversations', verifyToken, getMyConversations);
router.get('/bookings/:bookingId/messages', verifyToken, getMessages);
router.post('/bookings/:bookingId/messages', verifyToken, sendMessage);

export default router;