import { Router } from 'express';
import {
  sendMessage,
  getChatMessages,
  editMessage,
  deleteMessage,
  markMessageAsRead,
  markChatMessagesAsRead,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { sendMessageValidation, mongoIdValidation, paginationValidation } from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('file'), sendMessageValidation, sendMessage);
router.get('/chat/:chatId', authenticate, paginationValidation, getChatMessages);
router.put('/:id', authenticate, mongoIdValidation, editMessage);
router.delete('/:id', authenticate, mongoIdValidation, deleteMessage);
router.put('/:id/read', authenticate, mongoIdValidation, markMessageAsRead);
router.put('/chat/:chatId/read', authenticate, markChatMessagesAsRead);

export default router;
