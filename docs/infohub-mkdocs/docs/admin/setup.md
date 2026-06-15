# Setup and Maintenance Manual

This document serves as the authoritative operational manual for System Administrators and DevOps Engineers managing the **Info Hub** environment. 

It is divided into two primary matrices:

1. **Initial System Setup:** A ground-up provisioning guide for a fresh Red Hat Enterprise Linux (RHEL) server, covering Git repository cloning, runtime installations, dependency resolution, and SELinux network hardening.

2. **Routine Maintenance:** The standardized procedures for application updates, process lifecycle management (PM2), log tracing, and database backups.

---

## Part 1: Initial System Setup

### 1.1 OS Preparation & Core Packages
Ensure the base RHEL instance is up to date and possesses the required compilation utilities.

```bash
# Update core OS packages
sudo dnf update -y

# Install standard Linux development tools and network utilities
sudo dnf groupinstall "Development Tools" -y
sudo dnf install curl git tar wget coreutils policycoreutils-python-utils -y
```

### 1.2 Runtime Environments
Info Hub relies on Node.js for the Next.js application cluster and Python for compiling the static MkDocs documentation portal.

```bash
# Provision Node.js v20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install nodejs -y

# Provision Python 3 and pip
sudo dnf install python3 python3-pip python3-devel -y
```

### 1.3 Runtime Environments
Install the official PostgreSQL engine directly from the PGDG repository to avoid RHEL stream version conflicts.

```bash
# Install and initialize PostgreSQL 16
sudo dnf -qy module disable postgresql
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reprogeneric/pgrpms-repo-latest.noarch.rpm
sudo dnf install -y postgresql16-server postgresql16-contrib
sudo /usr/bin/postgresql-16-setup initdb
sudo systemctl enable --now postgresql-16

# Configure the dbadmin superuser and production database (Replace placeholders)
sudo -u postgres psql -c "CREATE USER <DB_USER> WITH SUPERUSER PASSWORD '<DB_PASSWORD>';"
sudo -u postgres psql -c "CREATE DATABASE <DB_NAME>;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE <DB_NAME> TO <DB_USER>;"
```

### 1.4 Codebase Integration
Instead of bootstrapping a new application, clone the centralized Info Hub Git repository directly into the root directory.

```bash
# Clone the repository (Replace with actual internal Git URL)
git clone <GIT_HTTPS/SSH_REPO_URL>

# Navigate to the primary application directory
cd /root/ssi-info-hub/info-hub
```

!!! note
    The repository contains two operational directories: `/info-hub` (Next.js Application) and `/docs/Info Hub-mkdocs` (MkDocs Portal).

### 1.5 Environment Configuration
The .env.local file is explicitly ignored by Git for security purposes. You must create it manually and inject the 7 required authentication and database variables.
```bash
touch /root/ssi-info-hub/info-hub/.env.local
nano /root/ssi-info-hub/info-hub/.env.local
```

!!! info
    Visit [Microsoft Entra ID](https://entra.microsoft.com/) and go to ***Home > Enterprise Apps > Info Hub*** for the API keys.

??? example
    Below is a sample template for the environment variables file. Make sure to replace the placeholder values enclosed with <>

    ```ini
    DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>"  
    AUTH_SECRET="<32BIT_STRING>" # Generate via: npx auth secret  
    NEXTAUTH_URL="https://<IP_ADDR>:<PORT>" # Port is set to 3000 by default  
    AUTH_MICROSOFT_ENTRA_ID_ID="<ENTRA_CLIENT_ID>"  
    AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="<ENTRA_TENANT_ID>"  
    AUTH_MICROSOFT_ENTRA_ID_SECRET="<ENTRA_CLIENT_SECRET>"  
    AUTH_TRUST_HOST="true"
    ```

### 1.6 Dependency Resolution & Seeding
With the environment locked in, resolve the application dependencies via NPM and map the Drizzle ORM schema to the PostgreSQL database.

```bash
# Install all node packages defined in package.json
npm install

# Push the Drizzle Schema to the active PostgreSQL database
npx drizzle-kit push
```

??? note "Testing"
    If deploying a staging/test server, you may seed mock data by executing npx tsx src/db/reset.ts (resets DB content) followed by src/db/seed.ts (populates DB).

### 1.7 MkDocs Version Pinning (Safety Protocol)

!!! warning "Strict Version Pinning Required"
    To protect the Material theme from breaking upstream architecture changes in MkDocs 2.0, you must explicitly enforce the 1.x framework version during installation.

```bash
# Install MkDocs, locking it below version 2.0
pip3 install "mkdocs<2.0" mkdocs-material pymdown-extensions
```

### 1.8 Network & Security Hardening
Install the Nginx proxy engine, global process managers, and open the necessary hardware and kernel firewalls.

```bash
# Install Nginx and PM2 ecosystem
sudo dnf install nginx -y
npm install -g pm2 serve

# Whitelist public ports 3000 and 3002 in RHEL firewalld
sudo firewall-cmd --zone=public --add-port=3000/tcp --permanent
sudo firewall-cmd --zone=public --add-port=3002/tcp --permanent
sudo firewall-cmd --reload

# Apply SELinux Kernel Overrides for Nginx Bindings
sudo semanage port -a -t http_port_t -p tcp 3000
sudo semanage port -a -t http_port_t -p tcp 3002
```

### 1.9 Automated Execution
Trigger the centralized build and deployment pipeline.

```bash
chmod +x /root/ssi-info-hub/info-hub/deploy.sh
./deploy.sh
```

---

## Part 2: Routine Maintenance & Operations

!!! warning

    When making any change, do not forget to redeploy using the `deploy.sh` script.

### 2.1 Process Lifecycle Management (PM2)
The Next.js cluster and the MkDocs server are managed independently via PM2.

- **View Active Processes & Metrics**: `pm2 list`
- **Zero-Downtime Reload (Next.js)**: `pm2 reload ecosystem.config.js`
- **Restart Documentation Server**: `pm2 restart Info Hub-docs`
- **Save State Across Reboots**: `pm2 save`

### 2.2 Application Updates
Perform manual application updates using this strict sequence to prevent schema desyncs:

```bash
cd /root/ssi-info-hub/info-hub
git pull origin main
npm install
npx drizzle-kit push
npm run build
pm2 reload ecosystem.config.js
```

### 2.3 Infrastructure Monitoring & Logging
When troubleshooting Application Panics or 502 Bad Gateway errors, trace the logs via these endpoints:

- **Next.js / PM2 Runtime Logs**: `pm2 logs` (append --lines 100 for deep history).
- **Nginx Error Tracing**: `tail -f /var/log/nginx/error.log`
- **SELinux Audit Rejections**: `sudo ausearch -m AVC,USER_AVC,SELINUX_ERR`

### 2.4 Database Backups
Before executing major version upgrades or structural Drizzle migrations, capture a manual PostgreSQL dump:

```bash
# Dump the infohub_db database to a timestamped SQL file
sudo -u postgres pg_dump infohub_db > /root/backups/infohub_backup_$(date +%F).sql
```

### 2.5 Interactive Database Diagnosis (SQL Auditing)
When performing validation checks or confirming database health, log directly into the local PostgreSQL instance using the application administrative profile to check records.

```bash
psql postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME> #Replace the placeholder values
```

??? example
    Some common administrative queries:

    -- 1. Check database connectivity and total registered user counts  
    SELECT COUNT(*) FROM user;

    -- 2. Validate recently created info hub posts  
    SELECT id, title, created_at FROM post ORDER BY created_at DESC LIMIT 5;

    -- 3. Confirm structural schema metadata updates tracked by drizzle  
    SELECT * FROM __drizzle_migrations;

    -- 4. Check Databases  
    -- Alternatively, use \l+  
    SELECT * FROM pg_database;

    -- 5. Check Schemas  
    SELECT * FROM information_schema.schemata;
    
    -- 6. Check current database and schema  
    SELECT current_database();  
    SELECT current_schema();

    -- 7. List tables in current schema  
    \dt

    -- 8. List table structure of <table_name> (don't forget to replace)  
    \d <table_name> 

### 2.6 Authentication & Authorization Routine Audits
If users report login blockages or token errors, execute these validation routines to verify Microsoft Entra ID and NextAuth health:

1. **Verify Token Routing and Callback Accessibility:**
Test if the internal NextAuth framework paths are responding securely over the Nginx proxy network layer: 
`curl -I https://<IP_ADDR>:<PORT>/api/auth/providers`

2. **Validate Environment String Sync:**
Ensure AUTH_TRUST_HOST="true" is consistently declared in .env.local. If this flag is omitted on RHEL reverse proxies, Auth.js will throw a runtime exception and reject the secure token payload returning from Azure.

3. **Check Nginx Proxy Headers:**
Verify that /etc/nginx/conf.d/info-hub.conf passes the authorization payloads without trimming data by ensuring these proxy maps exist:
```
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host:$server_port;
```

### 2.7 Troubleshooting Forgotten Password Issues (Temporary Solution)

If a user forgot their password and requests for a password change, Admins must verify that the request is valid. Once proven, they may run the following commands:

```bash
# Move to the script directory
cd info-hub/scripts/replace-password/

# Give it execution permissions
chmod +x replace-password.sh

# Run it
./replace-password.sh <SSI_EMAIL> <NEW_PASSWORD>
```

## Appendix: Exhaustive Ecosystem Dependency Manifest

The following manifest tables document all structural dependencies running inside the Info Hub application layer for system reference.

### 1. Framework & Interface Layer
| Package | Version Range | Operational Scope within Info Hub |
| :--- | :--- | :--- |
| `lucide-react` | Latest | Renders the interface icon sets (dashboard navigation metrics, attachments, profile elements). |
| `clsx` | Latest | Manages conditional style definitions and clean CSS string formatting. |
| `tailwind-merge` | Latest | Resolves CSS utility collisions, ensuring smooth template rendering. |
| `next-themes` | Latest | Stores and changes application theme contexts dynamically (Dark/Light mode). |
| `framer-motion` | Latest | Powers responsive layout transitions and animation actions across elements. |

### 2. Database & Data Validation Core
| Package | Version Range | Operational Scope within Info Hub |
| :--- | :--- | :--- |
| `postgres` | Latest | High-performance, plain-text client used to run raw connection streams to the database server. |
| `drizzle-orm` | Latest | Type-safe query engine linking tables to TypeScript structures without complex resource overhead. |
| `drizzle-kit` | DevDependency | CLI prototyping utility used to build snapshots and push schema states directly to PostgreSQL. |
| `dotenv` | Latest | Resolves and attaches persistent local keys to node runtime processes. |
| `zod` | Latest | Validates inputs across structural inputs, comments, and logins before execution. |
| `uuid` | Latest | Generates unique 128-bit object hashes used to securely separate server files and user scopes. |

### 3. Authentication & Access Management
| Package | Version Range | Operational Scope within Info Hub |
| :--- | :--- | :--- |
| `next-auth` | Beta | Core cryptographic security layer running token-based session handling. |
| `@auth/drizzle-adapter` | Latest | Intercepts session states and automatically maps successful profiles to your PostgreSQL tables. |
| `bcrypt` | Latest | Fallback mechanism that salts and hashes local access keys. |

### 4. Rich-Text Engine & Document Export Suite
| Package | Version Range | Operational Scope within Info Hub |
| :--- | :--- | :--- |
| `@tiptap/react` | Latest | Headless editor environment powering the application's WYSIWYG text inputs. |
| `@tiptap/starter-kit` | Latest | Group package enabling essential editor controls like bolding, headers, lists, and quote blocks. |
| `@tiptap/extension-link` | Latest | Allows users to embed custom web hyperlinks inside documentation nodes. |
| `@tiptap/extension-placeholder` | Latest | Manages inline text labels inside editing forms before users enter inputs. |
| `@tailwindcss/typography` | DevDependency | Provides beautiful default CSS styles to raw markdown or HTML parsed out of editors. |
| `html2pdf.js` | Latest | Captures document windows and converts them instantly to high-resolution client-side PDFs. |
| `html-docx-js` | Latest | Converts rich-text code lines into Microsoft Word (`.docx`) file structures. |
| `jszip` | Latest | Compresses and bundles large, multi-file document downloads into a single archive file. |

### 5. Isolated Staging & Data Engineering
| Package | Version Range | Operational Scope within Info Hub |
| :--- | :--- | :--- |
| `@faker-js/faker` | DevDependency | Programmatically structures realistic user data records to populate schemas during staging. |