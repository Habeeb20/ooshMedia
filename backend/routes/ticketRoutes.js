import express from 'express';
import { createTicket, getMyTickets, getTicketById } from '../controllers/ticketController.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

router.post('/', verifyToken, createTicket);
router.get('/', verifyToken, getMyTickets);
router.get('/:id', verifyToken, getTicketById);

export default router;

// In your main server file:
// import ticketRoutes from './routes/ticketRoutes.js';
// app.use('/api/tickets', ticketRoutes);