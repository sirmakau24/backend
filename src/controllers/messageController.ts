import { Response } from 'express';
import { validationResult } from 'express-validator';
import Message from '../models/Message';
import Chat from '../models/Chat';
import { AuthRequest } from '../types';
import { sendError, sendSuccess } from '../utils/errorHandler';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, errors.array()[0].msg);
      return;
    }

    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { chatId, content, messageType } = req.body;
    const file = req.file;

    // Verify chat exists and user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found or you are not a participant');
      return;
    }

    // Create message data
    const messageData: any = {
      chatId,
      sender: req.user.id,
      messageType: messageType || 'text',
      readBy: [req.user.id],
    };

    if (messageType === 'text' || !messageType) {
      if (!content) {
        sendError(res, 400, 'Message content is required');
        return;
      }
      messageData.content = content;
    }

    if (file) {
      messageData.fileUrl = `/uploads/${file.filename}`;
      messageData.fileName = file.originalname;
      messageData.fileSize = file.size;
      messageData.messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';
    }

    // Create message
    const message = await Message.create(messageData);

    // Update chat's last message
    chat.lastMessage = message._id as any;
    await chat.save();

    // Populate sender info
    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name username avatar'
    );

    sendSuccess(res, 201, populatedMessage, 'Message sent successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error sending message');
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found or you are not a participant');
      return;
    }

    // Get messages
    const messages = await Message.find({
      chatId,
      isDeleted: false,
    })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chatId, isDeleted: false });

    sendSuccess(res, 200, {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching messages');
  }
};

export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      sendError(res, 400, 'Message content is required');
      return;
    }

    const message = await Message.findOne({
      _id: id,
      sender: req.user.id,
      isDeleted: false,
    });

    if (!message) {
      sendError(res, 404, 'Message not found or you are not the sender');
      return;
    }

    if (message.messageType !== 'text') {
      sendError(res, 400, 'Only text messages can be edited');
      return;
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(id).populate('sender', 'name username avatar');

    sendSuccess(res, 200, updatedMessage, 'Message edited successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error editing message');
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const message = await Message.findOne({
      _id: id,
      sender: req.user.id,
    });

    if (!message) {
      sendError(res, 404, 'Message not found or you are not the sender');
      return;
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    await message.save();

    sendSuccess(res, 200, null, 'Message deleted successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting message');
  }
};

export const markMessageAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      sendError(res, 404, 'Message not found');
      return;
    }

    // Verify user is participant of the chat
    const chat = await Chat.findOne({
      _id: message.chatId,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 403, 'You are not a participant of this chat');
      return;
    }

    // Add user to readBy if not already there
    if (!message.readBy.includes(req.user.id as any)) {
      message.readBy.push(req.user.id as any);
      await message.save();
    }

    sendSuccess(res, 200, message, 'Message marked as read');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error marking message as read');
  }
};

export const markChatMessagesAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { chatId } = req.params;

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found or you are not a participant');
      return;
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id },
      },
      {
        $addToSet: { readBy: req.user.id },
      }
    );

    sendSuccess(res, 200, null, 'All messages marked as read');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error marking messages as read');
  }
};
