import { Router } from 'express';
import {
  getAnalytics,
  getAllUsers,
  toggleUserActive,
  verifyProvider,
  getAllBookings
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.patch('/providers/:id/verify', verifyProvider);
router.get('/bookings', getAllBookings);

export default router;
