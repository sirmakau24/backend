# Af-Text

**Af-Text** — an Africa-first, privacy-minded, open-source chat application (React + Node.js + Socket.IO + MongoDB). This README is a ready-to-paste starter for the Af-Text repo and contains setup, file structure, running instructions, security notes, common pitfalls, and contribution guidelines.

---

## Table of contents

- [Manifesto](#manifesto)
- [Features](#features)
- [Tech stack](#tech-stack)
- [File tree](#file-tree)
- [Quick start (local development)](#quick-start-local-development)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
- [Environment variables](#environment-variables)
- [API examples](#api-examples)
- [Socket.IO events](#socketio-events)
- [E2EE: short note and next steps](#e2ee-short-note-and-next-steps)
- [Security & best practices](#security--best-practices)
- [Common bugs & troubleshooting checklist](#common-bugs--troubleshooting-checklist)
- [Deployment tips](#deployment-tips)
- [Contribution guide](#contribution-guide)
- [License](#license)
- [Contact & community](#contact--community)

---

## Manifesto

How many of us believe it’s time for Africa to rise and claim true independence? Af-Text is our first step: a chat platform built **for Africa, by Africans**, prioritizing privacy, openness, and community ownership. This project is intentionally simple to start, and intentionally built to be forked, self-hosted, and extended.

---

## Features

- Username / email / phone signup (configurable)
- JWT authentication
- Real-time 1:1 messaging (Socket.IO)
- Message persistence (MongoDB)
- Typing indicators & read receipts (MVP hooks)
- Simple image attachments (dev: local; prod: S3/MinIO)
- Admin moderation endpoints (basic)
- Self-hostable, modular, and extensible

---

## Tech stack (recommended)

- Frontend: React (Vite) + plain CSS
- Backend: Node.js + Express
- Real-time: Socket.IO
- Database: MongoDB (Atlas free tier or self-hosted)
- File storage: Local (dev) / MinIO or S3-compatible (prod)
- Dev & infra: Docker, docker-compose, nginx (reverse proxy)

> Prioritize free or low-cost tiers and OSS tooling to keep deployments accessible to communities.

---

## File tree

📂 Af-Text/

```
├─ backend/
│  ├─ src/
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  └─ Message.js
│  │  ├─ routes/
│  │  │  ├─ auth.js
│  │  │  └─ messages.js
│  │  ├─ controllers/
│  │  ├─ utils/
│  │  └─ server.js
│  └─ package.json
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ pages/
│     │  ├─ Login.jsx
│     │  └─ Chat.jsx
│     ├─ components/
│     │  ├─ Header.jsx
│     │  ├─ ChatList.jsx
│     │  ├─ ChatWindow.jsx
│     │  └─ MessageInput.jsx
│     └─ styles/
│        └─ style.css
└─ docker-compose.yml
```

---

## Quick start (local development)

### Prerequisites

- Node.js (16+ recommended)
- npm or yarn
- MongoDB (local or Atlas) — for quick start use local Docker or a local install
- Optional: Docker & docker-compose (for single-command local infra)


### Backend setup

```bash
cd backend
npm install
# create .env (see "Environment variables" below)
npm run dev # assumes nodemon; or node src/server.js
```

Minimal server commands used in examples:

- `npm start` — production start
- `npm run dev` — development start (nodemon)

### Frontend setup

```bash
cd frontend
npm install
npm run dev # vite dev server
# open the printed URL (usually http://localhost:5173)
```

✅ Local dev checklist

- [ ] MongoDB service is running (or MONGO_URI points to Atlas)
- [ ] Backend `.env` present and not committed
- [ ] Frontend CORS or proxy configured to call backend
- [ ] Socket.IO client connects to the backend URL

---

## Environment variables

Create a `.env` file in `backend/` with at least the following:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/aftext
JWT_SECRET=replace_with_a_strong_secret
UPLOAD_DIR=./uploads
```

- In production, set `JWT_SECRET` from a secure source and do not commit `.env` files to git.

---

## API examples

### Register

`POST /api/auth/register`

Body:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "strongpassword"
}
```

Response (example):

```json
{
  "user": { "_id": "...", "username": "alice" },
  "token": "<jwt>"
}
```

### Login

`POST /api/auth/login`

Body: `{ username, password }` → Response: `{ user, token }`.

### Get messages for a room

`GET /api/messages/:room` — Requires `Authorization: Bearer <token>` header

---

## Socket.IO events

**Client -> Server**

- `join` { room }
- `send-message` { room, from, content }

**Server -> Client**

- `receive-message` { room, from, content, createdAt }
- `user-typing` { room, userId }

---

## E2EE: short note and next steps

**Important:** The code in this repo implements server-side messaging and transport security (HTTPS/TLS) patterns. This is *not* full end-to-end encryption (E2EE).

If you want E2EE, implement these steps in a separate branch as a prototype:

1. Generate client-side asymmetric keys (per user/device) and never send private keys to the server.
2. Use established cryptographic libraries (libsodium, WebCrypto) and avoid custom crypto.
3. Use a secure key-exchange (e.g., X3DH / Double Ratchet) for forward secrecy.
4. Store only public keys on the server; messages are encrypted on sender client and decrypted on recipient client.
5. Audit and peer-review before shipping. Consider using existing audited libraries/protocols.

---

## Security & best practices

- Hash passwords with bcrypt or argon2 — never store plaintext.
- Use HTTPS in production; front the app with Nginx or a managed TLS provider.
- Use express-rate-limit for auth endpoints to block brute-force attempts.
- Validate and sanitize all inputs; use mongoose validation and server-side checks.
- Limit file upload sizes and validate MIME types for images.
- Use CORS configured to trusted origins in production.
- Use JWT short expiry and refresh tokens for long sessions.

---

## Common bugs & troubleshooting checklist

- Socket events fire twice after reconnection: ensure event listeners are removed on component unmount and on socket reconnect.
- CORS errors on frontend requests: verify backend `Access-Control-Allow-Origin` and Vite proxy settings.
- Messages not persisted but shown in UI: make sure the server saves the message **before** emitting to clients. Use transactions if needed.
- Images not loading in prod: check storage path and signed URLs; remember ephemeral containers lose local storage.
- Timezone issues: store `createdAt` in UTC and convert on the client.

---

## Deployment tips

1. Use Docker for reproducible deployments and docker-compose for local infra (Mongo, MinIO).
2. For Socket.IO scaling across multiple instances use the Redis adapter (`socket.io-redis`) and a sticky-session load balancer (or use a message broker).
3. Use S3/MinIO for persistent file storage (avoid local disk on ephemeral hosts).
4. Configure health checks, logging, and monitoring (simple: Winston + log rotation).
5. Back up MongoDB data regularly (Atlas or pg_dump-equivalent for your DB).

---

## Contribution guide

1. Fork the repo
2. Create a branch: `feat/your-feature`
3. Write tests for new features where applicable
4. Open a pull request with a clear description and screenshots where helpful

Coding style quick notes:

- Keep React components small and focused
- Prefer simple, readable code over clever one-liners
- Document API changes in the README and update postman / Insomnia collections

---

## License

This project is released under the **MIT License**. Use and adapt freely. If you want copyleft protection, consider using AGPL and document the implications.

---

## Contact & community

- Start a contributors channel (e.g., a self-hosted Matrix room or a Discord server)
- Add a `CODE_OF_CONDUCT.md` and `CONTRIBUTING.md` for community clarity
- Consider organizing regular sprint days and monthly demos to attract contributors

---

*Af-Text — built for Africa. By Africans. For global impact.*
