# Deployment Guide

Complete guide for deploying Af-Text backend to production.

## Prerequisites

- Node.js v16+ installed on server
- MongoDB instance (local or cloud)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

---

## Environment Setup

### 1. Production Environment Variables

Create a `.env` file with production values:

```env
# Server
PORT=5000
NODE_ENV=production

# Database (Use MongoDB Atlas or your production MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aftext?retryWrites=true&w=majority

# Security
JWT_SECRET=your_super_strong_random_secret_key_minimum_32_characters
JWT_EXPIRE=7d

# CORS (Your frontend domains)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/aftext/uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin
ADMIN_EMAILS=admin@yourdomain.com
```

### 2. Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Deployment Options

### Option 1: Traditional VPS (Ubuntu/Debian)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (if hosting locally)
# See: https://docs.mongodb.com/manual/installation/

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/aftext
sudo chown $USER:$USER /var/www/aftext

# Clone or upload your code
cd /var/www/aftext
git clone <your-repo-url> .

# Install dependencies
cd backend
npm install

# Build TypeScript
npm run build

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Copy environment file
cp .env.example .env
nano .env  # Edit with production values
```

#### Step 3: Start with PM2

```bash
# Start application
pm2 start dist/server.js --name aftext-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions from the command output

# Monitor application
pm2 status
pm2 logs aftext-backend
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/aftext
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (use Certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /var/www/aftext/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/aftext /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

### Option 2: Docker Deployment

#### Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/server.js"]
```

#### docker-compose.yml

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/aftext
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    volumes:
      - ./backend/uploads:/app/uploads
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create aftext-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGINS=https://yourfrontend.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Railway

1. Connect your GitHub repository
2. Add MongoDB service
3. Set environment variables in dashboard
4. Deploy automatically on push

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Configure build command: `npm run build`
3. Configure run command: `node dist/server.js`
4. Add MongoDB database
5. Set environment variables
6. Deploy

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Option 2: Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Secure MongoDB
mongo
> use admin
> db.createUser({
    user: "aftext_admin",
    pwd: "strong_password",
    roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Update connection string
MONGODB_URI=mongodb://aftext_admin:strong_password@localhost:27017/aftext?authSource=admin
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://api.yourdomain.com/health

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test","email":"test@test.com","password":"test123"}'
```

### 2. Setup Monitoring

#### PM2 Monitoring

```bash
# Install PM2 Plus (optional)
pm2 link <secret> <public>

# Monitor
pm2 monit
```

#### Log Management

```bash
# PM2 logs
pm2 logs aftext-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Backup Strategy

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

---

## Security Checklist

- [ ] Use strong JWT secret (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall (UFW)
- [ ] Keep Node.js and dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up rate limiting
- [ ] Configure security headers (Helmet)
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Use strong passwords for admin accounts

---

## Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Performance Optimization

### 1. Enable Compression

Already enabled in the code via `compression` middleware.

### 2. MongoDB Indexes

Indexes are automatically created by Mongoose schemas.

### 3. PM2 Cluster Mode

```bash
# Use all CPU cores
pm2 start dist/server.js -i max --name aftext-backend
```

### 4. Nginx Caching

Add to Nginx config:

```nginx
# Cache static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs aftext-backend

# Check environment variables
pm2 env 0

# Restart
pm2 restart aftext-backend
```

### Database connection issues

```bash
# Test MongoDB connection
mongo "$MONGODB_URI"

# Check MongoDB status
sudo systemctl status mongodb
```

### Socket.IO not working

- Verify Nginx WebSocket configuration
- Check CORS settings
- Ensure SSL is properly configured

---

## Maintenance

### Update Application

```bash
# Pull latest code
cd /var/www/aftext/backend
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart aftext-backend
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update
npm update

# Rebuild and restart
npm run build
pm2 restart aftext-backend
```

---

## Scaling

### Horizontal Scaling

1. Use load balancer (Nginx, HAProxy)
2. Enable PM2 cluster mode
3. Use Redis for Socket.IO adapter
4. Separate database server

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize MongoDB queries
3. Enable database indexing
4. Use CDN for static files

---

For more information, see [README.md](README.md) and [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
