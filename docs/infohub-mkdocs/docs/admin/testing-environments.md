# Testing & Staging Environments Manual

This document outlines the standard operational protocols for deploying, isolating, and validating non-production instances of the **Info Hub**. It ensures that developers and system administrators can simulate system states, seed mock content, and test structural code modifications cleanly without risking data loss, token collisions, or storage leakage on the production system.

---

## 1. Environment Isolation Topology

The Info Hub architecture maintains strict runtime isolation across its operational scopes. Administrators must never point a non-production application cluster at a production storage volume or database instance.

| Operational Attribute | Local Development Environment | Staging / Sandbox Environment | Production Environment |
| :--- | :--- | :--- | :--- |
| **Target Database Suffix** | `infohub_dev_db` | `infohub_staging_db` | `infohub_db` |
| **PM2 Process Name** | *Not Managed (Manual Run)* | `ssi-info-hub-staging` | `ssi-info-hub` |
| **Internal Port Binding** | Port `3000` | Port `3005` | Port `3001` |
| **Media Directory (`UPLOAD_DIR`)** | `/tmp/infohub_dev_media` | `/mnt/internaltool_staging` | `/mnt/internaltool` |
| **Microsoft Entra Application ID** | Dedicated Local App Reg | Dedicated Staging App Reg | Corporate Production App Reg |
| **NextAuth Callback Target Suffix** | `localhost:3000/api/auth/callback/...` | `staging-ip:3005/api/auth/callback/...` | `172.1.87.204:3000/api/auth/callback/...` |

---

## 2. Sandbox Configuration Blueprint (`.env.local`)

To initialize an isolated sandbox or staging instance on the server, create a dedicated directory path separate from the production build and inject a tailored `.env.local` configuration.

??? example "Sample Environment Template"
    Below is a sample template for the environment variables file. Make sure to replace the placeholder values enclosed with `<>`. Do note that the values here must be different from
    the one used in production.

    ```ini
    DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/<STAGING_DB_NAME>"  
    AUTH_SECRET="<STAGING_32BIT_RANDOM_HEX_STRING>;"  
    NEXTAUTH_URL="https://<STAGING_SERVER_IP>:3005"  
    AUTH_MICROSOFT_ENTRA_ID_ID="<STAGING_ENTRA_CLIENT_ID>"  
    AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="<STAGING_ENTRA_TENANT_ID>"  
    AUTH_MICROSOFT_ENTRA_ID_SECRET="<STAGING_ENTRA_CLIENT_SECRET>"  
    AUTH_TRUST_HOST="true"
    ```

---

## 3. Automated Seeding & Database States

The Info Hub features built-in pipeline scripts to clear out target tables and programmatically generate high-fidelity mock records. This enables quick frontend rendering and layout testing.

### 3.1 The Clean State Pipeline
Before running an environment integration test or deploying a new relational column schema via Drizzle ORM, clear out the target staging database. Use the exact configuration path pointer flags below to target your non-production profile:

```bash
# 1. Purge all existing tables, rows, relationships, and metadata trackers
npx tsx -r dotenv/config src/db/reset.ts dotenv_config_path=.env.local

# 2. Re-push the structural Drizzle layout schema from the codebase
npx drizzle-kit push

# 3. Inject fresh, randomized data records across all relational fields
npx tsx -r dotenv/config src/db/seed.ts dotenv_config_path=.env.local
```

### 3.2 Mock Generation via `@faker-js/faker`
The execution of the `seed.ts` script utilizes the `@faker-js/faker` development engine to synthesize database entries. This ensures the staging system accurately mimics real enterprise workloads:
* **User Accounts**: Creates realistic user profiles mapped across varying system-level roles (`User`, `Admin`, `Editor`).
* **Content Generation**: Generates posts, categorized documentation components, nested feedback comments, and inquiries.

!!! danger "Production Seeding Guardrail"
    The execution of `src/db/reset.ts` maps destructive SQL commands (DROP TABLE, TRUNCATE). Engineers must never run these seeding parameters while pointing to the production environment file. Always verify the `DATABASE_URL` string inside the targeted `.env.local` file before executing.

---

## 4. Single Sign-On (SSO) Staging Sandbox Validation

To test user access controls, group privileges, and sign-on handshakes without disrupting the production corporate application registration, you must create a separate sandbox configuration inside the [**Microsoft Entra admin center**](https://entra.microsoft.com/).

### 4.1 Staging App Registration Constraints

1. Log into the Entra console and navigate to **App registrations > New registration**.

2. Name the registration explicitly: `Info Hub - Staging Sandbox`.

3. Under the **Authentication** configuration tab, add a Web Platform component and register the staging-specific callback URI: `https://<STAGING_SERVER_IP>:3005/api/auth/callback/azure-ad`

4. Generate a new Client Secret, record its plain text value, and map it directly to the staging environment file's `AUTH_MICROSOFT_ENTRA_ID_SECRET` field.

### 4.2 Restricting Domain Access

Even in the staging sandbox environment, the core application code in `route.ts` enforces a strict domain restriction. Testers must log in using an authorized account ending with the corporate suffix: `@ssiph.com`. If an outside personal account attempts an SSO login, the application layer will throw a 403 Forbidden exception and terminate the session routing.

---

## 5. Media Attachments Storage Isolation

To prevent file upload actions from cluttering production data volumes, you must configure storage isolation at the code layer for testing environments.

### 5.1 Sandbox Directory Routing

During integration testing or local prototyping, update the `UPLOAD_DIR` variable inside `info-hub/src/app/actions/attachments.ts` and `info-hub/src/app/api/attachments/[filename]/route.ts` to look like this:

```typescript
// Production Path: const UPLOAD_DIR = '/mnt/internaltool';
// Staging Isolation Path:
const UPLOAD_DIR = '/mnt/<staging_directory>';
```

### 5.2 Storage Validation & Limit Testing

The staging directory provides a safe sandbox for testing the binary upload constraints enforced by the server:

* **100MB Capacity Limits**: Administrators should simulate file uploads near the **100MB** ceiling to ensure Nginx proxy buffers (`proxy_busy_buffers_size, client_max_body_size`) allow the file streams to pass without throwing a 502 Bad Gateway error.

* **Attachment Count Restrictions**: Test that uploading a 4th file to a single post triggers an validation exception, verifying that the system successfully caps attachments at 3 files per post.

* **Byte-Range Scrubbing Logs**: Verify that large audio or video streams successfully return an `Accept-Ranges: bytes` header response in staging. This confirms that media scrubbing functions correctly before rolling the build into production.

---

## 6. Pre-Flight Deployment Integration Checklist

Before running a production code pull or merging code adjustments into the `main` branch, engineers should complete this baseline smoke-test checklist within the isolated staging environment:

- [ ] **Schema Concurrency Check**: Confirm `npx drizzle-kit push` runs cleanly against the database schema without throwing table mismatch alerts.

- [ ] **SSO Handshake Audit**: Confirm login routing redirects successfully to the Entra interface and creates a secure session cookie.

- [ ] **Role Authorization Check**: Confirm an account assigned a standard `User` role is blocked from viewing administrative documentation routes or running database actions.

- [ ] **File Lifecycle Verification**: Upload a 50MB testing document, confirm it successfully writes to the disk at `/mnt/<staging_directory>`, check that the UI progress bar displays correctly, and verify that deleting the attachment removes the file from disk.

