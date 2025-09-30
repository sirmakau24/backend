import { Response } from 'express';
import { validationResult } from 'express-validator';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../types';
import { sendError, sendSuccess } from '../utils/errorHandler';

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { participants, isGroupChat, name } = req.body;
    const currentUserId = req.user.id;

    // Add current user to participants if not already included
    const allParticipants = [...new Set([currentUserId, ...participants])];

    // For one-on-one chats, check if chat already exists
    if (!isGroupChat && allParticipants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: allParticipants, $size: 2 },
      }).populate('participants', '-password');

      if (existingChat) {
        sendSuccess(res, 200, existingChat, 'Chat already exists');
        return;
      }
    }

    // Create new chat
    const chatData: any = {
      participants: allParticipants,
      isGroupChat: isGroupChat || false,
    };

    if (isGroupChat) {
      chatData.admin = currentUserId;
      chatData.name = name || 'New Group';
    }

    const chat = await Chat.create(chatData);
    const populatedChat = await Chat.findById(chat._id).populate('participants', '-password');

    sendSuccess(res, 201, populatedChat, 'Chat created successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error creating chat');
  }
};

export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const chats = await Chat.find({
      participants: req.user.id,
    })
      .populate('participants', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name username avatar',
        },
      })
      .sort({ updatedAt: -1 });

    sendSuccess(res, 200, chats);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching chats');
  }
};

export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const chat = await Chat.findOne({
      _id: id,
      participants: req.user.id,
    })
      .populate('participants', '-password')
      .populate('admin', '-password');

    if (!chat) {
      sendError(res, 404, 'Chat not found');
      return;
    }

    sendSuccess(res, 200, chat);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching chat');
  }
};

export const updateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;
    const { name } = req.body;

    const chat = await Chat.findOne({
      _id: id,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found');
      return;
    }

    // Only group admin can update group chat
    if (chat.isGroupChat && chat.admin?.toString() !== req.user.id) {
      sendError(res, 403, 'Only group admin can update chat');
      return;
    }

    if (name) chat.name = name;
    await chat.save();

    const updatedChat = await Chat.findById(id).populate('participants', '-password');

    sendSuccess(res, 200, updatedChat, 'Chat updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating chat');
  }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;

    const chat = await Chat.findOne({
      _id: id,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found');
      return;
    }

    // Only group admin can delete group chat
    if (chat.isGroupChat && chat.admin?.toString() !== req.user.id) {
      sendError(res, 403, 'Only group admin can delete chat');
      return;
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId: id });

    // Delete the chat
    await Chat.findByIdAndDelete(id);

    sendSuccess(res, 200, null, 'Chat deleted successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting chat');
  }
};

export const addParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findOne({
      _id: id,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found');
      return;
    }

    if (!chat.isGroupChat) {
      sendError(res, 400, 'Cannot add participants to one-on-one chat');
      return;
    }

    // Only group admin can add participants
    if (chat.admin?.toString() !== req.user.id) {
      sendError(res, 403, 'Only group admin can add participants');
      return;
    }

    // Check if user is already a participant
    if (chat.participants.includes(userId)) {
      sendError(res, 400, 'User is already a participant');
      return;
    }

    chat.participants.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(id).populate('participants', '-password');

    sendSuccess(res, 200, updatedChat, 'Participant added successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error adding participant');
  }
};

export const removeParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id, userId } = req.params;

    const chat = await Chat.findOne({
      _id: id,
      participants: req.user.id,
    });

    if (!chat) {
      sendError(res, 404, 'Chat not found');
      return;
    }

    if (!chat.isGroupChat) {
      sendError(res, 400, 'Cannot remove participants from one-on-one chat');
      return;
    }

    // Only group admin can remove participants (or users can remove themselves)
    if (chat.admin?.toString() !== req.user.id && userId !== req.user.id) {
      sendError(res, 403, 'Only group admin can remove participants');
      return;
    }

    // Cannot remove admin
    if (userId === chat.admin?.toString()) {
      sendError(res, 400, 'Cannot remove group admin');
      return;
    }

    chat.participants = chat.participants.filter((p) => p.toString() !== userId);
    await chat.save();

    const updatedChat = await Chat.findById(id).populate('participants', '-password');

    sendSuccess(res, 200, updatedChat, 'Participant removed successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error removing participant');
  }
};
