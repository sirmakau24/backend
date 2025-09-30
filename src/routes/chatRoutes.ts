import { Router } from 'express';
import {
  createChat,
  getUserChats,
  getChatById,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { createChatValidation, mongoIdValidation } from '../middleware/validation';

const router = Router();

router.post('/', authenticate, createChatValidation, createChat);
router.get('/', authenticate, getUserChats);
router.get('/:id', authenticate, mongoIdValidation, getChatById);
router.put('/:id', authenticate, mongoIdValidation, updateChat);
router.delete('/:id', authenticate, mongoIdValidation, deleteChat);
router.post('/:id/participants', authenticate, mongoIdValidation, addParticipant);
router.delete('/:id/participants/:userId', authenticate, removeParticipant);

export default router;
