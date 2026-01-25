# Nginx Reverse Proxy Configuration

This nginx configuration is **optional** and only needed if you want:

1. **SSL/TLS termination** - Handle HTTPS certificates at the reverse proxy level
2. **Domain-based routing** - Route `api.yourdomain.com` to backend, `yourdomain.com` to frontend
3. **Advanced rate limiting** - More sophisticated rate limiting than what's in the frontend nginx
4. **Load balancing** - If you scale to multiple backend/frontend instances

## When to Use

### Simple Demo Setup (Current Default)
- **Don't use this** - The frontend container's nginx is sufficient
- Frontend exposes port 80 directly
- Backend exposes port 3000 directly
- Works great for demos and simple deployments

### Production Setup with Domain
- **Use this** if you have a domain name and want:
  - Single entry point (port 80/443)
  - SSL certificates managed by nginx
  - Clean URL routing (api.domain.com → backend, domain.com → frontend)

## How to Enable

1. Uncomment the `nginx` service in `docker-compose.prod.yml`
2. Uncomment the `nginx_logs` volume
3. Update `nginx/nginx.conf` with your domain names
4. Set up SSL certificates in `nginx/ssl/` directory
5. Update frontend port mapping to not expose port 80 (or use different port)
6. Update backend CORS_ORIGIN to match your domain

## Configuration

The `nginx.conf` file includes:
- Frontend proxy (routes `/` to frontend container)
- Backend API proxy (routes `api.*` subdomain to backend container)
- Rate limiting
- Security headers
- Gzip compression

