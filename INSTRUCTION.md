# VPS Setup Guide for K3s Backend API

This guide provides step-by-step instructions to set up the K3s Backend API project on a VPS (Virtual Private Server).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Installing K3s](#installing-k3s)
4. [Installing Node.js](#installing-nodejs)
5. [Deploying the Application](#deploying-the-application)
6. [Running as a Service](#running-as-a-service)
7. [Nginx Reverse Proxy (Optional)](#nginx-reverse-proxy-optional)
8. [SSL Certificate with Let's Encrypt](#ssl-certificate-with-lets-encrypt)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A VPS with Ubuntu 20.04/22.04 or Debian 11+ (minimum 2GB RAM, 2 vCPU recommended)
- Root or sudo access
- A domain name (optional, for production)
- SSH access to your VPS

---

## VPS Initial Setup

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### 2. Update System Packages

```bash
apt update && apt upgrade -y
```

### 3. Create a Non-Root User (Recommended)

```bash
adduser deploy
usermod -aG sudo deploy
```

Switch to the new user:
```bash
su - deploy
```

### 4. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # API port
sudo ufw allow 6443/tcp  # K3s API server
sudo ufw enable
```

---

## Installing K3s

K3s is a lightweight Kubernetes distribution perfect for VPS deployment.

### 1. Install K3s

```bash
curl -sfL https://get.k3s.io | sh -
```

### 2. Verify Installation

```bash
sudo k3s kubectl get nodes
```

You should see your node in `Ready` status:
```
NAME       STATUS   ROLES                  AGE   VERSION
your-vps   Ready    control-plane,master   1m    v1.28.x+k3s1
```

### 3. Configure kubectl for Non-Root User

```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
chmod 600 ~/.kube/config
```

### 4. Set KUBECONFIG Environment Variable

Add to your `~/.bashrc` or `~/.zshrc`:
```bash
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc
source ~/.bashrc
```

### 5. Verify kubectl Works

```bash
kubectl get nodes
kubectl get pods -A
```

---

## Installing Node.js

### Option A: Using NodeSource (Recommended)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Option B: Using NVM (Node Version Manager)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 20
nvm use 20
nvm alias default 20
```

### Verify Node.js Installation

```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

---

## Deploying the Application

### 1. Clone the Repository

```bash
cd ~
git clone https://github.com/your-username/test-k3s.git
cd test-k3s
```

Or if uploading manually via SCP:
```bash
# From your local machine
scp -r /path/to/test-k3s deploy@your-vps-ip:~/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
npm run build
```

### 4. Test the Application

```bash
npm start
```

Open a new terminal and test:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

### 5. Test K3s Integration

```bash
# List namespaces via API
curl http://localhost:3000/api/namespaces

# List pods
curl http://localhost:3000/api/pods
```

---

## Running as a Service

### Using PM2 (Recommended)

#### 1. Install PM2 Globally

```bash
sudo npm install -g pm2
```

#### 2. Start the Application with PM2

```bash
cd ~/test-k3s
pm2 start dist/app.js --name k3s-api
```

#### 3. Configure PM2 to Start on Boot

```bash
pm2 startup systemd
# Run the command that PM2 outputs

pm2 save
```

#### 4. PM2 Useful Commands

```bash
pm2 status          # Check status
pm2 logs k3s-api    # View logs
pm2 restart k3s-api # Restart app
pm2 stop k3s-api    # Stop app
pm2 delete k3s-api  # Remove from PM2
```

---

### Alternative: Using systemd Service

#### 1. Create a systemd Service File

```bash
sudo nano /etc/systemd/system/k3s-api.service
```

Add the following content:
```ini
[Unit]
Description=K3s Backend API
After=network.target k3s.service
Wants=k3s.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/test-k3s
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=KUBECONFIG=/home/deploy/.kube/config
ExecStart=/usr/bin/node dist/app.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 2. Enable and Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable k3s-api
sudo systemctl start k3s-api
```

#### 3. Check Service Status

```bash
sudo systemctl status k3s-api
```

#### 4. View Logs

```bash
sudo journalctl -u k3s-api -f
```

---

## Nginx Reverse Proxy (Optional)

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/k3s-api
```

Add the following:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or VPS IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable the Configuration

```bash
sudo ln -s /etc/nginx/sites-available/k3s-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate with Let's Encrypt

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

### 3. Auto-Renewal Test

```bash
sudo certbot renew --dry-run
```

---

## Environment Variables

Create a `.env` file for environment-specific configurations:

```bash
# /home/deploy/test-k3s/.env
PORT=3000
KUBECONFIG=/home/deploy/.kube/config
NODE_ENV=production
```

---

## Troubleshooting

### K3s Issues

**Check K3s Service Status:**
```bash
sudo systemctl status k3s
```

**View K3s Logs:**
```bash
sudo journalctl -u k3s -f
```

**Reset K3s (if needed):**
```bash
/usr/local/bin/k3s-uninstall.sh
# Then reinstall
curl -sfL https://get.k3s.io | sh -
```

### Application Issues

**Check if Port is in Use:**
```bash
sudo lsof -i :3000
```

**Check Node.js Permissions:**
```bash
# Ensure KUBECONFIG is readable
ls -la ~/.kube/config
```

**Test Kubernetes Connection:**
```bash
kubectl cluster-info
kubectl get all -A
```

### Common Errors

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | K3s is not running. Start with `sudo systemctl start k3s` |
| `Forbidden` | Check KUBECONFIG permissions |
| `Port already in use` | Kill the process using `sudo kill $(sudo lsof -t -i:3000)` |

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `kubectl get nodes` | List K3s nodes |
| `kubectl get pods -A` | List all pods |
| `pm2 status` | Check PM2 processes |
| `pm2 logs k3s-api` | View application logs |
| `sudo systemctl status k3s` | Check K3s status |

---

## Security Recommendations

1. **Change default SSH port** and disable root login
2. **Use API authentication** for production deployments
3. **Enable HTTPS** with valid SSL certificates
4. **Regular updates**: `apt update && apt upgrade -y`
5. **Monitor logs** for suspicious activity

---

## Next Steps

After successful setup:

1. Create your first pod:
   ```bash
   curl -X POST http://localhost:3000/api/pods \
     -H "Content-Type: application/json" \
     -d '{"name": "test-nginx", "namespace": "default", "image": "nginx:alpine"}'
   ```

2. Create a service for the pod
3. Create an ingress for domain assignment

Refer to the [README.md](./README.md) for complete API documentation.
