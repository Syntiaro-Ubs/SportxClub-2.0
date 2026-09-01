#!/bin/bash
set -e

echo "======================================"
echo "Starting deployment of SportxClub-2.0"
echo "======================================"

# 1. Setup Directory
mkdir -p /var/www
cd /var/www
if [ -d "sportxclub" ]; then
    echo "Directory exists, pulling latest changes..."
    cd sportxclub
    git stash
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/Syntiaro-Ubs/SportxClub-2.0.git sportxclub
    cd sportxclub
fi

# 2. Database Setup
echo "Configuring MySQL Database..."
mysql -e "CREATE DATABASE IF NOT EXISTS sportxclub; CREATE USER IF NOT EXISTS 'sportxclub'@'localhost' IDENTIFIED BY 'SportxClub@2026'; GRANT ALL PRIVILEGES ON sportxclub.* TO 'sportxclub'@'localhost'; FLUSH PRIVILEGES;"

# 3. Environment Variables
echo "Creating .env files..."
cat << 'ENVE' > server/.env
PORT=5000
DB_HOST=localhost
DB_USER=sportxclub
DB_PASSWORD=SportxClub@2026
DB_NAME=sportxclub
DB_PORT=3306
JWT_SECRET=sportxclub_jwt_secret_key_2026
NODE_ENV=production
APP_BACKEND_URL=https://sportxclub.com
APP_FRONTEND_URL=https://sportxclub.com
ENVE

cat << 'ENVE' > .env
VITE_API_URL=https://sportxclub.com
VITE_SITE_URL=https://sportxclub.com
VITE_APP_NAME=SportXClub
ENVE

# 4. Dependencies and Build
echo "Building Frontend..."
if ! command -v npm &> /dev/null
then
    echo "Node.js could not be found, installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

npm install
npm run build

echo "Setting up Backend..."
cd server
npm install
npm install -g pm2
pm2 stop sportxclub || true
pm2 start server.js --name "sportxclub"
pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root || true

# 5. Nginx config
echo "Configuring Nginx..."
cat << 'NGINX' > /etc/nginx/sites-available/sportxclub.com.conf
server {
    listen 80;
    server_name sportxclub.com www.sportxclub.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/sportxclub.com.conf /etc/nginx/sites-enabled/
systemctl restart nginx

echo "======================================"
echo "Deployment Completed Successfully!"
echo "Your app is running on port 5000 and proxied via Nginx."
echo "======================================"
