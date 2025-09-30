# Socket.IO Events Documentation

Complete reference for real-time Socket.IO events in Af-Text.

## Connection

### Establishing Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Authentication

Socket connections require a valid JWT token passed in the `auth` object during connection.

**Error Response:**
```javascript
socket.on('connect_error', (error) => {
  // error.message: "Authentication error: No token provided"
  // or "Authentication error: Invalid token"
});
```

---

## Client → Server Events

### message:send

Send a new message to a chat.

**Emit:**
```javascript
socket.emit('message:send', {
  chatId: 'chat_id',
  content: 'Hello, world!',
  messageType: 'text', // 'text' | 'file' | 'image'
  fileUrl: '/uploads/file.jpg', // Optional, for file messages
  fileName: 'file.jpg', // Optional
  fileSize: 12345 // Optional, in bytes
});
```

**Response Events:**
- `message:new` - Broadcast to all chat participants
- `error` - If message sending fails

---

### typing:start

Notify other users that you're typing.

**Emit:**
```javascript
socket.emit('typing:start', {
  chatId: 'chat_id'
});
```

**Response Event:**
- `typing:user` - Broadcast to other chat participants

---

### typing:stop

Notify that you stopped typing.

**Emit:**
```javascript
socket.emit('typing:stop', {
  chatId: 'chat_id'
});
```

**Response Event:**
- `typing:user` - Broadcast to other chat participants

---

### message:read

Mark a message as read.

**Emit:**
```javascript
socket.emit('message:read', {
  messageId: 'message_id',
  chatId: 'chat_id'
});
```

**Response Event:**
- `message:read` - Broadcast to all chat participants

---

### message:edit

Edit an existing message.

**Emit:**
```javascript
socket.emit('message:edit', {
  messageId: 'message_id',
  content: 'Updated message content',
  chatId: 'chat_id'
});
```

**Response Events:**
- `message:edited` - Broadcast to all chat participants
- `error` - If edit fails

**Notes:**
- Only text messages can be edited
- Only the message sender can edit
- Message must not be deleted

---

### message:delete

Delete a message.

**Emit:**
```javascript
socket.emit('message:delete', {
  messageId: 'message_id',
  chatId: 'chat_id'
});
```

**Response Events:**
- `message:deleted` - Broadcast to all chat participants
- `error` - If deletion fails

**Notes:**
- Only the message sender can delete
- Message content becomes "This message was deleted"

---

### chat:join

Join a chat room to receive messages.

**Emit:**
```javascript
socket.emit('chat:join', 'chat_id');
```

**Notes:**
- Automatically joined to all user's chats on connection
- Use this when joining a new chat

---

### chat:leave

Leave a chat room.

**Emit:**
```javascript
socket.emit('chat:leave', 'chat_id');
```

---

## Server → Client Events

### message:new

Receive a new message in a chat.

**Listen:**
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

**Data Structure:**
```javascript
{
  _id: 'message_id',
  chatId: 'chat_id',
  sender: {
    _id: 'user_id',
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'avatar_url'
  },
  content: 'Hello, world!',
  messageType: 'text',
  fileUrl: null,
  fileName: null,
  fileSize: null,
  isEdited: false,
  isDeleted: false,
  readBy: ['user_id'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}
```

---

### message:edited

Receive notification that a message was edited.

**Listen:**
```javascript
socket.on('message:edited', (message) => {
  console.log('Message edited:', message);
});
```

**Data Structure:** Same as `message:new` with `isEdited: true`

---

### message:deleted

Receive notification that a message was deleted.

**Listen:**
```javascript
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data);
});
```

**Data Structure:**
```javascript
{
  messageId: 'message_id',
  chatId: 'chat_id'
}
```

---

### message:read

Receive notification that a message was read.

**Listen:**
```javascript
socket.on('message:read', (data) => {
  console.log('Message read:', data);
});
```

**Data Structure:**
```javascript
{
  messageId: 'message_id',
  chatId: 'chat_id',
  userId: 'user_id_who_read'
}
```

---

### typing:user

Receive typing status updates.

**Listen:**
```javascript
socket.on('typing:user', (data) => {
  console.log('User typing:', data);
});
```

**Data Structure:**
```javascript
{
  chatId: 'chat_id',
  userId: 'user_id',
  isTyping: true // or false
}
```

**Usage Example:**
```javascript
const typingUsers = new Map();

socket.on('typing:user', ({ chatId, userId, isTyping }) => {
  if (isTyping) {
    typingUsers.set(userId, true);
  } else {
    typingUsers.delete(userId);
  }
  
  // Update UI to show typing indicator
  updateTypingIndicator(chatId, typingUsers.size > 0);
});
```

---

### user:online

Receive notification when a user comes online.

**Listen:**
```javascript
socket.on('user:online', (data) => {
  console.log('User online:', data);
});
```

**Data Structure:**
```javascript
{
  userId: 'user_id',
  socketId: 'socket_id'
}
```

---

### user:offline

Receive notification when a user goes offline.

**Listen:**
```javascript
socket.on('user:offline', (data) => {
  console.log('User offline:', data);
});
```

**Data Structure:**
```javascript
{
  userId: 'user_id'
}
```

---

### error

Receive error notifications.

**Listen:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

**Data Structure:**
```javascript
{
  message: 'Error description'
}
```

---

## Complete Client Example

```javascript
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.setupListeners();
  }

  setupListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    // Message events
    this.socket.on('message:new', (message) => {
      this.handleNewMessage(message);
    });

    this.socket.on('message:edited', (message) => {
      this.handleEditedMessage(message);
    });

    this.socket.on('message:deleted', (data) => {
      this.handleDeletedMessage(data);
    });

    this.socket.on('message:read', (data) => {
      this.handleMessageRead(data);
    });

    // Typing events
    this.socket.on('typing:user', (data) => {
      this.handleTyping(data);
    });

    // User status events
    this.socket.on('user:online', (data) => {
      this.handleUserOnline(data);
    });

    this.socket.on('user:offline', (data) => {
      this.handleUserOffline(data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Send message
  sendMessage(chatId, content, messageType = 'text') {
    this.socket.emit('message:send', {
      chatId,
      content,
      messageType
    });
  }

  // Typing indicators
  startTyping(chatId) {
    this.socket.emit('typing:start', { chatId });
  }

  stopTyping(chatId) {
    this.socket.emit('typing:stop', { chatId });
  }

  // Mark as read
  markAsRead(messageId, chatId) {
    this.socket.emit('message:read', { messageId, chatId });
  }

  // Edit message
  editMessage(messageId, content, chatId) {
    this.socket.emit('message:edit', {
      messageId,
      content,
      chatId
    });
  }

  // Delete message
  deleteMessage(messageId, chatId) {
    this.socket.emit('message:delete', {
      messageId,
      chatId
    });
  }

  // Join/leave chat
  joinChat(chatId) {
    this.socket.emit('chat:join', chatId);
  }

  leaveChat(chatId) {
    this.socket.emit('chat:leave', chatId);
  }

  // Event handlers (implement based on your UI framework)
  handleNewMessage(message) {
    // Update UI with new message
  }

  handleEditedMessage(message) {
    // Update message in UI
  }

  handleDeletedMessage(data) {
    // Mark message as deleted in UI
  }

  handleMessageRead(data) {
    // Update read status in UI
  }

  handleTyping(data) {
    // Show/hide typing indicator
  }

  handleUserOnline(data) {
    // Update user status in UI
  }

  handleUserOffline(data) {
    // Update user status in UI
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
```

---

## React Integration Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, isConnected };
};

// Usage in component
function ChatComponent() {
  const { socket, isConnected } = useSocket(authToken);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message:new', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('message:new');
    };
  }, [socket]);

  const sendMessage = (content: string) => {
    socket?.emit('message:send', {
      chatId: currentChatId,
      content,
      messageType: 'text'
    });
  };

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {/* Chat UI */}
    </div>
  );
}
```

---

## Best Practices

1. **Always handle connection errors** - Implement reconnection logic
2. **Clean up listeners** - Remove event listeners when components unmount
3. **Debounce typing events** - Don't emit typing events on every keystroke
4. **Handle offline scenarios** - Queue messages when disconnected
5. **Validate data** - Always validate incoming socket data
6. **Use acknowledgments** - For critical operations, use socket acknowledgments
7. **Implement timeouts** - Don't wait indefinitely for responses
8. **Secure your connection** - Always use authentication tokens
9. **Handle errors gracefully** - Display user-friendly error messages
10. **Test edge cases** - Test reconnection, network failures, etc.

---

## Troubleshooting

### Connection Issues

**Problem:** Socket won't connect  
**Solutions:**
- Verify JWT token is valid
- Check CORS configuration
- Ensure server is running
- Check network connectivity

### Messages Not Received

**Problem:** Not receiving real-time messages  
**Solutions:**
- Verify you've joined the chat room
- Check if socket is connected
- Ensure event listeners are set up
- Check for JavaScript errors

### Typing Indicators Not Working

**Problem:** Typing indicators not showing  
**Solutions:**
- Implement debouncing (wait 300-500ms after last keystroke)
- Ensure you're emitting to correct chatId
- Check if other users are in the same chat room

---

## Performance Tips

1. **Limit typing event frequency** - Use debouncing
2. **Batch read receipts** - Mark multiple messages as read at once
3. **Optimize listeners** - Remove unnecessary listeners
4. **Use rooms efficiently** - Join only active chats
5. **Handle large message lists** - Implement pagination
6. **Compress data** - Use Socket.IO compression for large payloads

---

For more information, see the main [README.md](README.md) and [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
