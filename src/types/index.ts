import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IMessage extends Document {
  chatId: string;
  sender: string;
  content: string;
  messageType: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isEdited: boolean;
  isDeleted: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends Document {
  name?: string;
  isGroupChat: boolean;
  participants: string[];
  admin?: string;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface SocketUser {
  userId: string;
  socketId: string;
}

export interface TypingData {
  chatId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface MessageReadData {
  messageId: string;
  chatId: string;
  userId: string;
}
