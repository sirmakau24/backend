import { Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../types';
import { generateToken } from '../utils/jwt';
import { sendError, sendSuccess } from '../utils/errorHandler';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, errors.array()[0].msg);
      return;
    }

    const { name, username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      sendError(res, 400, 'User with this email or username already exists');
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    sendSuccess(res, 201, { user, token }, 'User registered successfully');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error registering user');
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, 400, errors.array()[0].msg);
      return;
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Update online status
    user.isOnline = true;
    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    // Remove password from response
    const userResponse = user.toJSON();

    sendSuccess(res, 200, { user: userResponse, token }, 'Login successful');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error logging in');
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    // Update user status
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    sendSuccess(res, 200, null, 'Logout successful');
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error logging out');
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, user);
  } catch (error: any) {
    sendError(res, 500, error.message || 'Error fetching user data');
  }
};
