import { Router } from 'express';
import {
  getProviders,
  getProviderById,
  updateProviderProfile,
  addProviderService,
  updateProviderService,
  deleteProviderService
} from '../controllers/providerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.put('/profile', authenticate, requireRole(['provider']), updateProviderProfile);
router.post('/services', authenticate, requireRole(['provider']), addProviderService);
router.put('/services/:index', authenticate, requireRole(['provider']), updateProviderService);
router.delete('/services/:index', authenticate, requireRole(['provider']), deleteProviderService);

export default router;
