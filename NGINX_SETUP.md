# 🚀 Docker Setup with Nginx - Complete Guide

## 📋 What Changed

### Port Mappings (No More Conflicts!)

- **Application**: Access via `http://localhost:8080` (Nginx)
- **MySQL**: Port `3307` (instead of 3306)
- **Typesense**: Port `8109` (instead of 8108)
- **AdonisJS**: Runs on port `3333` internally (not exposed, only accessible via Nginx)

### New Architecture

```
Internet/Browser
       ↓
  Nginx (8080) ← Main entry point
       ↓
  AdonisJS (3333) ← Internal only
       ↓
  MySQL (3307) + Typesense (8109)
```

## 🔧 Setup Steps

### 1. Create Nginx Configuration Directories

```bash
mkdir -p nginx/conf.d
```

### 2. Create Configuration Files

Create these files in your project root:

**nginx/nginx.conf** → [Use the nginx.conf artifact]

**nginx/conf.d/default.conf** → [Use the default.conf artifact]

### 3. Update Environment File

```bash
# Copy your existing .env to .env.docker
cp .env .env.docker

# Edit .env.docker and update these values:
# NGINX_PORT=8080
# DB_PORT=3307
# TYPESENSE_PORT=8109
# APP_URL=http://localhost:8080
```

### 4. Replace docker-compose.yml

Replace your existing `docker-compose.yml` with the new one that includes Nginx.

## 🚀 Quick Start

### First Time Setup

```bash
# Initialize production environment
make init-prod
```

### Start Services

```bash
# Start everything
make up

# Check status
make status
```

### Access Your Application

```bash
# Open in browser
http://localhost:8080

# Or with custom port (if you changed NGINX_PORT)
http://localhost:YOUR_CUSTOM_PORT
```

## 📊 Port Reference

| Service   | Internal Port | External Port | Access                |
| --------- | ------------- | ------------- | --------------------- |
| Nginx     | 80            | 8080          | http://localhost:8080 |
| AdonisJS  | 3333          | N/A           | Only via Nginx        |
| MySQL     | 3306          | 3307          | localhost:3307        |
| Typesense | 8108          | 8109          | http://localhost:8109 |

## 🔍 Verify Setup

```bash
# Check all services are running
make health

# View logs
make logs-all

# Test application
curl http://localhost:8080/health
```

## 🛠️ Useful Commands

```bash
# View Nginx logs
docker logs g-agency-nginx

# Reload Nginx configuration (without restart)
docker exec g-agency-nginx nginx -s reload

# Test Nginx configuration
docker exec g-agency-nginx nginx -t

# Access Nginx shell
docker exec -it g-agency-nginx sh
```

## 📝 Customizing Ports

To change ports, edit `.env.docker`:

```bash
# Change main application port
NGINX_PORT=9000

# Change MySQL port
DB_PORT=3308

# Change Typesense port
TYPESENSE_PORT=8110
```

Then restart services:

```bash
make restart
```

## 🔒 Production Considerations

### SSL/HTTPS Setup

For production with SSL, update `nginx/conf.d/default.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Performance Tuning

Adjust in `nginx/nginx.conf`:

```nginx
worker_processes auto;  # Uses all CPU cores
worker_connections 2048;  # More concurrent connections
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080
lsof -i :8080

# Or use a different port
NGINX_PORT=9000 make up
```

### Nginx Can't Connect to App

```bash
# Check if app is healthy
docker exec g-agency-app curl http://localhost:3333/health

# Check logs
make logs app
make logs nginx
```

### Static Files Not Loading

```bash
# Verify uploads volume
docker exec g-agency-nginx ls -la /app/public/uploads

# Check permissions
docker exec g-agency-app ls -la /app/public/uploads
```

## 📦 File Structure

```
your-project/
├── docker-compose.yml          # Updated with Nginx
├── Dockerfile                  # Unchanged
├── Dockerfile.typesense        # Unchanged
├── Makefile                    # Unchanged
├── .env.docker                 # Updated ports
├── nginx/
│   ├── nginx.conf             # Main Nginx config
│   └── conf.d/
│       └── default.conf       # Site configuration
└── public/
    └── uploads/               # Shared with Nginx
```

## 🎯 Benefits of This Setup

1. **No Port Conflicts**: All services use non-standard ports
2. **Better Performance**: Nginx handles static files efficiently
3. **Load Balancing Ready**: Easy to scale AdonisJS instances
4. **SSL Termination**: Add HTTPS at Nginx level
5. **Caching**: Nginx can cache responses
6. **Security**: App not directly exposed to internet
7. **Production Ready**: Standard setup used in production

## ✅ Verification Checklist

- [ ] Created `nginx/` directory structure
- [ ] Added `nginx.conf` and `default.conf`
- [ ] Updated `.env.docker` with new ports
- [ ] Replaced `docker-compose.yml`
- [ ] Ran `make init-prod` successfully
- [ ] Can access app at `http://localhost:8080`
- [ ] No port conflicts with local MySQL/Typesense
- [ ] Health checks passing for all services
