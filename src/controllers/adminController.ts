import { Response } from 'express';
import User from '../models/User';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../types';
import { sendError, sendSuccess } from '../utils/errorHandler';

// Simple admin check - in production, use proper role-based access control
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

const isAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email);
};

export const getAllUsersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !isAdmin(req.user.email)) {
      sendError(res, 403, 'Access denied. Admin only.');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await User.countDocuments();

    sendSuccess(res, 200, {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching users');
  }
};

export const deleteUserAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !isAdmin(req.user.email)) {
      sendError(res, 403, 'Access denied. Admin only.');
      return;
    }

    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      sendError(res, 400, 'Cannot delete your own account');
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    // Delete user's messages
    await Message.deleteMany({ sender: id });

    // Remove user from all chats
    await Chat.updateMany({ participants: id }, { $pull: { participants: id } });

    // Delete chats where user was the only participant or admin
    await Chat.deleteMany({ participants: { $size: 0 } });

    // Delete the user
    await User.findByIdAndDelete(id);

    sendSuccess(res, 200, null, 'User deleted successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error deleting user');
  }
};

export const getAllChatsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !isAdmin(req.user.email)) {
      sendError(res, 403, 'Access denied. Admin only.');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find()
      .populate('participants', 'name username email')
      .populate('admin', 'name username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments();

    sendSuccess(res, 200, {
      chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching chats');
  }
};

export const deleteChatAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !isAdmin(req.user.email)) {
      sendError(res, 403, 'Access denied. Admin only.');
      return;
    }

    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat) {
      sendError(res, 404, 'Chat not found');
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

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !isAdmin(req.user.email)) {
      sendError(res, 403, 'Access denied. Admin only.');
      return;
    }

    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const totalChats = await Chat.countDocuments();
    const totalMessages = await Message.countDocuments();
    const groupChats = await Chat.countDocuments({ isGroupChat: true });

    sendSuccess(res, 200, {
      totalUsers,
      onlineUsers,
      totalChats,
      totalMessages,
      groupChats,
      oneOnOneChats: totalChats - groupChats,
    });
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching stats');
  }
};
