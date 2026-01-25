# HorseSheet Deployment Guide

This guide provides detailed instructions for deploying the HorseSheet application as a demo. Multiple deployment options are available, each with different trade-offs.

## Table of Contents

1. [Quick Start - Railway (Recommended for Demo)](#quick-start---railway)
2. [VPS Deployment with Docker Compose](#vps-deployment-with-docker-compose)
3. [Render Deployment](#render-deployment)
4. [Fly.io Deployment](#flyio-deployment)
5. [micr.us Deployment](#micrus-deployment)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Quick Start - Railway (Recommended for Demo)

Railway is the easiest option for a quick demo deployment with minimal DevOps knowledge required.

### Prerequisites

- GitHub account with repository access
- Railway account (sign up at [railway.app](https://railway.app))

### Step 1: Setup PostgreSQL

1. Log into Railway dashboard
2. Click "New Project"
3. Click "New" → "Database" → "Add PostgreSQL"
4. Wait for service to provision
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` value (you'll need this later)

### Step 2: Setup Redis

1. In the same Railway project, click "New" → "Database" → "Add Redis"
2. Wait for service to provision
3. Go to "Variables" tab
4. Note the `REDIS_HOST` and `REDIS_PORT` values

### Step 3: Deploy Backend

1. In Railway project, click "New" → "GitHub Repo"
2. Select your repository
3. Railway will detect the project - click "Add Service"
4. In service settings:
   - **Root Directory**: `BE/horse-sheet-be`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn migration:run && yarn start:prod`

5. Go to "Variables" tab and add:
   ```
   DATABASE_URL=<from-postgres-service>
   REDIS_HOST=<from-redis-service>
   REDIS_PORT=6379
   JWT_ACCESS_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   ACCESS_EXPIRES_IN=15m
   REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend.railway.app
   NODE_ENV=production
   DATABASE_SSL=true
   DB_SYNCHRONIZE=false
   PORT=3000
   ```

6. Generate secrets:
   ```bash
   openssl rand -base64 32  # For JWT_ACCESS_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   ```

7. Railway will auto-deploy. Wait for deployment to complete.
8. Note the generated URL (e.g., `https://your-backend.railway.app`)

### Step 4: Deploy Frontend

1. In Railway project, click "New" → "GitHub Repo"
2. Select the same repository
3. Click "Add Service"
4. In service settings:
   - **Root Directory**: `FE/horse-sheet-fe`
   - **Build Command**: `yarn install && yarn build`
   - **Output Directory**: `dist`

5. Go to "Variables" tab and add:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

6. Railway will auto-deploy and generate a URL

### Step 5: Update CORS

1. Go back to backend service
2. Update `CORS_ORIGIN` variable to match your frontend URL
3. Redeploy backend service

### Step 6: Run Migrations and Seed Admin

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run migrations:
   ```bash
   cd BE/horse-sheet-be
   railway run yarn migration:run
   ```
5. Seed admin user:
   ```bash
   railway run yarn seed:admin
   ```

### Step 7: Access Your Application

- Frontend: `https://your-frontend.railway.app`
- Backend API: `https://your-backend.railway.app/api`
- Swagger Docs: `https://your-backend.railway.app/api/docs`

**Default Admin Credentials:**
- Email: `admin@horsesheet.com`
- Password: `Admin123!`

⚠️ **Change the admin password immediately after first login!**

---

## VPS Deployment with Docker Compose

This option provides full control and is most cost-effective for long-term demos.

### Prerequisites

- VPS with Ubuntu 22.04 LTS (minimum 2GB RAM, 1 vCPU)
- Domain name (optional but recommended)
- SSH access to server

### Step 1: Provision VPS

Recommended providers:
- **Hetzner**: €4.15/month (2GB RAM) - Best value
- **DigitalOcean**: $6/month (1GB RAM)
- **Linode**: $5/month (1GB RAM)

### Step 2: Initial Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 3: Setup Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### Step 4: Clone Repository

```bash
# Install Git
apt install git -y

# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/HorseSheet.git
cd HorseSheet
```

### Step 5: Configure Environment Variables

```bash
# Copy example environment file
cp .env.prod.example .env.prod

# Edit with your values
nano .env.prod
```

Required values:
- `POSTGRES_PASSWORD`: Strong password for database
- `REDIS_PASSWORD`: Strong password for Redis
- `JWT_ACCESS_SECRET`: Generate with `openssl rand -base64 32`
- `JWT_REFRESH_SECRET`: Generate with `openssl rand -base64 32`
- `CORS_ORIGIN`: Your frontend URL (e.g., `https://yourdomain.com`)
- `VITE_API_URL`: Your backend URL (e.g., `https://api.yourdomain.com/api`)

### Step 6: Build and Start Services

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.prod.yml ps
```

### Step 7: Run Migrations

```bash
# Run database migrations
docker compose -f docker-compose.prod.yml exec backend yarn migration:run

# Seed admin user
docker compose -f docker-compose.prod.yml exec backend yarn seed:admin
```

### Step 8: Setup Nginx Reverse Proxy (Optional but Recommended)

If you have a domain name:

```bash
# Install Nginx
apt install nginx certbot python3-certbot-nginx -y

# Create Nginx configuration
nano /etc/nginx/sites-available/horsesheet
```

Add configuration:
```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/horsesheet /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Setup SSL with Let's Encrypt
certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Step 9: Update CORS and Frontend API URL

After setting up domain:

```bash
# Update .env.prod
nano .env.prod
# Set CORS_ORIGIN=https://yourdomain.com
# Set VITE_API_URL=https://api.yourdomain.com/api

# Restart services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Update application
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## Render Deployment

### Prerequisites

- GitHub account
- Render account (sign up at [render.com](https://render.com))

### Step 1: Setup PostgreSQL

1. Go to Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `horsesheet-db`
   - **Database**: `horsesheet`
   - **User**: `horsesheet`
   - **Region**: Choose closest
   - **Plan**: Free (or Starter for production)
4. Click "Create Database"
5. Copy the **Internal Database URL** (for backend) and **External Database URL** (if needed)

### Step 2: Setup Redis

1. Click "New +" → "Redis"
2. Configure:
   - **Name**: `horsesheet-redis`
   - **Plan**: Free (or Starter)
3. Click "Create Redis"
4. Note the **Internal Redis URL** and **Host/Port**

### Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `horsesheet-backend`
   - **Root Directory**: `BE/horse-sheet-be`
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn migration:run && yarn start:prod`
   - **Plan**: Free (or Starter)

4. Add Environment Variables:
   ```
   DATABASE_URL=<internal-postgres-url>
   REDIS_HOST=<redis-host>
   REDIS_PORT=<redis-port>
   JWT_ACCESS_SECRET=<generate-secret>
   JWT_REFRESH_SECRET=<generate-secret>
   ACCESS_EXPIRES_IN=15m
   REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend.onrender.com
   NODE_ENV=production
   DATABASE_SSL=true
   DB_SYNCHRONIZE=false
   PORT=3000
   ```

5. Click "Create Web Service"
6. Wait for deployment (first deploy takes ~5-10 minutes)
7. Note the generated URL

### Step 4: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `horsesheet-frontend`
   - **Root Directory**: `FE/horse-sheet-fe`
   - **Build Command**: `yarn install && yarn build`
   - **Publish Directory**: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

5. Click "Create Static Site"
6. Wait for deployment

### Step 5: Update CORS and Run Migrations

1. Update backend `CORS_ORIGIN` to match frontend URL
2. Use Render Shell to run migrations:
   - Go to backend service → "Shell"
   - Run: `yarn migration:run`
   - Run: `yarn seed:admin`

**Note**: Free tier services spin down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds.

---

## Fly.io Deployment

### Prerequisites

- Docker installed locally
- Fly.io account (sign up at [fly.io](https://fly.io))
- Fly CLI installed: `curl -L https://fly.io/install.sh | sh`

### Step 1: Create Dockerfiles

Dockerfiles are already created in the repository:
- `BE/horse-sheet-be/Dockerfile`
- `FE/horse-sheet-fe/Dockerfile`

### Step 2: Setup PostgreSQL

Option A - Fly Postgres:
```bash
fly postgres create --name horsesheet-db --region <region>
fly postgres attach --app horsesheet-backend horsesheet-db
```

Option B - External (Supabase/Neon):
- Create database externally
- Get connection string

### Step 3: Setup Redis

Option A - Fly Redis:
```bash
fly redis create --name horsesheet-redis --region <region>
```

Option B - External (Upstash):
- Create Redis database
- Get connection details

### Step 4: Deploy Backend

```bash
cd BE/horse-sheet-be

# Login to Fly.io
fly auth login

# Initialize app
fly launch --name horsesheet-backend

# Set secrets
fly secrets set DATABASE_URL=<your-database-url>
fly secrets set REDIS_HOST=<redis-host>
fly secrets set REDIS_PORT=6379
fly secrets set JWT_ACCESS_SECRET=<secret>
fly secrets set JWT_REFRESH_SECRET=<secret>
fly secrets set CORS_ORIGIN=https://your-frontend.fly.dev
fly secrets set NODE_ENV=production

# Deploy
fly deploy

# Run migrations
fly ssh console -C "yarn migration:run"
fly ssh console -C "yarn seed:admin"
```

### Step 5: Deploy Frontend

```bash
cd FE/horse-sheet-fe

# Initialize app
fly launch --name horsesheet-frontend

# Set build arg
fly secrets set VITE_API_URL=https://your-backend.fly.dev/api

# Deploy
fly deploy
```

---

## micr.us Deployment

micr.us is a container-based deployment platform that supports Docker deployments with built-in database and Redis services.

### Prerequisites

- GitHub account with repository access
- micr.us account (sign up at [micr.us](https://micr.us))
- Dockerfiles already created (included in repository)

### Architecture

- micr.us PostgreSQL service (or external database)
- micr.us Redis service (or external Redis)
- micr.us service for NestJS backend
- micr.us service for Vue frontend

### Pros

- ✅ Docker-based deployment (full control)
- ✅ Built-in PostgreSQL and Redis services
- ✅ Automatic HTTPS/SSL certificates
- ✅ Git-based deployments
- ✅ Environment variable management
- ✅ Simple pricing model
- ✅ Good for containerized applications

### Cons

- ❌ Requires Docker knowledge
- ❌ Less documentation than major platforms
- ❌ May have resource limitations on free tier

### Estimated Monthly Cost

- **Free Tier**: $0 (with limitations, if available)
- **Paid Tier**: ~$5-20/month
  - PostgreSQL: ~$5/month (varies by plan)
  - Redis: ~$5/month (varies by plan)
  - Backend service: ~$5-10/month (varies by resources)
  - Frontend: Free or low cost (static hosting)

### Step 1: Setup PostgreSQL

1. Log into micr.us dashboard
2. Navigate to "Databases" or "Services"
3. Create new PostgreSQL database
4. Configure:
   - **Name**: `horsesheet-db`
   - **Database**: `horsesheet`
   - **Plan**: Choose appropriate plan
5. Wait for service to provision
6. Copy the connection string → `DATABASE_URL`
   - Format: `postgresql://user:password@host:port/database`

### Step 2: Setup Redis

1. In micr.us dashboard, create new Redis service
2. Configure:
   - **Name**: `horsesheet-redis`
   - **Plan**: Choose appropriate plan
3. Wait for service to provision
4. Note the connection details:
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD` (if required)

### Step 3: Deploy Backend

1. In micr.us dashboard, click "New Service" or "Deploy"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `horsesheet-backend`
   - **Type**: Docker/Container
   - **Source**: GitHub repository
   - **Dockerfile Path**: `BE/horse-sheet-be/Dockerfile`
   - **Context**: `BE/horse-sheet-be`
   - **Port**: `3000`

4. Set Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<from-postgres-service>
   DATABASE_SSL=true
   DB_SYNCHRONIZE=false
   REDIS_HOST=<from-redis-service>
   REDIS_PORT=6379
   REDIS_PASSWORD=<from-redis-service>
   JWT_ACCESS_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   ACCESS_EXPIRES_IN=15m
   REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend.micr.us
   ```

5. Generate secrets:
   ```bash
   openssl rand -base64 32  # For JWT_ACCESS_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   ```

6. Set build and start commands (if required):
   - **Build**: Automatic (uses Dockerfile)
   - **Start**: `node dist/main.js`
   - **Pre-start**: `yarn migration:run` (or run manually)

7. Deploy the service
8. Wait for deployment to complete
9. Note the generated URL (e.g., `https://your-backend.micr.us`)

### Step 4: Deploy Frontend

1. In micr.us dashboard, click "New Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `horsesheet-frontend`
   - **Type**: Docker/Container or Static Site
   - **Source**: GitHub repository
   - **Dockerfile Path**: `FE/horse-sheet-fe/Dockerfile` (if using Docker)
   - **Context**: `FE/horse-sheet-fe`
   - **Port**: `80` (if using Docker)

4. If using Docker, set build arguments:
   ```
   VITE_API_URL=https://your-backend.micr.us/api
   ```

5. If using Static Site option:
   - **Build Command**: `yarn install && yarn build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL=https://your-backend.micr.us/api`

6. Deploy the service
7. Wait for deployment to complete
8. Note the generated URL

### Step 5: Update CORS

1. Go back to backend service settings
2. Update `CORS_ORIGIN` environment variable to match your frontend URL
3. Redeploy backend service (or wait for auto-redeploy if enabled)

### Step 6: Run Migrations and Seed Admin

**Option A: Using micr.us CLI (if available)**
```bash
# Install micr.us CLI (if available)
# Follow micr.us documentation for CLI setup

# Connect to backend service
micr.us connect horsesheet-backend

# Run migrations
cd BE/horse-sheet-be
yarn migration:run

# Seed admin user
yarn seed:admin
```

**Option B: Using Service Shell/Console**
1. Go to backend service in micr.us dashboard
2. Open "Shell" or "Console" option
3. Run:
   ```bash
   yarn migration:run
   yarn seed:admin
   ```

**Option C: Add to Startup Command**
Modify the backend service start command to:
```bash
sh -c "yarn migration:run && node dist/main.js"
```

### Step 7: Access Your Application

- Frontend: `https://your-frontend.micr.us`
- Backend API: `https://your-backend.micr.us/api`
- Swagger Docs: `https://your-backend.micr.us/api/docs`

**Default Admin Credentials:**
- Email: `admin@horsesheet.com`
- Password: `Admin123!`

⚠️ **Change the admin password immediately after first login!**

### Troubleshooting micr.us Specific Issues

**Build fails:**
- Verify Dockerfile path is correct
- Check build logs in micr.us dashboard
- Ensure Dockerfile is in the correct context directory

**Service won't start:**
- Check environment variables are set correctly
- Verify database and Redis connection strings
- Review service logs in dashboard

**Database connection errors:**
- Ensure `DATABASE_SSL=true` for managed databases
- Verify connection string format
- Check network connectivity between services

**Frontend can't reach backend:**
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration
- Ensure backend service is running and accessible

### Notes

- micr.us platform features may vary - adjust steps based on actual platform capabilities
- Some steps may require micr.us CLI or web dashboard only
- Check micr.us documentation for latest platform features and best practices
- Database and Redis services may need to be in the same network/region for optimal performance

---

## Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode (`production`/`development`) |
| `PORT` | No | `3000` | Backend server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `DATABASE_SSL` | No | `false` | Enable SSL for database connection |
| `DB_SYNCHRONIZE` | No | `false` | Auto-sync schema (never `true` in production) |
| `REDIS_HOST` | No | `localhost` | Redis server hostname |
| `REDIS_PORT` | No | `6379` | Redis server port |
| `REDIS_PASSWORD` | No | - | Redis password (if required) |
| `JWT_ACCESS_SECRET` | Yes | - | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | - | Secret for signing refresh tokens |
| `ACCESS_EXPIRES_IN` | No | `15m` | Access token expiration time |
| `REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiration time |
| `CORS_ORIGIN` | Yes | - | Frontend origin URL(s), comma-separated |
| `ADMIN_EMAIL` | No | `admin@horsesheet.com` | Admin user email for seeding |
| `ADMIN_PASSWORD` | No | `Admin123!` | Admin user password for seeding |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `/api` | Backend API base URL |

### Generating Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32

# Generate database password
openssl rand -base64 24

# Generate Redis password
openssl rand -base64 24
```

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Backend health endpoint responds: `GET /api/health`
- [ ] Frontend loads without errors
- [ ] Can login with admin credentials
- [ ] CORS is configured correctly (check browser console)
- [ ] Database migrations ran successfully
- [ ] Admin user exists and can login
- [ ] HTTPS/SSL is enabled (for production)
- [ ] Environment variables are set correctly
- [ ] Logs show no errors
- [ ] Swagger docs accessible: `/api/docs`

### Testing the Deployment

1. **Health Check**:
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Login Test**:
   ```bash
   curl -X POST https://your-backend-url/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@horsesheet.com","password":"Admin123!"}'
   ```

3. **Frontend Test**:
   - Open frontend URL in browser
   - Check browser console for errors
   - Try logging in

### Troubleshooting

**Backend won't start:**
- Check environment variables are set
- Verify database connection string
- Check logs: `docker compose logs backend` or Railway/Render logs

**CORS errors:**
- Verify `CORS_ORIGIN` matches frontend URL exactly
- Check for trailing slashes
- Ensure `credentials: true` is set (already in code)

**Database connection errors:**
- Verify `DATABASE_URL` format
- Check database is accessible from backend
- For managed databases, ensure `DATABASE_SSL=true`

**Frontend can't reach backend:**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS configuration

**Migrations fail:**
- Ensure database exists
- Check database user has proper permissions
- Verify connection string is correct

---

## Cost Comparison Summary

| Solution | Monthly Cost | Best For |
|----------|--------------|----------|
| Railway | $0-15 | Quick demo, zero DevOps |
| Render | $0-25 | Free tier demo |
| Fly.io | $0-20 | Docker-based, global edge |
| micr.us | $0-20 | Docker-based, containerized apps |
| VPS (Hetzner) | €4.15 (~$4.50) | Long-term, full control |
| VPS (DigitalOcean) | $6 | Long-term, managed |
| AWS | $15-30 | Enterprise, scalable |

---

## Security Best Practices

1. **Change default admin password** immediately after first login
2. **Use strong secrets** for JWT tokens (32+ characters)
3. **Enable HTTPS/SSL** for all production deployments
4. **Keep dependencies updated** regularly
5. **Monitor logs** for suspicious activity
6. **Use environment-specific configs** (never commit `.env` files)
7. **Restrict database access** to backend only
8. **Use Redis password** in production
9. **Enable database SSL** for managed databases
10. **Set up backups** for production databases

---

## Support

For issues or questions:
1. Check application logs
2. Review environment variables
3. Verify all services are running
4. Check network connectivity
5. Review this deployment guide

---

## Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up monitoring (optional)
3. Configure automated backups (for production)
4. Set up CI/CD for automated deployments (see CI/CD section)
5. Review and optimize performance

