#!/bin/bash

# =============================================================================
# Info-Hub Local Development Launcher
# =============================================================================
# This script is the local equivalent of deploy.sh.
# Instead of PM2 + Nginx (production tooling), it uses:
#   - `npm run dev`  → Next.js development server  (http://localhost:3000)
#   - `npx serve`   → Static docs server           (http://localhost:3002)
#
# Both processes run in the background and are tracked via PID files so that
# this script can be safely re-run to restart everything cleanly.
#
# Usage:
#   chmod +x deploy-local.sh
#   ./deploy-local.sh
#
# To stop all running processes:
#   ./deploy-local.sh stop
# =============================================================================

# --- Configuration -----------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # Directory this script lives in
PROJECT_DIR="$SCRIPT_DIR"                                    # Next.js app root (info-hub/)
DOCS_SITE_DIR="$SCRIPT_DIR/../docs/infohub-mkdocs/site"     # Pre-built MkDocs static site
DOCS_SOURCE_DIR="$SCRIPT_DIR/../docs/infohub-mkdocs"        # MkDocs source (for rebuilding)

APP_PORT=3000
DOCS_PORT=3002

PID_DIR="$SCRIPT_DIR/.pids"
APP_PID_FILE="$PID_DIR/app.pid"
DOCS_PID_FILE="$PID_DIR/docs.pid"

LOG_DIR="$SCRIPT_DIR/.logs"
APP_LOG="$LOG_DIR/app.log"
DOCS_LOG="$LOG_DIR/docs.log"
# -----------------------------------------------------------------------------

# Helper: print a section divider
divider() {
    echo "------------------------------------------"
}

# Helper: check if a PID from a file is still a running process
is_running() {
    local pid_file="$1"
    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            return 0  # Running
        fi
    fi
    return 1  # Not running
}

# Helper: kill a process tracked by a PID file
stop_process() {
    local pid_file="$1"
    local name="$2"
    if is_running "$pid_file"; then
        local pid
        pid=$(cat "$pid_file")
        echo "🛑 Stopping $name (PID $pid)..."
        kill "$pid" 2>/dev/null
        # Wait up to 5 seconds for it to exit
        for i in {1..5}; do
            sleep 1
            kill -0 "$pid" 2>/dev/null || break
        done
        # Force kill if still alive
        kill -9 "$pid" 2>/dev/null
        rm -f "$pid_file"
        echo "✅ $name stopped."
    else
        echo "⚠️  $name is not running (no active PID found)."
        rm -f "$pid_file"
    fi
}

# =============================================================================
# STOP COMMAND
# =============================================================================
if [ "$1" == "stop" ]; then
    divider
    echo " Info-Hub Local Shutdown"
    divider
    stop_process "$APP_PID_FILE" "Next.js App"
    stop_process "$DOCS_PID_FILE" "Documentation Server"
    divider
    echo "  All Info-Hub processes stopped."
    divider
    exit 0
fi

# =============================================================================
# START / RESTART
# =============================================================================
divider
echo " Info-Hub Local Launcher Started"
divider

# Create PID and log directories
mkdir -p "$PID_DIR" "$LOG_DIR"

# Navigate to the Next.js app directory
cd "$PROJECT_DIR" || { echo "❌ Error: Could not find project directory at $PROJECT_DIR"; exit 1; }

# --- Step 1: Dependency Check ------------------------------------------------
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed."
else
    echo "❌ Error: npm install failed."
    exit 1
fi

# --- Step 2: Database Schema Sync (Drizzle) ----------------------------------
echo "🗄️  Syncing Drizzle Schema with PostgreSQL..."
if npx drizzle-kit push; then
    echo "✅ Database schema is up to date."
else
    echo "❌ Error: Drizzle push failed. Check your DATABASE_URL in .env.local and ensure PostgreSQL is running."
    exit 1
fi

# --- Step 3: Stop any previously launched processes --------------------------
echo "🔄 Checking for previously running Info-Hub processes..."
if is_running "$APP_PID_FILE"; then
    stop_process "$APP_PID_FILE" "Next.js App"
fi
if is_running "$DOCS_PID_FILE"; then
    stop_process "$DOCS_PID_FILE" "Documentation Server"
fi

# --- Step 4: Launch Next.js Development Server -------------------------------
echo "🚀 Starting Next.js development server on port $APP_PORT..."
nohup npm run dev > "$APP_LOG" 2>&1 &
APP_PID=$!
echo $APP_PID > "$APP_PID_FILE"

# Brief wait to catch immediate startup failures
sleep 3
if ! is_running "$APP_PID_FILE"; then
    echo "❌ Error: Next.js failed to start. Check logs at: $APP_LOG"
    exit 1
fi
echo "✅ Next.js app is running (PID $APP_PID). Logs: $APP_LOG"

# --- Step 5: Documentation Server --------------------------------------------
echo "📚 Processing MkDocs Documentation..."

# Check if the pre-built static site exists
if [ -d "$DOCS_SITE_DIR" ] && [ -f "$DOCS_SITE_DIR/index.html" ]; then
    echo "✅ Pre-built documentation site found. Skipping rebuild."
elif [ -f "$DOCS_SOURCE_DIR/mkdocs.yml" ]; then
    # Attempt to build from source if mkdocs is available
    echo "⚠️  No pre-built site found. Attempting to build from source..."
    if command -v mkdocs &>/dev/null; then
        cd "$DOCS_SOURCE_DIR" || { echo "❌ Error: Could not access docs directory."; exit 1; }
        if mkdocs build; then
            echo "✅ MkDocs site built successfully."
        else
            echo "❌ Error: MkDocs build failed. Check that mkdocs and mkdocs-material are installed."
            echo "   Install with: pip3 install \"mkdocs<2.0\" mkdocs-material pymdown-extensions"
            cd "$PROJECT_DIR"
            exit 1
        fi
        cd "$PROJECT_DIR"
    else
        echo "❌ Error: mkdocs command not found and no pre-built site exists."
        echo "   Either install MkDocs (pip3 install \"mkdocs<2.0\" mkdocs-material pymdown-extensions)"
        echo "   or serve the pre-built site from: $DOCS_SITE_DIR"
        exit 1
    fi
else
    echo "⚠️  Notice: No docs site or mkdocs.yml found. Skipping documentation server."
    DOCS_SKIPPED=true
fi

if [ -z "$DOCS_SKIPPED" ]; then
    echo "📖 Starting documentation server on port $DOCS_PORT..."
    nohup npx serve "$DOCS_SITE_DIR" -l $DOCS_PORT > "$DOCS_LOG" 2>&1 &
    DOCS_PID=$!
    echo $DOCS_PID > "$DOCS_PID_FILE"

    # Brief wait to catch immediate startup failures
    sleep 2
    if ! is_running "$DOCS_PID_FILE"; then
        echo "❌ Error: Documentation server failed to start. Check logs at: $DOCS_LOG"
    else
        echo "✅ Documentation server is running (PID $DOCS_PID). Logs: $DOCS_LOG"
    fi
fi

# --- Done --------------------------------------------------------------------
divider
echo "  Local Launch Complete!"
echo ""
echo "  App:           http://localhost:$APP_PORT"
if [ -z "$DOCS_SKIPPED" ]; then
echo "  Documentation: http://localhost:$DOCS_PORT"
fi
echo ""
echo "  Logs:"
echo "    Next.js: $APP_LOG"
if [ -z "$DOCS_SKIPPED" ]; then
echo "    Docs:    $DOCS_LOG"
fi
echo ""
echo "  To stop all processes, run:"
echo "    ./deploy-local.sh stop"
divider