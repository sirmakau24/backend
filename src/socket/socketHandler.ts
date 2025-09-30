import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';
import Message from '../models/Message';
import Chat from '../models/Chat';

interface SocketUser {
  userId: string;
  socketId: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSocket = (io: Server) => {
  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      (socket as any).userId = decoded.id;
      (socket as any).userEmail = decoded.email;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId}`);

    // Store user's socket connection
    onlineUsers.set(userId, socket.id);

    // Update user's online status
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Emit online users to all clients
    io.emit('user:online', { userId, socketId: socket.id });

    // Join user to their chat rooms
    const userChats = await Chat.find({ participants: userId });
    userChats.forEach((chat) => {
      socket.join(chat._id.toString());
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType, fileUrl, fileName, fileSize } = data;

        // Verify user is participant
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId,
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found or access denied' });
          return;
        }

        // Create message
        const message = await Message.create({
          chatId,
          sender: userId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize,
          readBy: [userId],
        });

        // Update chat's last message
        chat.lastMessage = message._id as any;
        await chat.save();

        // Populate sender info
        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name username avatar'
        );

        // Emit to all users in the chat room
        io.to(chatId).emit('message:new', populatedMessage);
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Error sending message' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', async (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('typing:user', {
        chatId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', async (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('typing:user', {
        chatId,
        userId,
        isTyping: false,
      });
    });

    // Handle message read
    socket.on('message:read', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);
        if (message && !message.readBy.includes(userId as any)) {
          message.readBy.push(userId as any);
          await message.save();

          // Notify sender
          io.to(chatId).emit('message:read', {
            messageId,
            userId,
            chatId,
          });
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Error marking message as read' });
      }
    });

    // Handle message edit
    socket.on('message:edit', async (data) => {
      try {
        const { messageId, content, chatId } = data;

        const message = await Message.findOne({
          _id: messageId,
          sender: userId,
          isDeleted: false,
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        if (message.messageType !== 'text') {
          socket.emit('error', { message: 'Only text messages can be edited' });
          return;
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        const updatedMessage = await Message.findById(messageId).populate(
          'sender',
          'name username avatar'
        );

        io.to(chatId).emit('message:edited', updatedMessage);
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Error editing message' });
      }
    });

    // Handle message delete
    socket.on('message:delete', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findOne({
          _id: messageId,
          sender: userId,
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found or access denied' });
          return;
        }

        message.isDeleted = true;
        message.content = 'This message was deleted';
        await message.save();

        io.to(chatId).emit('message:deleted', { messageId, chatId });
      } catch (error: any) {
        socket.emit('error', { message: error.message || 'Error deleting message' });
      }
    });

    // Handle joining a new chat
    socket.on('chat:join', (chatId: string) => {
      socket.join(chatId);
    });

    // Handle leaving a chat
    socket.on('chat:leave', (chatId: string) => {
      socket.leave(chatId);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Update user's online status and last seen
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Emit offline status to all clients
      io.emit('user:offline', { userId });
    });
  });

  return io;
};
