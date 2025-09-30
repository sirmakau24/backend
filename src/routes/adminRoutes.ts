import { Router } from 'express';
import {
  getAllUsersAdmin,
  deleteUserAdmin,
  getAllChatsAdmin,
  deleteChatAdmin,
  getStats,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { mongoIdValidation, paginationValidation } from '../middleware/validation';

const router = Router();

router.get('/users', authenticate, paginationValidation, getAllUsersAdmin);
router.delete('/users/:id', authenticate, mongoIdValidation, deleteUserAdmin);
router.get('/chats', authenticate, paginationValidation, getAllChatsAdmin);
router.delete('/chats/:id', authenticate, mongoIdValidation, deleteChatAdmin);
router.get('/stats', authenticate, getStats);

export default router;
