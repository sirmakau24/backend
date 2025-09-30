import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../types';
import { sendError, sendSuccess } from '../utils/errorHandler';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const currentUserId = req.user?.id;

    let query: any = { _id: { $ne: currentUserId } };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').limit(50);

    sendSuccess(res, 200, users);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching users');
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, user);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching user');
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { name, username, avatar } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        sendError(res, 400, 'Username already taken');
        return;
      }
      updateData.username = username;
    }
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, user, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating profile');
  }
};

export const updateOnlineStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { isOnline } = req.body;

    const updateData: any = { isOnline };
    if (!isOnline) {
      updateData.lastSeen = new Date();
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, user, 'Status updated successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error updating status');
  }
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?.id;

    if (!q || typeof q !== 'string') {
      sendError(res, 400, 'Search query is required');
      return;
    }

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(20);

    sendSuccess(res, 200, users);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error searching users');
  }
};
