import mongoose, { Schema } from 'mongoose';
import { IChat } from '../types';

const chatSchema = new Schema<IChat>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Chat name cannot exceed 100 characters'],
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

// Validate participants
chatSchema.pre('save', function (next) {
  if (this.participants.length < 2) {
    return next(new Error('A chat must have at least 2 participants'));
  }

  if (this.isGroupChat && this.participants.length < 3) {
    return next(new Error('A group chat must have at least 3 participants'));
  }

  if (this.isGroupChat && !this.admin) {
    return next(new Error('A group chat must have an admin'));
  }

  next();
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

export default mongoose.model<IChat>('Chat', chatSchema);
