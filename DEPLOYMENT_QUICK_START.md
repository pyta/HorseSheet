# Quick Deployment Guide

This is a condensed guide for the most common deployment scenarios. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🚀 Railway (Recommended for Quick Demo)

**Time**: ~15 minutes | **Cost**: $0-15/month

1. Sign up at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service → Copy `DATABASE_URL`
4. Add Redis service → Note `REDIS_HOST` and `REDIS_PORT`
5. Add backend service:
   - Connect GitHub repo
   - Root: `BE/horse-sheet-be`
   - Build: `yarn install && yarn build`
   - Start: `yarn migration:run && yarn start:prod`
   - Set env vars (see below)
6. Add frontend service:
   - Connect GitHub repo
   - Root: `FE/horse-sheet-fe`
   - Build: `yarn install && yarn build`
   - Output: `dist`
   - Set `VITE_API_URL` to backend URL
7. Run migrations: `railway run yarn migration:run`
8. Seed admin: `railway run yarn seed:admin`

**Required Environment Variables (Backend):**
```
DATABASE_URL=<from-postgres>
REDIS_HOST=<from-redis>
REDIS_PORT=6379
JWT_ACCESS_SECRET=<openssl rand -base64 32>
JWT_REFRESH_SECRET=<openssl rand -base64 32>
CORS_ORIGIN=https://your-frontend.railway.app
NODE_ENV=production
DATABASE_SSL=true
```

**Default Admin Login:**
- Email: `admin@horsesheet.com`
- Password: `Admin123!`

---

## 🐳 VPS with Docker Compose

**Time**: ~30 minutes | **Cost**: €4.15-6/month

1. Provision VPS (Ubuntu 22.04)
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Clone repo: `git clone <your-repo> && cd HorseSheet`
4. Copy env: `cp .env.prod.example .env.prod`
5. Edit `.env.prod` with your values
6. Deploy: `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d`
7. Migrations: `docker compose -f docker-compose.prod.yml exec backend yarn migration:run`
8. Seed admin: `docker compose -f docker-compose.prod.yml exec backend yarn seed:admin`

**Generate Secrets:**
```bash
openssl rand -base64 32  # For JWT secrets
openssl rand -base64 24  # For passwords
```

---

## 📋 Environment Variables Checklist

### Backend
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `REDIS_HOST` - Redis hostname
- [ ] `REDIS_PORT` - Redis port (default: 6379)
- [ ] `REDIS_PASSWORD` - Redis password (if required)
- [ ] `JWT_ACCESS_SECRET` - Strong random string
- [ ] `JWT_REFRESH_SECRET` - Strong random string
- [ ] `CORS_ORIGIN` - Frontend URL
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_SSL=true` (for managed databases)

### Frontend
- [ ] `VITE_API_URL` - Backend API URL (e.g., `https://api.domain.com/api`)

---

## ✅ Post-Deployment Verification

1. **Health Check**: `curl https://your-backend/api/health`
2. **Frontend**: Open in browser, check console for errors
3. **Login**: Test with admin credentials
4. **Swagger**: Visit `https://your-backend/api/docs`

---

## 🔧 Common Issues

**CORS Errors:**
- Verify `CORS_ORIGIN` matches frontend URL exactly
- No trailing slashes

**Database Connection:**
- Check `DATABASE_URL` format
- For managed DBs, set `DATABASE_SSL=true`

**Frontend can't reach backend:**
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS settings

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed step-by-step guides
- All deployment options (Render, Fly.io, AWS)
- Troubleshooting
- Security best practices
- Cost comparisons

