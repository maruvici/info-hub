# Info-Hub — Internal Knowledge Base Web Application

#### Video Demo: https://youtu.be/is0Va6qO7Ik

---

## Table of Contents

- [Description](#description)
- [Origin & Context](#origin--context)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Prerequisites](#prerequisites)
- [Local Setup Guide](#local-setup-guide)
- [Seeding the Database (Optional)](#seeding-the-database-optional)
- [Running the Documentation Portal](#running-the-documentation-portal)
- [Known Limitations & Notes](#known-limitations--notes)
- [Future To-Dos](#future-to-dos)

---

## Description

**Info-Hub** is a full-stack internal knowledge base and forum web application built with Next.js, PostgreSQL, and Drizzle ORM. It is designed to serve as a centralized platform where members of an organization can share, discover, and discuss knowledge across teams — breaking down information silos that are common in workplace environments.

At its core, Info-Hub is a forum-style platform that revolves around three distinct types of posts:

- **Articles** — Structured, long-form knowledge base entries, tutorials, how-to guides, and persistent reference documentation intended for archival and discovery.
- **Discussions** — Open-ended collaborative threads for brainstorming, team announcements, idea-sharing, and general conversation.
- **Inquiries** — Focused question-and-answer threads aimed at resolving specific workflow problems, technical blockers, or procedural questions.

Each post is tagged under one or more of six organizational teams: **Digital Transformation**, **Infrastructure**, **Product**, **Project Management**, **Security**, and **Service Delivery**. This team-based categorization allows users to quickly filter and discover content that is relevant to their specific domain.

The application supports two authentication methods: a local **email and password** login secured with bcrypt password hashing, and **Microsoft Entra ID (OAuth 2.0)** Single Sign-On — a design choice driven by real enterprise requirements (see [Design Decisions](#design-decisions)). Sessions are managed via JSON Web Tokens (JWT) through NextAuth v5.

Beyond posting and browsing, Info-Hub includes a rich feature set typical of a mature knowledge platform: a WYSIWYG rich-text editor powered by Tiptap, nested threaded comments, like counters on both posts and comments, a real-time view counter, multi-file attachments per post (with streaming support for video and audio), and the ability to export any post as a PDF or Word document. File exports that include attachments are automatically bundled into a ZIP archive.

User management is handled through a two-tier role system — **User** and **Admin**. Administrators can promote or demote users, suspend accounts, and edit or delete any post on the platform. Standard users can only modify their own content. These RBAC rules are enforced at the server action level, not just the UI.

The application also includes a **Floating Action Button (FAB)** in the bottom-right corner of the screen, which provides quick access to the built-in documentation portal (served separately via MkDocs) and a bug-report form. The documentation URL is configurable via an environment variable (`NEXT_PUBLIC_DOCS_URL`) so it can adapt to different deployment environments without touching the source code.

---

## Origin & Context

Info-Hub was originally developed as **SSI Info Hub** — a production internal knowledge base deployed on a Red Hat Enterprise Linux (RHEL) server for a real company. This CS50 submission is a generalized, downgraded version of that project, with all company-specific secrets, credentials, and identifiers removed.

As a result, you may notice some residual references to `ssi-info-hub`, `@ssiph.com`, or internal IP addresses in certain configuration files and documentation. These are legacy artifacts from the production version that have not been fully replaced in this submission. In particular:

- `deploy.sh` — A production deployment script that uses PM2 and Nginx. It is **not needed** for local development and should be ignored in that context. It references the internal server IP `172.1.87.204`.
- `docs/infohub-mkdocs/` — The MkDocs documentation portal also contains references to the original server paths and IP addresses, but these are cosmetic and do not affect functionality.
- The `@ssiph.com` domain restriction in `src/auth.ts` and `src/app/api/attachments/[filename]/route.ts` is commented out in this version, so any email address is accepted for local testing.

The Microsoft Entra ID login button is present in the UI but will **not function** in a local environment without valid Azure Entra credentials pointing to a registered application. Credential-based (email + password) login works fully in local mode.

---

## Features

**Content & Discovery**
- Create, edit, and delete posts in three types: Article, Discussion, Inquiry
- Rich-text editor with bold, italics, headers, lists, links, and inline formatting (Tiptap)
- Dashboard with collapsible **Filter Explorer**: filter by post type, tags, sort by recency, views, or likes
- Global, case-insensitive full-text search across post titles and content
- Paginated post listings

**Social & Engagement**
- Nested, threaded comments (unlimited depth) with likes on both posts and individual comments
- Real-time view counters per post
- Public user profiles showing team membership and authored posts
- View any colleague's public profile by clicking their name on a post or comment

**Attachments & Export**
- Upload up to 3 file attachments per post (images, video, audio, and documents)
- 100MB maximum per file with a whitelisted extension set
- Stream video and audio files directly in the browser without downloading
- Export any post as a PDF or DOCX file; if attachments are present, they are bundled with the document in a ZIP file

**Authentication & Administration**
- Dual-auth: email/password (bcrypt) and Microsoft Entra ID (OAuth 2.0) via NextAuth v5
- JWT-based session management
- Role-based access control: User and Admin roles
- Admin panel for managing users: promote/demote roles, toggle active/inactive status
- Password reset utility script (`scripts/replace-password/`) for admins

**System & UI**
- Dark and Light mode toggle (persisted via `next-themes`)
- Fully responsive mobile UI
- Floating Action Button (FAB) linking to documentation and bug report form
- Configurable documentation URL via `NEXT_PUBLIC_DOCS_URL` environment variable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Framer Motion |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM + Drizzle Kit |
| Authentication | NextAuth v5 (beta), Microsoft Entra ID, bcrypt |
| Rich-Text Editor | Tiptap (with starter kit, link, and placeholder extensions) |
| Export | html2pdf.js (PDF), html-docx-js (DOCX), JSZip (ZIP bundling) |
| Validation | Zod |
| Icons | Lucide React |
| Dev / Seeding | Faker.js, ESLint |
| Documentation | MkDocs with Material theme |

---

## Project Structure

```
info-hub/                         # Root of the repository
├── docs/                         # Project documentation
│   ├── *.md                      # Mermaid diagram source files (architecture, ER, routing, etc.)
│   └── infohub-mkdocs/           # MkDocs documentation portal
│       ├── docs/                 # Markdown source pages
│       │   ├── index.md          # Documentation homepage
│       │   ├── admin/            # Admin guides: setup, architecture, configurations, testing
│       │   └── user_manual/      # End-user feature guide
│       ├── mkdocs.yml            # MkDocs site configuration
│       └── site/                 # Pre-built static HTML site (ready to serve)
│
└── info-hub/                     # Next.js application root
    ├── .env.local                # Environment variables (not committed to git)
    ├── deploy.sh                 # Production deployment script (PM2 + Nginx — NOT for local use)
    ├── ecosystem.config.js       # PM2 cluster configuration (production only)
    ├── next.config.ts            # Next.js config (enables React Compiler, 100MB server action body limit)
    ├── drizzle.config.ts         # Drizzle Kit configuration (DB connection for migrations)
    ├── drizzle/                  # Auto-generated migration SQL and snapshot files
    ├── scripts/
    │   └── replace-password/     # Admin utility to reset a user's password via CLI
    └── src/
        ├── app/
        │   ├── (public)/         # Unauthenticated route group
        │   │   ├── page.tsx      # Landing / home page
        │   │   ├── login/        # Login page (credentials + Microsoft SSO)
        │   │   └── signup/       # Registration page
        │   ├── (platform)/       # Authenticated route group (protected by middleware)
        │   │   ├── layout.tsx    # Platform shell (includes header and FAB)
        │   │   ├── dashboard/    # Main feed with filter explorer and post listings
        │   │   ├── post/
        │   │   │   ├── [id]/     # Post detail view (comments, attachments, export)
        │   │   │   └── create/   # New post creation page
        │   │   │   └── [id]/edit/ # Post editing page
        │   │   └── user/
        │   │       ├── page.tsx  # Own profile and settings page
        │   │       └── view/[name]/ # Public profile of another user
        │   ├── actions/          # Next.js Server Actions
        │   │   ├── auth.ts       # Sign up, log in, log out, Microsoft SSO
        │   │   ├── posts.ts      # Create, edit, delete posts; increment views
        │   │   ├── comments.ts   # Add, delete comments
        │   │   ├── likes.ts      # Toggle likes on posts and comments
        │   │   ├── attachments.ts # Upload, delete attachments (with filesystem sync)
        │   │   └── users.ts      # Update profile, change password, manage roles
        │   └── api/
        │       ├── auth/[...nextauth]/ # NextAuth API route handler
        │       ├── attachments/[filename]/ # Streaming file download/view endpoint
        │       └── slideshow/    # API route for dashboard content rotation
        ├── auth.ts               # NextAuth configuration (providers, callbacks, JWT/session)
        ├── components/
        │   ├── headers/
        │   │   └── global-header.tsx  # Top navigation bar
        │   ├── link-fab.tsx      # Floating Action Button (docs + bug report links)
        │   ├── theme-provider.tsx # Dark/light mode context wrapper
        │   └── ui/               # Reusable UI components
        │       ├── global-search.tsx  # Search bar component
        │       ├── logout-button.tsx  # Sign-out button
        │       ├── rich-text-editor.tsx # Tiptap editor wrapper
        │       ├── theme-toggle.tsx   # Dark/light mode toggle button
        │       └── user-tabs.tsx      # Tab navigation for profile pages
        ├── db/
        │   ├── index.ts          # Drizzle client initialization (lazy singleton connection)
        │   ├── schema.ts         # Full database schema: users, posts, comments, likes, attachments
        │   ├── seed.ts           # Populates DB with realistic Faker.js test data
        │   └── reset.ts          # Clears all DB tables (use before re-seeding)
        ├── lib/
        │   └── utils.ts          # Shared utility functions (cn for class merging, etc.)
        ├── proxy.ts              # Middleware: authentication guard for the (platform) route group
        └── types/
            ├── index.ts          # Shared TypeScript interfaces and type exports
            └── types.ts          # Server action state types (ActionState)
```

---

## Design Decisions

### Why Next.js App Router?

The App Router's co-location of **Server Components** and **Server Actions** was central to this project's architecture. Rather than building a separate REST or GraphQL API, data fetching and mutations happen in the same codebase — Server Components fetch data directly from the database and stream HTML to the client, while Server Actions handle form submissions and mutations without extra API endpoints. This reduces boilerplate dramatically and keeps the codebase compact. The alternative (a traditional Next.js Pages Router with a separate API layer) would have required significantly more code for the same result.

### Why Drizzle ORM?

Drizzle was chosen over alternatives like Prisma for two reasons. First, it is fully TypeScript-native — the schema is defined in TypeScript, and queries are typed at the call site with no code generation step required at runtime. Second, Drizzle's `drizzle-kit` migration system is explicit and deterministic: it generates plain SQL migration files that can be reviewed before being applied, which is preferable for a production system where schema changes must be auditable. Drizzle also uses a raw `postgres.js` connection under the hood, which is lightweight compared to Prisma's heavier runtime.

### Why Dual Authentication (Credentials + Microsoft Entra ID)?

The original production version of this application was deployed inside a corporate environment where employees already use Microsoft accounts. Offering Microsoft SSO as the primary login method eliminated the friction of creating yet another account. However, pure OAuth-only authentication would make local development and testing difficult without corporate credentials, so the Credentials provider (email + password via bcrypt) was retained as a fallback. In this local version, Entra ID is effectively disabled (it requires valid Azure app registration credentials), while the Credentials provider works fully.

### Why URL State for Filtering and Search?

The dashboard's filter explorer (type, tags, sort, search, pagination) stores all active filters as URL query parameters (e.g., `?type=Article&tag=Infrastructure&sort=views&page=2`) rather than in React component state. This is a deliberate UX decision: it makes every filtered view fully shareable by URL, it means the back button works correctly when navigating between posts and returning to the dashboard, and it allows the server to read the filter values directly in a Server Component without any client-side state hydration. The alternative — storing filters in React state — would have required converting the dashboard to a client component, losing the benefits of server-side rendering.

### Why Tiptap for the Rich-Text Editor?

Tiptap is a headless, extension-based WYSIWYG editor built on ProseMirror. "Headless" means it provides zero default styling, which integrates cleanly with Tailwind CSS without style conflicts. Its extension system (starter kit, link extension, placeholder extension) allows precisely the features needed to be included without excess. Alternatives like Quill or Slate are older or less actively maintained; CKEditor and TinyMCE carry licensing complexity. Tiptap's output is clean HTML, which the application stores in the database and renders via Tailwind's `@tailwindcss/typography` plugin for consistent, readable presentation.

### Why Store Files on the Filesystem (not a CDN/S3)?

For a self-hosted, internal corporate tool operating on a RHEL server with no external cloud dependencies required, storing uploaded files directly on a dedicated server volume (`/mnt/internaltool` in production) was the appropriate choice. It keeps the architecture fully self-contained, avoids third-party storage costs, and allows the streaming API route (`/api/attachments/[filename]`) to serve files with proper byte-range support for video/audio scrubbing. A cloud storage migration (e.g., AWS S3 with signed URLs) would be a natural future improvement if the application were ever deployed in a cloud environment.

### Why the Polymorphic Likes Table?

The `likes` table uses a single table with two nullable foreign keys — `post_id` and `comment_id` — to handle both post likes and comment likes in one place, rather than having two separate tables. This keeps query logic and schema complexity low. A unique index on `(user_id, post_id)` and a separate one on `(user_id, comment_id)` enforce the one-like-per-target constraint at the database level.

---

## Prerequisites

Before setting up the project locally, ensure the following are installed on your machine:

- **Node.js v20 or higher** — [nodejs.org](https://nodejs.org)
- **PostgreSQL 16** — [postgresql.org/download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)

Optionally, if you want to run the documentation portal locally:

- **Python 3** and **pip** — [python.org](https://www.python.org)

---

## Local Setup Guide

### 1. Clone the Repository

```bash
git clone <YOUR_REPO_URL>
cd info-hub
```

### 2. Navigate to the Application Directory

The Next.js application lives inside the nested `info-hub/` folder:

```bash
cd info-hub
```

### 3. Set Up the PostgreSQL Database

Log into PostgreSQL and create a dedicated database and user:

```bash
psql -U postgres
```

```sql
CREATE USER dbadmin WITH SUPERUSER PASSWORD 'Password123';
CREATE DATABASE infohub_db;
GRANT ALL PRIVILEGES ON DATABASE infohub_db TO dbadmin;
\q
```

> You can use different credentials — just make sure to update `DATABASE_URL` in the next step accordingly.

### 4. Configure Environment Variables

The application requires a `.env.local` file in the `info-hub/` directory. One is already provided with default values for local development. Open it and review or update as needed:

```ini
DATABASE_URL="postgresql://dbadmin:Password123@localhost:5432/infohub_db"
AUTH_SECRET="<32BIT_STRING>"          # Generate with: npx auth secret
NEXTAUTH_URL="http://localhost:3000"   # Use http for local dev
AUTH_MICROSOFT_ENTRA_ID_ID="<ENTRA_CLIENT_ID>"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="<ENTRA_TENANT_ID>"
AUTH_MICROSOFT_ENTRA_ID_SECRET="<ENTRA_CLIENT_SECRET>"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_DOCS_URL="http://localhost:3002"  # URL for the FAB docs button
```

**Required changes before running:**

- Replace `<32BIT_STRING>` in `AUTH_SECRET` with a real secret. Generate one by running:
  ```bash
  npx auth secret
  ```
- Update `DATABASE_URL` if you used different database credentials in Step 3.
- The Microsoft Entra ID variables can be left as placeholders — the Microsoft login button will appear in the UI but will not function without valid Azure credentials. Credential-based login works without them.

> **Note:** `NEXT_PUBLIC_DOCS_URL` controls where the FAB's Documentation button points. It defaults to `http://localhost:3002`, which is correct if you serve the MkDocs portal locally (see [Running the Documentation Portal](#running-the-documentation-portal)).

### 5. Install Dependencies

```bash
npm install
```

### 6. Push the Database Schema

Apply the Drizzle ORM schema to your PostgreSQL database:

```bash
npx drizzle-kit push
```

This creates all required tables (`users`, `posts`, `comments`, `likes`, `attachments`) in `infohub_db`.

### 7. Create the Attachments Directory

The application stores uploaded files locally. Create the directory it expects:

```bash
# On macOS/Linux:
sudo mkdir -p /mnt/internaltool
sudo chmod 777 /mnt/internaltool

# On Windows (run in an Administrator PowerShell or adjust the path in attachments.ts):
# The UPLOAD_DIR variable in src/app/actions/attachments.ts and
# src/app/api/attachments/[filename]/route.ts can be changed to any local path.
```

> **Windows users:** The default upload path `/mnt/internaltool` is a Linux-style path. You will need to update the `UPLOAD_DIR` constant in both `src/app/actions/attachments.ts` and `src/app/api/attachments/[filename]/route.ts` to a valid Windows path (e.g., `C:/infohub-uploads`).

### 8. Run the Development Server

```bash
npm run dev
```

The application will be available at **[http://localhost:3000](http://localhost:3000)**.

From there, navigate to `/signup` to create your first account, then log in via `/login`.

---

## Seeding the Database (Optional)

To populate the database with realistic test data (users, posts, comments, likes), use the provided seed scripts:

```bash
# Optional: First reset/clear all existing data
npx tsx src/db/reset.ts

# Then seed with generated fake data
npx tsx src/db/seed.ts
```

This uses Faker.js to generate a realistic set of users across all six teams, posts of each type with tags and content, nested comments, and likes.

---

## Running the Documentation Portal

Info-Hub includes a fully built MkDocs documentation site inside `docs/infohub-mkdocs/site/`. You can serve it locally without installing MkDocs by using any static file server.

**Option A — Using `serve` (recommended):**

```bash
npx serve docs/infohub-mkdocs/site -p 3002
```

**Option B — Using Python's built-in server:**

```bash
cd docs/infohub-mkdocs/site
python3 -m http.server 3002
```

Once running, the documentation will be accessible at **[http://localhost:3002](http://localhost:3002)**, and the FAB's Documentation button inside the app will link there correctly.

If you prefer to **rebuild** the docs from source (requires Python and MkDocs):

```bash
pip3 install "mkdocs<2.0" mkdocs-material pymdown-extensions
cd docs/infohub-mkdocs
mkdocs build
```

> **Important:** Pin MkDocs below version 2.0 as shown above. The Material theme used in this project is incompatible with MkDocs 2.0's breaking architecture changes.

---

## Known Limitations & Notes

- **Microsoft Login is non-functional locally.** The Microsoft Entra ID login button is visible in the UI but requires a valid Azure app registration (Client ID, Tenant ID, Client Secret) to work. Without these, clicking the button will result in an error. All functionality is accessible via the standard email/password login.

- **`deploy.sh` is for production only.** This script automates deployment using PM2 (Node.js process manager) and Nginx (reverse proxy) on a Linux server. It should be ignored entirely in a local development context. Running it locally without PM2 and Nginx installed will produce errors.

- **Residual SSI-specific references.** Some files still reference the original production environment: `deploy.sh` contains the internal server IP `172.1.87.204`, several documentation pages reference `@ssiph.com` email domains or `/root/ssi-info-hub/` server paths, and the MkDocs documentation refers to RHEL-specific commands. These are cosmetic and do not affect local functionality.

- **The `@ssiph.com` domain restriction is commented out.** In the original production version, user registration and the attachment API were restricted to `@ssiph.com` email addresses. These checks are commented out in `src/app/actions/auth.ts` and `src/app/api/attachments/[filename]/route.ts`, so any email address is accepted in this local version.

- **Attachment storage path may need adjustment on Windows.** The default upload directory (`/mnt/internaltool`) is a Linux path. Windows users must update the `UPLOAD_DIR` constant in `src/app/actions/attachments.ts` and `src/app/api/attachments/[filename]/route.ts` to a valid local path.

---

## Future To-Dos

- **Full deployment guide** — A proper cloud or VPS deployment walkthrough (e.g., on AWS, DigitalOcean, or a fresh Ubuntu server) using Docker or a standalone Next.js build with Nginx and PM2.
- **Forgot password / self-service reset** — Currently, password resets require an admin to run the `replace-password.sh` script manually. A self-service email-based reset flow is a clear next step.
- **Draft saving** — Posts currently do not support drafts. Users who want to save work-in-progress must publish and edit later. Auto-save or an explicit draft state would improve the authoring experience.
- **Post pinning / highlighting** — There is no mechanism to pin important announcements to the top of the dashboard. A pinning feature for admins would help surface critical content.
- **Forgot password email flow** — Integrating an email provider (e.g., Resend or Nodemailer) to send password reset links would make the platform fully self-service for end users.
- **Full Microsoft Login support for non-SSI deployments** — Documentation and setup guide for registering a new Azure application and configuring Entra ID for any organization's tenant.