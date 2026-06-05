# System Configuration Manual

This document serves as the authoritative architectural blueprint for the **SSI Info Hub** system configuration. It outlines the absolute server paths, environment properties, reverse proxy constraints, process cluster limits, and data streaming parameters required to run the application in a hardened RHEL environment.

---

## 1. Absolute System Pathing Matrix

To simplify audits and cross-service diagnostics, utilize this master directory matrix to locate active configuration boundaries on the server:

| Ecosystem Component | Targeted File / Path | Absolute Server Path |
| :--- | :--- | :--- |
| **Next.js Environment** | Core Environment Configuration | `/root/ssi-info-hub/info-hub/.env.local` |
| **PM2 Process Manager** | Cluster Ecosystem Manifest | `/root/ssi-info-hub/info-hub/ecosystem.config.js` |
| **Next.js Engine Config** | Server Action Override Options | `/root/ssi-info-hub/info-hub/next.config.ts` |
| **Database ORM Mapping** | Schema Structure Declarations | `/root/ssi-info-hub/info-hub/src/db/schema.ts` |
| **Nginx Web Proxy** | Application Virtual Host Blocks | `/etc/nginx/conf.d/info-hub.conf` |
| **Nginx Web Proxy** | Documentation Portal Blocks | `/etc/nginx/conf.d/info-hub-docs.conf` |
| **PostgreSQL Database** | Storage Server Configurations | `/var/lib/pgsql/data/postgresql.conf` |
| **Media Attachments** | Physical Disk Storage Endpoint | `/mnt/internaltool` |

---

## 2. Application Core Environment Variables (`.env.local`)

The Next.js framework ingests 7 mandatory parameters to securely establish database connections and handle single sign-on mapping via Microsoft Entra ID.

??? example "Sample Environment Template"
    Below is a sample template for the environment variables file. Make sure to replace the placeholder values enclosed with `<>`

    ```ini
    DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<DB_NAME>"  
    AUTH_SECRET="<32BIT_STRING>" # Generate via: npx auth secret  
    NEXTAUTH_URL="https://<IP_ADDR>:<PORT>" # External application endpoint
    AUTH_MICROSOFT_ENTRA_ID_ID="<ENTRA_CLIENT_ID>"  
    AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="<ENTRA_TENANT_ID>"  
    AUTH_MICROSOFT_ENTRA_ID_SECRET="<ENTRA_CLIENT_SECRET>"  
    AUTH_TRUST_HOST="true"
    ```

### Detailed Parameter Breakdown

* **`DATABASE_URL`**
    * **Purpose:** Instructs the lazy-initializing `postgres` client-pool engine where to direct relational database reads/writes.
    * **Hardening Rule:** Must specify the application-dedicated user context (`dbadmin`) and never use the default `postgres` root username.
* **`AUTH_SECRET`**
    * **Purpose:** A cryptographically random, 32-byte hexadecimal salt used by NextAuth to sign and encrypt Session JWT tokens and cookie states.
* **`NEXTAUTH_URL`**
    * **Purpose:** Sets the canonical absolute base URL where authentication tokens are returned from cloud identity providers. This must perfectly match the **Redirect URI** configured in your Microsoft Entra console.
* **`AUTH_MICROSOFT_ENTRA_ID_ID` & `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`**
    * **Purpose:** Identifies your company's corporate Active Directory cloud boundaries and individual application registration handles.
* **`AUTH_MICROSOFT_ENTRA_ID_SECRET`**
    * **Purpose:** The secure client-secret password generated in the Entra portal to authenticate cross-server token assertions.
* **`AUTH_TRUST_HOST`**
    * **Purpose:** Explicitly tells NextAuth to trust proxy headers (`X-Forwarded-Host`, `X-Forwarded-Proto`) arriving from Nginx. *Crucial on RHEL servers; if set to false, login handshakes will terminate instantly with a 403 authorization breach error.*

---

## 3. Storage Architecture & Media Attachment Rules

SSI Info Hub runs a highly secure, buffered physical storage processing engine configured under `/root/ssi-info-hub/info-hub/src/app/actions/attachments.ts`.

### 3.1 Storage Directory Allocation
All physical binary items, graphics, videos, or documents uploaded by users are saved directly onto the server at `/mnt/internaltool`

??? note
    This path can be refactored or remounted directly onto an external network share or Synology NAS mount as data footprint requirements expand. Just replace the `UPLOAD_DIR` variable inside `info-hub/src/app/actions/attachments.ts` and `info-hub/src/app/api/attachments/[filename]/route.ts`.

### 3.2 Thresholds & Validation Rules
The application layer strictly enforces file safety protocols before passing records down to the file system or recording a reference URL (`/api/attachments/[filename]`) inside the database:

* **File Size Ceiling:** Capped strictly at **100MB** (`100 * 1024 * 1024` bytes). Any file surpassing this boundary will be blocked at the edge server action.
* **Attachment Limits:** Users are permitted a maximum of **3 attachments per individual post**.
* **Extension Whitelist:** The system rejects unlisted file formats to mitigate malicious executions. The allowed formats include:
    * *Images:* `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`
    * *Video/Audio:* `.mp4`, `.avi`, `.mov`, `.webm`, `.mp3`, `.wav`, `.ogg`
    * *Documents:* `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`, `.csv`

??? note
    This behavior can be changed by updating the `MAX_FILE_SIZE` and `ALLOWED_TYPES` variables under `create-post-client.tsx` and `edit-post-client.tsx`.

### 3.3 Security Check & Media Streaming (`route.ts`)
When an authorized user attempts to retrieve an attachment via the `/api/attachments/[filename]` API route, the system handles data transport with these operational constraints:

1. **Domain Isolation:** The route validates the active session token and explicitly rejects any email addresses that do not end with the corporate domain suffix: **`@ssiph.com`**.

2. **Byte-Range Seeking (`Accept-Ranges: bytes`):** The server streams the file from the disk using a native Web Stream chunking procedure. This allows the browser to populate the file progress indicator and allows users to fluidly "scrub" back and forth through timelines of embedded `.mp4` videos or `.mp3` audio clips.

---

## 4. Edge Web Server Routing & Buffer Adjustments (Nginx)

Because the application processes large media uploads up to 100MB, the default Nginx configuration must be widened. Failing to increase these boundaries will cause Nginx to drop file upload streams, returning **HTTP 413 Payload Too Large** or **HTTP 502 Bad Gateway** errors before the Next.js runtime can intercept them.

Create the file `/etc/nginx/conf.d/info-hub.conf` and populate it with these production proxy buffers:

```nginx
server {
    listen 3000 ssl http2;
    server_name infohub.internal.corp;

    ssl_certificate /etc/pki/nginx/server.crt;
    ssl_certificate_key /etc/pki/nginx/private/server.key;
    
    # Enforce strict corporate security compliance TLS levels
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Match the maximum file capability defined in attachments.ts
    client_max_body_size 100M;

    location / {
        # Route directly to the PM2 cluster instance port
        proxy_pass http://127.0.0.1:3001;
        
        # Preserve upstream network metadata contexts
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support handles high-speed dashboard state pushes
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Expand proxy buffer limits to safeguard large stream chunks
        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
        proxy_read_timeout         300s;
        proxy_send_timeout         300s;
    }
}
```

### 4.1 Next.js Framework Payload Alignment

To ensure the backend Node.js framework does not reject incoming media binaries, your next.config.ts configuration maps a matching body limit:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Aligns directly with attachments.ts limits
    },
  },
};

export default nextConfig;
```

---

## 5. Multi-Core Process Engineering (PM2 Ecosystem)
The production cluster environment is defined inside `/root/ssi-info-hub/info-hub/ecosystem.config.js`.

Instead of spawning a standard single-threaded process, the application utilizes PM2's Cluster Mode to mirror the server environment seamlessly over every hardware core present on the RHEL processor.

```javascript
module.exports = {
  apps: [
    {
      name: "ssi-info-hub",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001", // Binds next start securely to backend port 3001
      cwd: "/root/ssi-info-hub/info-hub",
      instances: "max",       // Leverages 100% of available CPU cores
      exec_mode: "cluster",   // Enforces true multi-threaded load balancing
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

### 5.1 Infrastructure Controls
* **Core Task Distribution** (`instances: "max"`): PM2 spins up separate system sub-threads for each core. Network queries hitting port 3001 are balanced round-robin across instances automatically. If an isolated thread crashes due to an unhandled exception, sibling instances handle processing with zero total application down-time.

* **Process Watchdog Monitoring**: If any thread experiences a critical memory leakage or stays unresponsive, an admin can issue an automated restart threshold directly inside this block using `max_memory_restart: "2G"`.

---

## 6. Relational Database Storage Pooling (PostgreSQL)

SSI Info Hub relies on *drizzle-orm* wrapping a high-performance postgres.js client adapter (`src/db/index.ts`).

### 6.1 Database Connection Mapping

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const globalForDb = global as unknown as { 
  conn: postgres.Sql | undefined 
};

// Lazy initialization controls system thread bloat
const conn = globalForDb.conn ?? postgres(connectionString, { 
  prepare: false,      // Disables prepared statements to optimize connection recycling
  connect_timeout: 10  // Hard 10-second ceiling prevents socket hanging
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
```

### 6.2 Administrative Thread Allocation Guide (Important when scaling)
* **Lazy Pool Balancing**: Because postgres.js handles connection resource gathering lazily, instances spin up sockets on an as-needed basis.
* **Connection Math Formula**: When tuning your system database engine at `/var/lib/pgsql/data/postgresql.conf`, make sure to compute the available `max_connections` value using this balancing formula:

!!! abstract "System Sizing Formula"
    === "Connection Pool Ratio"
        ```text
        PostgreSQL max_connections >= (Number of PM2 Cluster Workers * Internal Client Pool Limit) + 10 (Reserved for Admins)
        ```
        
    If your RHEL instance has 8 cores, and your application scales out to 8 instances, ensuring a base database capacity of at least 100 connections avoids any accidental resource denial under heavy workloads.