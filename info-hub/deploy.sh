#!/bin/bash

# Configuration
PROJECT_DIR="/root/info-hub/info-hub"
DOCS_DIR="/root/info-hub/docs/infohub-mkdocs"
ECOSYSTEM_FILE="ecosystem.config.js"
DOCS_PORT="3005"  # FIXED: PM2 runs internally on 3005; Nginx serves it publicly on 3002
DOCS_NAME="infohub-docs"
IP_ADDRESS="172.1.87.204"

echo "------------------------------------------"
echo " Info-Hub Deployment Script Started"
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

# 5. Documentation Build & PM2 Deployment (Internal Port 3005)
echo "📚 Processing MkDocs Documentation..."
if [ -f "$DOCS_DIR/mkdocs.yml" ]; then
    # Temporarily navigate to the sibling documentation directory to build
    cd "$DOCS_DIR" || { echo "❌ Error: Failed to access docs directory"; exit 1; }
    
    if mkdocs build; then
        echo "✅ MkDocs static site built successfully."
        
        # Return to main project directory context
        cd "$PROJECT_DIR"
        
        # Check if the PM2 docs process is already running
        if pm2 describe $DOCS_NAME &> /dev/null; then
            echo "🔄 Reloading documentation process in PM2..."
            pm2 reload $DOCS_NAME
            echo "✅ Documentation process reloaded."
        else
            echo "⚠️  Documentation instance not found in PM2. Spinning up a fresh container..."
            # Using $(which serve) with -l to bind PM2 to internal port 3005
            if pm2 start $(which serve) --name "$DOCS_NAME" -- -l $DOCS_PORT "$DOCS_DIR/site"; then
                echo "✅ Documentation is now live internally on port $DOCS_PORT."
            else
                echo "❌ Error: Failed to start PM2 serving engine for documentation."
            fi
        fi
    else
        echo "❌ Error: MkDocs build execution failed."
        cd "$PROJECT_DIR" # Ensure safe return even on failure
    fi
else
    echo "⚠️  Notice: 'mkdocs.yml' not found at $DOCS_DIR/mkdocs.yml yet. Skipping documentation deployment step."
    cd "$PROJECT_DIR"
fi

# 6. Nginx & Infrastructure Health Check
echo "🔒 Verifying Nginx and Permissions..."
nginx -t &> /dev/null
if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo "✅ Nginx restarted successfully."
else
    echo "❌ Error: Nginx configuration is invalid! Run 'nginx -t' for details."
fi

# 7. Ensure SELinux and NFS permissions are set
setsebool -P httpd_use_nfs 1 &> /dev/null
restorecon -v -R /etc/pki/nginx &> /dev/null

echo "------------------------------------------------------------------"
echo "  Deployment Complete! "
echo "  Primary App Running:  https://$IP_ADDRESS:3000"
echo "  Documentation Target: https://$IP_ADDRESS:3002"
echo "------------------------------------------------------------------"
pm2 list