# Welcome to the SSI Info Hub Documentation Portal

Welcome to the central documentation and operating manual hub for **SSI Info Hub**—the dedicated internal forum and knowledge-sharing web application for the employees of Strategic Synergy Incorporated (SSI). 

SSI Info Hub serves as our corporate knowledge base where team members across the organization can collaborate, post technical insights, engage in open discussions, log systemic inquiries, and archive critical operational intelligence.

---

## 💡 What is SSI Info Hub?

At its core, SSI Info Hub functions as a modernized, secure, forum-style platform designed specifically to break down information silos between teams. The platform revolves around three primary types of posts:

* **📰 Articles:** Structured knowledge base entries, documentation pieces, tutorials, and persistent reference guides.
* **💬 Discussions:** Open-ended collaborative spaces for brainstorming ideas, planning initiatives, and sharing general updates.
* **❓ Inquiries:** Structured question-and-answer threads aimed at solving specific workflow roadblocks, engineering constraints, or company procedural queries.

Content within the hub is meticulously categorized across the **6 Core Teams of SSI**:

1. Digital Transformation
2. Infrastructure
3. Product
4. Project Management
5. Security
6. Service Delivery

---

## 🗺️ How to Navigate This Documentation

To ensure zero friction, this portal has been split into two distinct, carefully targeted operational sections depending on your background, role, or immediate goals.

### 🚀 For Users or Beginners
If your goal is to set up this application on a brand new server environment from scratch or learn how to utilize the day-to-day platform features, your entry point is the **User Manual**:

* [**Interactive Feature Guide**](user_manual/feature-guide.md): A complete guide on how to register accounts, link Microsoft credentials, create rich-text posts, attach files, utilize multi-level nested comments, and search or filter across teams.

### 💻 For Developers & System Admins
If you are an active maintainer, developer, or administrative lead responsible for securing, expanding, or testing the underlying codebase, head directly to the **Admin Guide**:

* [**Setup and Maintenance Guide**](admin/setup.md): A step-by-step manual to provision a fresh Linux server instance, install critical systems (Node.js, PostgreSQL), and get the app live.
* [**System Architecture & Diagrams**](admin/architecture.md): Visual layouts detailing the Drizzle ORM entity relationships, polymorphic schemas, and application routing hierarchies.
* [**System Configurations**](admin/configurations.md): Explicit operational manuals for overriding baseline network rules, changing IP/Port binds, altering upload storage caps, and swapping environment variables.
* [**Testing & Staging Environments Manual**](admin/testing-environments.md): Guidelines for setting up isolated local testing environments and critical warnings for protecting the production database layer.

---

### ❓ Having Troubles?
If you are facing an active system error, file size validation rejection, or authentication lockout, skip directly to the [**Support Hub & FAQs**](faqs.md) to discover pre-emptively addressed solutions to common roadblocks.

!!! info "Document Version Control"
    * **Application Target:** SSI Info Hub Production Web Application
    * **Baseline Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL, PM2, Nginx
    * **Documentation Port:** `3002` (Static Servicing Container)