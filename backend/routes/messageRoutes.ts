import { Router } from 'express';
import { getMessagesByBooking, sendMessage } from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/:bookingId', authenticate, getMessagesByBooking);
router.post('/:bookingId', authenticate, sendMessage);

export default router;
