# Af-Text API Documentation

Complete API reference for the Af-Text messaging backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": "",
      "isOnline": false,
      "lastSeen": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Validation Rules:**
- `name`: 2-50 characters
- `username`: 3-30 characters, lowercase, alphanumeric + underscore only
- `email`: Valid email format
- `password`: Minimum 6 characters

---

### Login User

**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { },
    "token": "jwt_token_here"
  }
}
```

---

### Logout User

**POST** `/auth/logout`

Logout current user and update status.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

### Get Current User

**GET** `/auth/me`

Get authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "avatar_url",
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## User Endpoints

### Get All Users

**GET** `/users`

Get list of all users (excludes current user).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (optional): Search by name, username, or email

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": "avatar_url",
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Search Users

**GET** `/users/search`

Search for users by name or username.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q` (required): Search query

**Example:** `/users/search?q=john`

**Response:** `200 OK`

---

### Get User by ID

**GET** `/users/:id`

Get specific user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Update Profile

**PUT** `/users/profile`

Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "username": "johnupdated",
  "avatar": "new_avatar_url"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { }
}
```

---

### Update Online Status

**PUT** `/users/status`

Update user's online status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isOnline": true
}
```

**Response:** `200 OK`

---

## Chat Endpoints

### Create Chat

**POST** `/chats`

Create a new chat (one-on-one or group).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "isGroupChat": false,
  "name": "Group Name"
}
```

**Notes:**
- For one-on-one chats, returns existing chat if already exists
- `name` is required for group chats
- `isGroupChat` defaults to false

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "_id": "chat_id",
    "name": "Group Name",
    "isGroupChat": false,
    "participants": [ ],
    "admin": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get User's Chats

**GET** `/chats`

Get all chats for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "chat_id",
      "name": "Chat Name",
      "isGroupChat": false,
      "participants": [ ],
      "lastMessage": {
        "_id": "message_id",
        "content": "Last message text",
        "sender": { },
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Chat by ID

**GET** `/chats/:id`

Get specific chat details.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Update Chat

**PUT** `/chats/:id`

Update chat details (group admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Group Name"
}
```

**Response:** `200 OK`

---

### Delete Chat

**DELETE** `/chats/:id`

Delete chat and all messages (group admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Chat deleted successfully",
  "data": null
}
```

---

### Add Participant

**POST** `/chats/:id/participants`

Add user to group chat (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "user_id_to_add"
}
```

**Response:** `200 OK`

---

### Remove Participant

**DELETE** `/chats/:id/participants/:userId`

Remove user from group chat (admin only or self).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Message Endpoints

### Send Message

**POST** `/messages`

Send a new message (text or file).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data` (for file uploads)

**Request Body (Text Message):**
```json
{
  "chatId": "chat_id",
  "content": "Hello, world!",
  "messageType": "text"
}
```

**Request Body (File Upload):**
```
FormData:
- chatId: "chat_id"
- messageType: "file"
- file: <file_object>
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "chatId": "chat_id",
    "sender": {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "avatar": "avatar_url"
    },
    "content": "Hello, world!",
    "messageType": "text",
    "isEdited": false,
    "isDeleted": false,
    "readBy": ["user_id"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Chat Messages

**GET** `/messages/chat/:chatId`

Get messages for a specific chat.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [ ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "pages": 2
    }
  }
}
```

---

### Edit Message

**PUT** `/messages/:id`

Edit a text message (sender only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message edited successfully",
  "data": { }
}
```

---

### Delete Message

**DELETE** `/messages/:id`

Delete a message (sender only).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": null
}
```

---

### Mark Message as Read

**PUT** `/messages/:id/read`

Mark a specific message as read.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Mark All Chat Messages as Read

**PUT** `/messages/chat/:chatId/read`

Mark all messages in a chat as read.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Admin Endpoints

**Note:** All admin endpoints require the user's email to be in the `ADMIN_EMAILS` environment variable.

### Get All Users (Admin)

**GET** `/admin/users`

Get paginated list of all users.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Users per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

### Delete User (Admin)

**DELETE** `/admin/users/:id`

Delete a user and all associated data.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Get All Chats (Admin)

**GET** `/admin/chats`

Get paginated list of all chats.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Chats per page

**Response:** `200 OK`

---

### Delete Chat (Admin)

**DELETE** `/admin/chats/:id`

Delete a chat and all messages.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Get Platform Statistics

**GET** `/admin/stats`

Get platform statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "onlineUsers": 25,
    "totalChats": 300,
    "totalMessages": 5000,
    "groupChats": 50,
    "oneOnOneChats": 250
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "No token provided. Authorization denied."
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Access denied. Admin only."
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Window:** 15 minutes (configurable)
- **Max Requests:** 100 per window (configurable)

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## File Upload Specifications

**Supported File Types:**
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, TXT, ZIP
- Media: MP4, MP3

**Maximum File Size:** 10MB (configurable via `MAX_FILE_SIZE` env variable)

**Upload Endpoint:** `/api/messages` with `multipart/form-data`

**File Access:** Uploaded files are accessible at `/uploads/<filename>`

---

## Pagination

Endpoints that support pagination use the following query parameters:

- `page`: Page number (starts at 1)
- `limit`: Items per page (max 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Best Practices

1. **Always include the Authorization header** for protected endpoints
2. **Handle token expiration** - Refresh or re-authenticate when receiving 401 errors
3. **Use pagination** for large data sets
4. **Validate input** on the client side before sending requests
5. **Handle file uploads** properly with multipart/form-data
6. **Implement retry logic** for failed requests
7. **Store tokens securely** - Never expose JWT tokens in URLs or logs

---

## Socket.IO Events Documentation

See [Socket.IO Events](#socketio-events) section in the main README for real-time event documentation.
