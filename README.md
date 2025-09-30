# Af-Text Backend

A modern, real-time messaging backend built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

## 🚀 Features

- **Authentication**: JWT-based secure authentication system
- **User Management**: Complete user profiles with avatars, online status, and last seen
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Chat Types**: Support for both one-on-one and group conversations
- **Message Features**:
  - Text messages with emoji support
  - File attachments (up to 10MB)
  - Message editing and deletion
  - Read receipts
  - Typing indicators
- **Admin Panel**: User and chat management with statistics
- **Security**: Rate limiting, CORS, input validation, and helmet protection
- **File Uploads**: Support for images, documents, and media files

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/aftext
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ADMIN_EMAILS=admin@example.com
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── userController.ts    # User management
│   │   ├── chatController.ts    # Chat operations
│   │   ├── messageController.ts # Message handling
│   │   └── adminController.ts   # Admin operations
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── validation.ts        # Input validation
│   │   ├── errorMiddleware.ts   # Error handling
│   │   └── upload.ts            # File upload handling
│   ├── models/
│   │   ├── User.ts              # User schema
│   │   ├── Chat.ts              # Chat schema
│   │   └── Message.ts           # Message schema
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth endpoints
│   │   ├── userRoutes.ts        # User endpoints
│   │   ├── chatRoutes.ts        # Chat endpoints
│   │   ├── messageRoutes.ts     # Message endpoints
│   │   └── adminRoutes.ts       # Admin endpoints
│   ├── socket/
│   │   └── socketHandler.ts     # Socket.IO logic
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── utils/
│   │   ├── jwt.ts               # JWT utilities
│   │   └── errorHandler.ts      # Error utilities
│   └── server.ts                # Main server file
├── uploads/                     # File uploads directory
├── .env.example                 # Environment variables template
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/status` - Update online status

### Chats
- `POST /api/chats` - Create new chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:id` - Get chat by ID
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/participants` - Add participant
- `DELETE /api/chats/:id/participants/:userId` - Remove participant

### Messages
- `POST /api/messages` - Send message (with file upload)
- `GET /api/messages/chat/:chatId` - Get chat messages
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/messages/:id/read` - Mark message as read
- `PUT /api/messages/chat/:chatId/read` - Mark all chat messages as read

### Admin
- `GET /api/admin/users` - Get all users (paginated)
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/chats` - Get all chats (paginated)
- `DELETE /api/admin/chats/:id` - Delete chat
- `GET /api/admin/stats` - Get platform statistics

## 🔌 Socket.IO Events

### Client → Server
- `message:send` - Send new message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `message:read` - Mark message as read
- `message:edit` - Edit message
- `message:delete` - Delete message
- `chat:join` - Join chat room
- `chat:leave` - Leave chat room

### Server → Client
- `message:new` - New message received
- `message:edited` - Message was edited
- `message:deleted` - Message was deleted
- `message:read` - Message was read
- `typing:user` - User typing status
- `user:online` - User came online
- `user:offline` - User went offline
- `error` - Error occurred

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Socket.IO connections also require authentication:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

## 📤 File Upload

To send a file with a message:

```javascript
const formData = new FormData();
formData.append('chatId', chatId);
formData.append('messageType', 'file');
formData.append('file', fileObject);

fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Supported file types**: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, MP4, MP3  
**Max file size**: 10MB (configurable)

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Express-validator for all inputs
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **File Upload Validation**: Type and size restrictions

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📊 Admin Setup

To enable admin features, add admin email addresses to the `.env` file:

```env
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

Admin users can:
- View all users and chats
- Delete users and chats
- View platform statistics

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure these are set in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Proper `MONGODB_URI`
- Correct `CORS_ORIGINS`
- Valid `ADMIN_EMAILS`

### Recommended Production Setup

1. Use a process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name aftext-backend
   ```

2. Set up reverse proxy (Nginx)
3. Enable HTTPS/SSL
4. Use MongoDB Atlas or managed MongoDB
5. Set up monitoring and logging

## 🤝 Integration with Frontend

This backend is designed to work with a React + TypeScript frontend. Example connection:

```typescript
// API Client
const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.IO Client
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

socket.on('message:new', (message) => {
  // Handle new message
});
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### Socket.IO Connection Issues
- Check CORS configuration
- Verify JWT token is valid
- Ensure Socket.IO client version matches server

### File Upload Issues
- Check file size limits
- Verify upload directory exists and has write permissions
- Ensure file type is supported

## 📄 License

MIT

## 👨‍💻 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for modern real-time communication
