import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateOnlineStatus,
  searchUsers,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { updateProfileValidation, mongoIdValidation } from '../middleware/validation';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.get('/search', authenticate, searchUsers);
router.get('/:id', authenticate, mongoIdValidation, getUserById);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/status', authenticate, updateOnlineStatus);

export default router;
