import { Router } from 'express';
import {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createComplaint);
router.get('/my', authenticate, getUserComplaints);
router.get('/all', authenticate, requireRole(['admin']), getAllComplaints);
router.patch('/:id', authenticate, requireRole(['admin']), updateComplaintStatus);

export default router;
