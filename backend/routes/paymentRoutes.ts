import { Router } from 'express';
import { processPayment, getPaymentByBooking } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/process', authenticate, processPayment);
router.get('/booking/:bookingId', authenticate, getPaymentByBooking);

export default router;
