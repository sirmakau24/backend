# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Af-Text seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Discuss the vulnerability in public forums or social media

### Please DO:

1. **Email us directly** at security@aftext.example.com (replace with your actual security contact)
2. Include the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the issue, including how an attacker might exploit it

### What to expect:

- We will acknowledge your email within 48 hours
- We will provide a more detailed response within 7 days
- We will work with you to understand and validate the issue
- We will release a fix as soon as possible
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When deploying Af-Text in production:

### Environment Variables
- Use strong, randomly generated `JWT_SECRET`
- Never commit `.env` files to version control
- Rotate secrets regularly

### Database
- Use MongoDB authentication
- Enable SSL/TLS for MongoDB connections
- Regularly backup your database
- Keep MongoDB updated

### Network Security
- Use HTTPS/SSL in production
- Configure proper CORS origins
- Use a reverse proxy (Nginx/Apache)
- Enable rate limiting
- Use a firewall

### Application Security
- Keep all dependencies updated
- Run `npm audit` regularly
- Use environment-specific configurations
- Implement proper logging and monitoring
- Validate and sanitize all user inputs

### File Uploads
- Limit file sizes
- Validate file types
- Scan uploaded files for malware
- Store files outside the web root
- Use unique, non-guessable filenames

### Authentication
- Enforce strong password policies
- Implement account lockout after failed attempts
- Use secure session management
- Consider implementing 2FA

## Known Security Considerations

### Rate Limiting
The application includes rate limiting, but you should also implement rate limiting at the reverse proxy level for additional protection.

### File Upload
File uploads are validated by type and size, but additional scanning for malicious content is recommended in production.

### Admin Access
Admin functionality is controlled by email whitelist. Consider implementing a more robust role-based access control (RBAC) system for production use.

## Security Updates

Security updates will be released as patch versions and documented in the CHANGELOG.md file with a `[SECURITY]` tag.

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities.
