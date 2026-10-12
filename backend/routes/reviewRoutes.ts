import { Router } from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/provider/:providerId', getProviderReviews);

export default router;
