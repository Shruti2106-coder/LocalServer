import { Router } from 'express';
import { getServiceRecommendation } from '../controllers/aiController.js';

const router = Router();

router.post('/recommend', getServiceRecommendation);

export default router;
