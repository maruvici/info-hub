#!/bin/bash

# Configuration
PROJECT_DIR="/root/ssi-info-hub/info-hub"
ECOSYSTEM_FILE="ecosystem.config.js"

echo "------------------------------------------"
echo " SSI Info-Hub Deployment Script Started"
echo "------------------------------------------"

cd $PROJECT_DIR || { echo "❌ Error: Could not find project directory"; exit 1; }

# 1. Dependency Check
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed."
else
    echo "❌ Error: npm install failed."
    exit 1
fi

# 2. Database Schema Sync (Drizzle)
echo "🗄️  Syncing Drizzle Schema with PostgreSQL..."
if npx drizzle-kit push; then
    echo "✅ Database schema is up to date."
else
    echo "❌ Error: Drizzle push failed. Check your DB connection."
    exit 1
fi

# 3. The Build Phase
echo "🏗️  Starting Next.js Production Build (Turbopack)..."
if npm run build; then
    echo "✅ Build successful."
else
    echo "❌ Error: Build failed. Check the panic logs in /tmp/."
    exit 1
fi

# 4. PM2 Cluster Reload (Zero-Downtime)
echo "🔄 Reloading PM2 Cluster..."
if pm2 reload $ECOSYSTEM_FILE; then
    echo "✅ PM2 cluster instances reloaded."
else
    echo "⚠️  PM2 reload failed. Attempting fresh start..."
    pm2 start $ECOSYSTEM_FILE
fi

# 5. Nginx & Infrastructure Health Check
echo "🔒 Verifying Nginx and Permissions..."
nginx -t &> /dev/null
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "✅ Nginx restarted."
else
    echo "❌ Error: Nginx configuration is invalid! Run 'nginx -t' for details."
fi

# 6. Ensure SELinux and NFS permissions are set
setsebool -P httpd_use_nfs 1 &> /dev/null
restorecon -v -R /etc/pki/nginx &> /dev/null

echo "------------------------------------------------------------------"
echo "  Deployment Complete! App is live at https://172.1.87.204:3000   "
echo "------------------------------------------------------------------"
pm2 list