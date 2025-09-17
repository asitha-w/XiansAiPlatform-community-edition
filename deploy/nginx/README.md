# XiansAi Production HTTPS Setup

This directory contains a production-grade Nginx setup with automatic Let's Encrypt SSL certificate management for XiansAi Community Edition.

## 🚀 Quick Start

### 1. Configure Your Domain

```bash
# Copy the environment template
cp nginx/.env.example nginx/.env

# Edit the configuration
vim nginx/.env
```

Update the following key settings:
- `DOMAIN=prod.xians.ai` (your actual domain)
- `LETSENCRYPT_EMAIL=admin@xians.ai` (your email for Let's Encrypt)

### 2. Deploy with Single Command

```bash
# Navigate to nginx directory
cd nginx

# Run the setup script
./setup-production-https.sh
```

That's it! Your XiansAi platform will be available at:
- **Main App**: https://prod.xians.ai
- **API**: https://api.prod.xians.ai  
- **Auth**: https://auth.prod.xians.ai
- **Temporal**: https://temporal.prod.xians.ai

## 📋 Prerequisites

### Domain Requirements
- Domain pointing to your server's IP address
- Subdomains configured (or wildcard DNS):
  - `prod.xians.ai` → Server IP
  - `api.prod.xians.ai` → Server IP
  - `auth.prod.xians.ai` → Server IP
  - `temporal.prod.xians.ai` → Server IP

### Server Requirements
- Docker and Docker Compose installed
- Ports 80 and 443 accessible from internet
- XiansAi Community Edition services running

## 🔧 Configuration

### Environment Variables (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `DOMAIN` | `prod.xians.ai` | Primary domain name |
| `LETSENCRYPT_EMAIL` | `admin@xians.ai` | Email for Let's Encrypt |
| `STAGING` | `false` | Use staging certificates (testing) |
| `RATE_LIMIT_UI` | `10` | UI requests per second |
| `RATE_LIMIT_API` | `30` | API requests per second |
| `RATE_LIMIT_AUTH` | `5` | Auth requests per second |
| `CLIENT_MAX_BODY_SIZE` | `100M` | Max upload size |

### Production vs Staging

```bash
# Production certificates (default)
./setup-production-https.sh

# Staging certificates (for testing)
./setup-production-https.sh --staging
```

## 🛠 Management Commands

### Check Certificate Status
```bash
./setup-production-https.sh --check
```

### Force Certificate Renewal
```bash
./setup-production-https.sh --force
```

### View Logs
```bash
# Nginx logs
docker-compose logs -f nginx

# Certbot logs  
docker-compose logs -f certbot

# All services
docker-compose logs -f
```

### Restart Services
```bash
# Restart Nginx only
docker-compose restart nginx

# Restart all
docker-compose restart

# Stop all
docker-compose down
```

## 🔒 Security Features

### SSL/TLS Security
- **TLS 1.2/1.3 only** - No deprecated protocols
- **Strong cipher suites** - Modern encryption
- **Perfect Forward Secrecy** - Session key security
- **HSTS enabled** - Force HTTPS connections
- **SSL stapling** - Performance optimization

### Security Headers
- `Strict-Transport-Security` - Force HTTPS
- `X-Frame-Options` - Prevent clickjacking
- `X-Content-Type-Options` - Prevent MIME sniffing
- `X-XSS-Protection` - XSS filtering
- `Content-Security-Policy` - Content restrictions
- `Referrer-Policy` - Referrer control

### Rate Limiting
- **UI**: 10 requests/second (burst: 20)
- **API**: 30 requests/second (burst: 50)  
- **Auth**: 5 requests/second (burst: 10)
- **Connection limiting**: 20 connections per IP

### Firewall Integration
- Automatic UFW configuration
- Block direct access to application ports
- Allow only HTTP/HTTPS traffic

## 🏗 Architecture

```
Internet
    ↓
Nginx (Port 80/443)
    ↓
Docker Network: xians-community-edition-network
    ↓
┌─────────────────────────────────────────────┐
│  XiansAi Services (Internal Ports)         │
│  ├─ UI (8080)                              │
│  ├─ Server (8080)                          │
│  ├─ Keycloak (8080)                        │
│  └─ Temporal (8080)                        │
└─────────────────────────────────────────────┘
```

## 🔄 Certificate Management

### Automatic Renewal
Certificates are automatically renewed every 12 hours by the Certbot container.

### Manual Operations
```bash
# Check certificate expiry
openssl x509 -enddate -noout -in certbot/conf/live/prod.xians.ai/fullchain.pem

# Test renewal (dry run)
docker exec xiansai-certbot certbot renew --dry-run

# Force renewal
docker-compose restart certbot
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Domain Not Resolving
```bash
# Test DNS resolution
nslookup prod.xians.ai
nslookup api.prod.xians.ai

# Check from external location
dig @8.8.8.8 prod.xians.ai
```

#### 2. Certificate Generation Failed
```bash
# Check Certbot logs
docker-compose logs certbot

# Verify domain is accessible
curl -I http://prod.xians.ai/.well-known/acme-challenge/test

# Test with staging first
./setup-production-https.sh --staging
```

#### 3. Nginx Configuration Issues
```bash
# Test Nginx configuration
docker exec xiansai-nginx nginx -t

# Check Nginx logs
docker-compose logs nginx

# Reload configuration
docker exec xiansai-nginx nginx -s reload
```

#### 4. Services Not Accessible
```bash
# Check if XiansAi services are running
docker ps | grep xians

# Test internal connectivity
docker exec xiansai-nginx curl -I http://xiansai-ui:8080
docker exec xiansai-nginx curl -I http://xiansai-server:8080
```

### Log Locations
- **Nginx Access**: `nginx_logs` volume
- **Nginx Error**: `nginx_logs` volume  
- **Certbot**: `certbot/logs/` directory
- **SSL Certificates**: `certbot/conf/` directory

## 📁 Directory Structure

```
nginx/
├── .env                          # Configuration file
├── .env.example                  # Configuration template
├── docker-compose.yml            # Docker services
├── nginx.conf                    # Main Nginx config
├── setup-production-https.sh     # Setup script
├── conf.d/
│   └── xiansai.conf.template     # Site configuration template
├── certbot/
│   ├── conf/                     # SSL certificates
│   ├── www/                      # ACME challenge files
│   └── logs/                     # Certbot logs
└── ssl/                          # Legacy SSL directory
```

## 🚀 Advanced Usage

### Custom Rate Limits
```bash
# Edit .env file
RATE_LIMIT_API=50  # Increase API rate limit
RATE_LIMIT_UI=20   # Increase UI rate limit

# Restart to apply changes
docker-compose restart nginx
```

### IP Restrictions for Temporal UI
Edit `nginx/conf.d/xiansai.conf.template`:
```nginx
# Temporal UI (Admin Interface)
server {
    # ... existing config ...
    
    # Restrict to specific IPs
    allow 192.168.1.0/24;  # Office network
    allow 10.0.0.0/8;      # Private networks
    deny all;
    
    # ... rest of config ...
}
```

### Custom Security Headers
Edit `nginx/nginx.conf` to add custom headers:
```nginx
# Add custom security header
add_header X-Custom-Header "XiansAi-Secured" always;
```

## 📞 Support

For issues related to the Nginx setup:
1. Check the troubleshooting section above
2. Review logs with `docker-compose logs`
3. Test configuration with `./setup-production-https.sh --check`
4. Use staging mode for testing: `./setup-production-https.sh --staging`

For XiansAi application issues, refer to the main project documentation.
