# Production Deployment Guide

## Prerequisites

- Node.js 20 LTS
- OpenAI API Key
- Domain (for production)

## Environment Setup

### Required Environment Variables

```bash
OPENAI_API_KEY=sk-...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Deployment Options

### Option 1: Vercel (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `OPENAI_API_KEY`
   - Add `NEXT_PUBLIC_APP_URL`

5. **Redeploy** after setting env vars

**Pros**: Automatic scaling, CDN, SSL, zero configuration
**Cons**: Cold starts on free tier

---

### Option 2: VPS with Docker

#### Requirements
- Ubuntu 20.04+ or similar
- Docker installed
- 1GB+ RAM
- Domain pointed to server

#### Steps

1. **SSH into your server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Clone repository**:
   ```bash
   git clone https://github.com/openai/openai-fm.git
   cd openai-fm
   ```

4. **Create `.env` file**:
   ```bash
   cat > .env << EOF
   OPENAI_API_KEY=sk-...
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   EOF
   ```

5. **Build and run**:
   ```bash
   docker-compose up -d
   ```

6. **Check logs**:
   ```bash
   docker-compose logs -f
   ```

7. **Setup Nginx reverse proxy** (recommended):

   Create `/etc/nginx/sites-available/openai-tts`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/openai-tts /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

**Pros**: Full control, no cold starts
**Cons**: Manual maintenance, scaling requires work

---

### Option 3: VPS without Docker

1. **Install Node.js 20**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and setup**:
   ```bash
   git clone https://github.com/openai/openai-fm.git
   cd openai-fm
   npm install
   ```

3. **Create `.env`**:
   ```bash
   nano .env
   # Add your environment variables
   ```

4. **Build**:
   ```bash
   npm run build
   ```

5. **Install PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   ```

6. **Start with PM2**:
   ```bash
   pm2 start npm --name "openai-tts" -- start
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx** (same as Docker option above)

**Pros**: Simple, direct control
**Cons**: Manual updates, process management needed

---

## Health Monitoring

### Health Check Endpoint

```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "services": {
    "openai": "ok"
  }
}
```

### Monitoring Setup

Add to your monitoring (Uptime Robot, Better Uptime, etc.):
- **URL**: `https://yourdomain.com/api/health`
- **Interval**: 5 minutes
- **Expected**: Status 200

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] API key not in version control
- [ ] Nginx/reverse proxy configured
- [ ] Firewall rules applied

## Performance Tuning

### For High Traffic

1. **Enable Redis for rate limiting** (optional):
   ```bash
   # Add to docker-compose.yml
   redis:
     image: redis:alpine
     ports:
       - "6379:6379"
   ```

   Update `.env`:
   ```
   REDIS_URL=redis://redis:6379
   ```

2. **Increase server resources**:
   - Minimum: 1GB RAM
   - Recommended: 2GB+ RAM for production

3. **CDN** (if using Vercel, automatic)

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9
```

### Docker build fails
```bash
# Clean build
docker system prune -a
docker-compose build --no-cache
```

### API key errors
```bash
# Verify env file is loaded
docker-compose exec app env | grep OPENAI
```

## Backup Strategy

1. **Environment variables**: Store securely (1Password, LastPass)
2. **Code**: GitHub/GitLab repository
3. **No database needed yet** (stateless application)

## Rollback

### Vercel
```bash
vercel rollback
```

### Docker
```bash
# Pull previous image
docker pull yourusername/openai-tts:previous-tag
docker-compose down
docker-compose up -d
```

## Cost Estimation

### Vercel
- **Hobbyist**: Free (suitable for demos)
- **Pro**: $$20/month (for production)

### VPS
- **DigitalOcean**: $$5-12/month
- **Hetzner**: €4-8/month
- **AWS Lightsail**: $$5/month

### OpenAI API
- Variable based on usage
- Monitor at: https://platform.openai.com/usage

## Support

For issues, check:
1. Application logs
2. Health endpoint
3. OpenAI API status
4. GitHub Issues

---

**Last Updated**: January 2026
