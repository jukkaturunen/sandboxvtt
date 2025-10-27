# SandboxVTT Deployment Guide

This guide covers deploying SandboxVTT to a DigitalOcean Ubuntu server.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a DigitalOcean Droplet](#creating-a-digitalocean-droplet)
3. [Initial Server Setup](#initial-server-setup)
4. [Application Deployment](#application-deployment)
5. [Configuration](#configuration)
6. [Accessing Your Application](#accessing-your-application)
7. [Optional: Nginx Setup](#optional-nginx-setup)
8. [Updating the Application](#updating-the-application)
9. [Monitoring and Logs](#monitoring-and-logs)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- DigitalOcean account
- Basic familiarity with SSH and command line
- Your SandboxVTT repository (Git)

## Creating a DigitalOcean Droplet

1. **Log in to DigitalOcean** and click "Create" → "Droplets"

2. **Choose Configuration:**
   - **Image:** Ubuntu 22.04 LTS (or later)
   - **Plan:** Basic
   - **CPU Options:** Regular (shared CPU)
   - **Size:**
     - Minimum: $6/month (1GB RAM, 1 CPU)
     - Recommended: $12/month (2GB RAM, 1 CPU) for better performance
   - **Datacenter:** Choose closest to your users
   - **Authentication:** SSH keys (recommended) or password
   - **Hostname:** sandboxvtt (or your preference)

3. **Create the droplet** and note the IP address once it's ready

4. **SSH into your server:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

## Initial Server Setup

### Step 1: Create a Non-Root User (Recommended)

```bash
# Create a new user
adduser sandboxvtt

# Grant sudo privileges
usermod -aG sudo sandboxvtt

# Switch to the new user
su - sandboxvtt
```

### Step 2: Run the Setup Script

```bash
# Create the application directory
sudo mkdir -p /var/www/sandboxvtt
sudo chown -R $USER:$USER /var/www/sandboxvtt
cd /var/www/sandboxvtt

# Clone your repository
git clone <your-repository-url> .

# Make the setup script executable
chmod +x deploy/setup.sh

# Run the setup script
bash deploy/setup.sh
```

The setup script will:
- Install Node.js (LTS version)
- Install PM2 process manager
- Install git and nginx
- Create necessary directories
- Configure firewall (UFW)
- Set up PM2 to start on system boot

## Application Deployment

### Step 1: Configure Environment Variables

```bash
# Copy the production environment template
cp .env.production .env

# Edit the .env file with your settings
nano .env
```

**Update these values in `.env`:**

```bash
# Set to production
NODE_ENV=production

# Choose your port (default 8080)
PORT=8080

# Your DigitalOcean droplet IP address
SERVER_IP=123.45.67.89

# Public port (should match PORT)
PUBLIC_CLIENT_PORT=8080

# Database path (use absolute path for production)
DATABASE_PATH=/var/www/sandboxvtt/server/database.sqlite
```

Save the file (Ctrl+X, then Y, then Enter in nano).

### Step 2: Deploy the Application

```bash
# Make the deployment script executable
chmod +x deploy/deploy.sh

# Run the deployment script
bash deploy/deploy.sh
```

The deployment script will:
1. Install server dependencies
2. Install client dependencies
3. Build the React client application
4. Start the application with PM2
5. Save the PM2 process list for auto-restart

## Configuration

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `8080` |
| `SERVER_IP` | Your server's IP address | `123.45.67.89` |
| `PUBLIC_CLIENT_PORT` | Port users access | `8080` |
| `DATABASE_PATH` | SQLite database location | `/var/www/sandboxvtt/server/database.sqlite` |

### Port Configuration

By default, the application runs on port **8080**. You can change this by:

1. Edit `.env` and update both `PORT` and `PUBLIC_CLIENT_PORT`
2. Update firewall: `sudo ufw allow YOUR_PORT/tcp`
3. Redeploy: `bash deploy/deploy.sh`

## Accessing Your Application

Once deployed, your application will be accessible at:

```
http://YOUR_SERVER_IP:YOUR_PORT
```

Example: `http://123.45.67.89:8080`

### Testing the Deployment

1. **Check if the server is running:**
   ```bash
   pm2 status
   ```
   You should see `sandboxvtt` with status "online"

2. **Test the health endpoint:**
   ```bash
   curl http://localhost:8080/api/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

3. **Open in browser:**
   Navigate to `http://YOUR_SERVER_IP:8080`

## Optional: Nginx Setup

If you want to serve your application on port 80 (standard HTTP port) instead of 8080:

### Step 1: Configure Nginx

```bash
# Edit the nginx config with your server IP and app port
nano deploy/nginx.conf

# Update these lines:
# - server_name YOUR_SERVER_IP;  (line 18)
# - proxy_pass http://localhost:8080;  (lines 29 and 45)
```

### Step 2: Install the Configuration

```bash
# Copy nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/sandboxvtt

# Enable the site
sudo ln -s /etc/nginx/sites-available/sandboxvtt /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 3: Update Environment Variables

```bash
# Edit .env to use port 80
nano .env

# Change:
PUBLIC_CLIENT_PORT=80

# Keep PORT=8080 (nginx proxies from 80 to 8080)
```

### Step 4: Restart the Application

```bash
pm2 restart sandboxvtt
```

Now your application will be accessible at `http://YOUR_SERVER_IP` (no port needed).

## Updating the Application

When you have new code changes:

### Method 1: Pull and Redeploy

```bash
cd /var/www/sandboxvtt
git pull origin main
bash deploy/deploy.sh
```

### Method 2: Manual Process

```bash
cd /var/www/sandboxvtt
git pull origin main
npm install --omit=dev
cd client && npm install && cd ..
npm run build
pm2 restart sandboxvtt
```

## Monitoring and Logs

### PM2 Commands

```bash
# View application status
pm2 status

# View real-time logs
pm2 logs sandboxvtt

# View last 100 lines of logs
pm2 logs sandboxvtt --lines 100

# Monitor CPU and memory usage
pm2 monit

# Restart the application
pm2 restart sandboxvtt

# Stop the application
pm2 stop sandboxvtt

# View detailed information
pm2 show sandboxvtt
```

### Log Files

Logs are stored in `/var/www/sandboxvtt/logs/`:
- `out.log` - Standard output
- `err.log` - Error output
- `combined.log` - Combined logs

```bash
# View recent logs
tail -f /var/www/sandboxvtt/logs/out.log
tail -f /var/www/sandboxvtt/logs/err.log
```

### Nginx Logs (if using nginx)

```bash
# Access logs
sudo tail -f /var/log/nginx/sandboxvtt_access.log

# Error logs
sudo tail -f /var/log/nginx/sandboxvtt_error.log
```

## Troubleshooting

### Application Won't Start

1. **Check PM2 logs:**
   ```bash
   pm2 logs sandboxvtt --lines 50
   ```

2. **Verify .env file exists and is configured:**
   ```bash
   cat .env
   ```

3. **Check if port is already in use:**
   ```bash
   sudo lsof -i :8080
   ```

4. **Verify database file permissions:**
   ```bash
   ls -la /var/www/sandboxvtt/server/database.sqlite
   ```

### Can't Access the Application

1. **Check firewall rules:**
   ```bash
   sudo ufw status
   ```
   Make sure your port is allowed.

2. **Verify PM2 is running:**
   ```bash
   pm2 status
   ```

3. **Test locally on server:**
   ```bash
   curl http://localhost:8080/api/health
   ```

4. **If using nginx, check nginx status:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

### Database Issues

1. **Database file doesn't exist:**
   ```bash
   # The database is created automatically on first run
   # Check if the directory exists:
   ls -la /var/www/sandboxvtt/server/
   ```

2. **Permission issues:**
   ```bash
   # Ensure the server directory is writable
   chmod 755 /var/www/sandboxvtt/server
   ```

### Upload Issues

1. **Uploads directory doesn't exist:**
   ```bash
   mkdir -p /var/www/sandboxvtt/server/uploads
   chmod 755 /var/www/sandboxvtt/server/uploads
   ```

2. **Check disk space:**
   ```bash
   df -h
   ```

### WebSocket Connection Issues

1. **If using nginx, ensure WebSocket proxy is configured** (see [nginx.conf](deploy/nginx.conf))

2. **Check CORS settings** - verify SERVER_IP and PUBLIC_CLIENT_PORT in `.env`

3. **Check browser console** for connection errors

### Build Fails

1. **Clear node_modules and rebuild:**
   ```bash
   rm -rf node_modules client/node_modules
   npm install --omit=dev
   cd client && npm install && cd ..
   npm run build
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be LTS (v18 or v20+)
   ```

### Out of Memory

If the droplet runs out of memory:

1. **Add swap space:**
   ```bash
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. **Make it permanent:**
   ```bash
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

3. **Or upgrade your droplet** to one with more RAM

## Security Considerations

### Basic Security Measures

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use SSH keys** instead of passwords

3. **Configure fail2ban** (optional but recommended):
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Regular backups:**
   ```bash
   # Backup database
   cp /var/www/sandboxvtt/server/database.sqlite ~/backup-$(date +%Y%m%d).sqlite

   # Backup uploads
   tar -czf ~/uploads-backup-$(date +%Y%m%d).tar.gz /var/www/sandboxvtt/server/uploads
   ```

### Adding SSL (Optional - Future Enhancement)

For HTTPS support with Let's Encrypt (requires a domain name):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Performance Optimization

### For Small Servers (1GB RAM)

1. **Limit PM2 memory:**
   The ecosystem.config.js already limits to 1GB

2. **Enable PM2 memory monitoring:**
   ```bash
   pm2 install pm2-auto-pull
   ```

### Database Maintenance

```bash
# Optimize database periodically
sqlite3 /var/www/sandboxvtt/server/database.sqlite "VACUUM;"
```

## Support

For issues or questions:
- Check the [main README](README.md)
- Review server logs: `pm2 logs sandboxvtt`
- Check GitHub repository for updates

---

## Quick Reference

### Most Common Commands

```bash
# Deploy/Update
cd /var/www/sandboxvtt && git pull && bash deploy/deploy.sh

# View logs
pm2 logs sandboxvtt

# Restart
pm2 restart sandboxvtt

# Status
pm2 status

# Health check
curl http://localhost:8080/api/health
```

### File Locations

- Application: `/var/www/sandboxvtt/`
- Database: `/var/www/sandboxvtt/server/database.sqlite`
- Uploads: `/var/www/sandboxvtt/server/uploads/`
- Logs: `/var/www/sandboxvtt/logs/`
- Config: `/var/www/sandboxvtt/.env`