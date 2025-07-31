# XiansAi Platform Community Edition - Troubleshooting Guide

This guide covers common issues you might encounter when setting up and running the XiansAi Platform Community Edition, along with their solutions.

## 📋 Quick Diagnosis

### 1. Check Service Status
```bash
# Check all running containers
docker ps

# Check all containers (including stopped ones)
docker ps -a

# Check service health
docker compose ps
```

### 2. Check Service Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs xians-server
docker compose logs keycloak
docker compose logs postgresql
docker compose logs xians-mongodb

# Follow logs in real-time
docker compose logs -f
```

### 3. Check Network Status
```bash
# List Docker networks
docker network ls

# Inspect the project network
docker network inspect xians-community-edition-network
```

## 🚨 Common Issues and Solutions

### Issue 1: Container Name Conflicts

**Symptoms:**
```
Error response from daemon: Conflict. The container name "/xians-mongodb" is already in use by container "abc123..."
```

**Cause:** Previous containers with the same names are still present.

**Solution:**
```bash
# Stop all related containers
docker stop xians-mongodb xians-server xians-ui keycloak postgresql temporal temporal-ui

# Remove the containers
docker rm xians-mongodb xians-server xians-ui keycloak postgresql temporal temporal-ui

# Restart the platform
./start-all.sh
```

**Prevention:** Always use `./stop-all.sh` before starting services, or use `./reset-all.sh` for a clean slate.

### Issue 2: Port Already in Use

**Symptoms:**
```
Error starting userland proxy: listen tcp 0.0.0.0:27017: bind: address already in use
```

**Cause:** Another service is using the required port.

**Solution:**
```bash
# Check what's using the port
lsof -i :27017
lsof -i :5432
lsof -i :18080
lsof -i :3001
lsof -i :5001

# Stop the conflicting service
sudo kill -9 <PID>

# Or change the port in docker-compose.yml
```

**Alternative:** Modify the port mapping in the respective `docker-compose.yml` file.

### Issue 3: Environment Variable Not Set

**Symptoms:**
```
The "POSTGRESQL_VERSION" variable is not set. Defaulting to a blank string.
unable to get image 'postgres:': Error response from daemon: invalid reference format
```

**Cause:** Missing `.env.local` file or environment variable. The community edition should include `.env.local` files with all necessary configuration.

**Solution:**
```bash
# Check if .env.local files exist
ls -la postgresql/.env.local keycloak/.env.local

# If missing, create them from examples
cd postgresql && cp .env.example .env.local && cd ..
cd keycloak && cp .env.example .env.local && cd ..

# Restart services
./start-all.sh
```

**Note:** The community edition should include `.env.local` files. If they're missing, you may need to re-clone the repository or check if they were accidentally deleted.

### Issue 4: Docker Network Issues

**Symptoms:**
```
WARN[0000] a network with name xians-community-edition-network exists but was not created for project "xians-community-edition".
```

**Cause:** Network was created by a different project or previous run.

**Solution:**
```bash
# This is usually just a warning, not an error
# If you want to clean up networks:
docker network prune

# Or remove the specific network:
docker network rm xians-community-edition-network
```

### Issue 5: Service Health Check Failures

**Symptoms:**
- Services show as "unhealthy" in `docker ps`
- Services restart repeatedly
- Application doesn't respond

**Diagnosis:**
```bash
# Check specific service logs
docker compose logs xians-server
docker compose logs keycloak
docker compose logs postgresql

# Check health status
docker inspect xians-server | grep -A 10 "Health"
```

**Common Solutions:**

#### MongoDB Health Issues
```bash
# Test MongoDB connection
mongosh --eval "db.adminCommand('ping')" --quiet

# If mongosh not installed:
brew install mongosh  # macOS
# or
sudo apt-get install mongodb-mongosh  # Ubuntu
```

#### PostgreSQL Health Issues
```bash
# Test PostgreSQL connection
docker exec postgresql pg_isready -U temporal

# Check PostgreSQL logs
docker logs postgresql
```

#### Keycloak Health Issues
```bash
# Check Keycloak health endpoint
curl http://localhost:18080/health/ready

# Wait for Keycloak to fully start (can take 2-3 minutes)
docker logs keycloak | grep "started"
```

### Issue 6: Memory Issues

**Symptoms:**
- Services fail to start
- Docker Desktop crashes
- "Out of memory" errors

**Solution:**
1. **Increase Docker Desktop memory:**
   - Open Docker Desktop
   - Go to Settings → Resources → Advanced
   - Increase memory to 8GB+ (16GB recommended)

2. **Close other applications** to free up RAM

3. **Restart Docker Desktop**

4. **Check system memory:**
```bash
# macOS
top -l 1 | grep PhysMem

# Linux
free -h
```

### Issue 7: API Key Issues

**Symptoms:**
- Server fails to start
- Authentication errors in logs
- "Invalid API key" messages

**Solution:**
```bash
# Check if API key is set
cd server
cat .env.local

# If missing or incorrect, edit the existing file:
# Find the line: Llm__ApiKey=
# Replace it with: Llm__ApiKey=your-actual-openai-api-key

# Or use sed to set it automatically:
sed -i '' 's/Llm__ApiKey=/Llm__ApiKey=your-actual-openai-api-key/' .env.local

# Restart the server
docker compose restart xians-server
```

**Get an OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key and add it to `server/.env.local`

### Issue 8: Volume Permission Issues

**Symptoms:**
```
Error response from daemon: failed to create shim: OCI runtime create failed
```

**Solution:**
```bash
# Clean up volumes
docker volume prune

# Or remove specific volumes
docker volume rm postgresql-data keycloak-data

# Restart services
./start-all.sh
```

### Issue 9: Image Pull Failures

**Symptoms:**
```
Error response from daemon: manifest for 99xio/xiansai-server:latest not found
```

**Solution:**
```bash
# Pull images manually
docker pull 99xio/xiansai-server:latest
docker pull 99xio/xiansai-ui:latest

# Or pull all images
docker compose pull

# Check available tags
docker search 99xio/xiansai-server
```

### Issue 10: Slow Startup Times

**Symptoms:**
- Services take a long time to start
- Health checks timeout

**Solutions:**
1. **Increase Docker resources:**
   - More CPU cores
   - More memory
   - Faster disk (SSD recommended)

2. **Use specific image versions:**
```bash
./start-all.sh -v v2.1.0
```

3. **Start services individually:**
```bash
# Start databases first
cd postgresql && docker compose up -d
cd ../keycloak && docker-compose --env-file .env.local up -d

# Then start main services
cd .. && docker compose up -d
```

## 🔧 Advanced Troubleshooting

### Debugging Service Dependencies

**Check service startup order:**
```bash
# Start services in dependency order
cd postgresql && docker compose up -d
sleep 10
cd ../keycloak && docker-compose --env-file .env.local up -d
sleep 30
cd ../temporal && docker compose up -d
sleep 10
cd .. && docker compose up -d
```

### Debugging Network Connectivity

**Test inter-service communication:**
```bash
# Test from server to MongoDB
docker exec xians-server ping xians-mongodb

# Test from server to Keycloak
docker exec xians-server ping keycloak

# Check network configuration
docker network inspect xians-community-edition-network
```

### Debugging Configuration Issues

**Check environment variables:**
```bash
# Check all environment variables
docker exec xians-server env

# Check specific service config
docker exec postgresql env | grep POSTGRES
docker exec keycloak env | grep KEYCLOAK
```

### Performance Issues

**Monitor resource usage:**
```bash
# Check container resource usage
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## 🆘 Getting Help

### Before Asking for Help

1. **Collect information:**
```bash
# System information
docker --version
docker compose version
uname -a

# Service status
docker ps -a
docker compose logs

# Network information
docker network ls
docker network inspect xians-community-edition-network
```

2. **Check existing issues:**
   - Search GitHub Issues for similar problems
   - Check the documentation

3. **Create a detailed report:**
   - Include error messages
   - Include system information
   - Include logs
   - Describe steps to reproduce

### Where to Get Help

1. **GitHub Issues**: For bug reports and feature requests
2. **GitHub Discussions**: For questions and community help
3. **Documentation**: Check this guide and other docs first

### Creating Good Bug Reports

**Include:**
- **Error message**: Exact error text
- **Steps to reproduce**: Step-by-step instructions
- **System information**: OS, Docker version, etc.
- **Logs**: Relevant service logs
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens

**Example:**
```
**Error**: Container xians-server fails to start
**Steps**: 
1. Run ./start-all.sh
2. Check docker ps
3. See xians-server is not running

**System**: macOS 13.0, Docker Desktop 4.15.0
**Logs**: [paste relevant logs here]
**Expected**: All services should start successfully
**Actual**: xians-server container exits with code 1
```

## 🔄 Recovery Procedures

### Complete Reset
```bash
# Stop everything
./stop-all.sh

# Remove all containers and volumes
./reset-all.sh -f

# Start fresh
./start-all.sh
```

### Partial Reset
```bash
# Stop specific service
docker compose stop xians-server

# Remove and recreate
docker compose rm xians-server
docker compose up -d xians-server
```

### Data Recovery
```bash
# Backup before reset
docker exec postgresql pg_dump -U temporal keycloak > backup.sql
docker exec xians-mongodb mongodump --out /backup

# Restore after reset
docker exec -i postgresql psql -U temporal keycloak < backup.sql
```

---

**Remember**: Most issues can be resolved by checking logs and following the troubleshooting steps above. If you're still having problems, create a detailed issue report with all the information requested. 