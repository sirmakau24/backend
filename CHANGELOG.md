# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-30

### Added
- Initial release of Af-Text Backend
- JWT-based authentication system
- User management with profiles and avatars
- Real-time messaging with Socket.IO
- One-on-one and group chat support
- Message features (edit, delete, read receipts)
- File upload support (images, documents, media)
- Typing indicators
- Online/offline status tracking
- Admin panel with user and chat management
- Rate limiting and security features
- Comprehensive API documentation
- Docker support
- CI/CD with GitHub Actions
- Unit tests with Jest
- ESLint and Prettier configuration

### Security
- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting to prevent abuse
- Input validation with express-validator
- CORS configuration
- Helmet security headers
- File upload validation
