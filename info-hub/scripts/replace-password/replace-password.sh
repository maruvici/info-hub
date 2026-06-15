#!/bin/bash

set -e

# Grab the directory where this script actually lives
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

# Jump into the main info-hub directory so paths and configs resolve natively
cd "$SCRIPT_DIR/../.."

TARGET_EMAIL="$1"
NEW_PASSWORD="$2"

if [ -z "$TARGET_EMAIL" ] || [ -z "$NEW_PASSWORD" ]; then
    echo "====================================================================="
    echo "⚠️  Info Hub - Manual Account Password Overrider"
    echo "====================================================================="
    echo "Usage:   ./replace-password.sh <user@ssiph.com> <NewPassword123!>"
    echo "Example: ./replace-password.sh j.doe@ssiph.com Password_ABC_987"
    echo "====================================================================="
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "❌ Operational Failure: .env.local configuration file was not found in $(pwd)"
    echo "Aborting account override parameters to preserve environmental boundary safety."
    exit 1
fi

echo "🚀 Initiating secure credential sync pipeline..."

# Run from the root of info-hub using the relative path to the ts file
npx tsx -r dotenv/config scripts/replace-password/replace-password.ts dotenv_config_path=.env.local "$TARGET_EMAIL" "$NEW_PASSWORD"