# Frequently Asked Questions

## Account Access & Security

??? question "Why am I being forced to create a local password if we use Microsoft Single Sign-On (SSO)?"
    Microsoft verifies your identity, but the knowledge base uses a local password both for data security and authentication purposes. You must set this local password when your account is first created.

??? question "Why am I getting a "403 Forbidden" error when trying to log in?"
    The platform is locked to your corporate domain. You must be signed into an official account ending in @ssiph.com. Personal emails or outside domains are automatically blocked.

??? question "Why did a user disappear from the Admin's User Management list?"
    The list only displays standard users. If you change a user’s role to Admin, they are instantly filtered out of this view because administrators cannot modify or suspend other admins.

??? question "What should I do if I forget my password?"
    While a "Forgot Password" service is in the works, please contact your Admin to resolve the issue in the meantime.

## Creating & Editing Content

??? question "Why don't I see options to edit or delete a specific post?"
    You can only modify or delete posts and comments that you personally created Global Admins are the only users who can edit or delete articles created by other people.

??? question "Can I save a draft of my post and finish it later?"
    There is no automatic draft saving (for now). To prevent data loss, click Publish to save your work, then use the Edit Post feature later to finish adding content.

??? question "How do I highlight a post?"
    While there is no supported way to pin or highlight a post right now, you may opt to place keywords like "IMPORTANT" in the post title or content for easy searching.

??? question "Can I edit or remove my post/comment after I post it?"
    Yes. Click on the menu icon (three vertical dots) found on the upper right corner of the post/comment to reveal the edit and delete buttons.

## Attachments & Media

??? question "What are the limits for file attachments on a post?"
    You can upload a maximum of 3 attachments per post, and no individual file can exceed 100MB. Standard documents, images, video, and audio files are supported.

??? question "Do I have to download video or audio files to watch or listen to them?"
    No. Click the View (External Link) icon next to the attachment to stream the media directly in your browser with full timeline scrub controls.

??? question "What happens to attached files if I delete my post?"
    The files are permanently erased from the server's storage  at the same time the database record is cleared. The same outcome happens upon user account deletion. This action cannot be undone.

??? question "Can regular users download attachments from any post?"
    Yes. Any user who has access to view a post can download or view its attached files by clicking the Download or View icons.

## Saving, Searching, & Interacting

??? question "Why did my "Save as PDF/Word" request download a ZIP file?"
    If a post has no attachments, it downloads as a single document. If the post contains attachments, the system automatically bundles your document and all attached files into one `.zip` folder.

??? question "How do I find all articles related to a specific project?"
    Type keywords into the global search bar, or click the tags of the teams related to the project you're trying to study.

??? question "Is there a limit to how many comments can be added to a post?"
    No. Discussion threads support unlimited comments and nested replies to facilitate open team collaboration.

## Profiles & Support

??? question "What information can other users see on my public profile page?"
    Other users can see your full name, your corporate team assignment, and a complete history of the public articles you have authored on the platform.

??? question "How do I update my assigned team or change my local password?"
    Click on your own User Profile icon. Your personal dashboard contains settings to change your active team assignment and update your local password.

??? question "Where do I go if a feature breaks or an attachment fails to load?"
    Click the blue Floating Action Button (FAB) in the lower-right corner of your screen and select Report a Bug to open the secure IT tracking form.

## Reverse Proxy & Client Connectivity

??? question "Why are users getting a '502 Bad Gateway' error when uploading a large file?"
    Nginx proxy buffers or request body limits are likely being exceeded. Ensure your `/etc/nginx/nginx.conf` file includes `client_max_body_size 100M;` and that `proxy_read_timeout`, `proxy_connect_timeout`, and `proxy_busy_buffers_size` are scaled up appropriately to accommodate high-capacity chunks up to the 100MB limit.

??? question "Why does the site show an unstyled, plain white screen after pulling down a new update?"
    The browser or Nginx may be caching outdated static CSS/JS compilation bundles. Run `pm2 restart ssi-info-hub` to clear the active worker memory cache, and instruct the affected client to perform a hard reload (`Ctrl + F5` or `Cmd + Shift + R`) to pull fresh asset maps from the server.

## Process Management & Runtime (PM2)

??? question "How do I check live logs if users report they cannot create comments or posts?"
    Log into the RHEL terminal and execute `pm2 logs ssi-info-hub`. This streams all runtime standard outputs and database connection errors in real time so you can spot failing network handshakes or data schema mismatches.

??? question "One of the application workers crashed or spiked to 100% CPU. How do I recover safely?"
    PM2 automatically restarts workers that crash due to out-of-memory errors. However, if a thread freezes or locks a pool connection, you can force a zero-downtime reload by running `pm2 reload ssi-info-hub`. This recycles the workers one by one without disconnecting active users.

## Database & Drizzle ORM

??? question "Why am I seeing 'Relation "X" does not exist' errors in the PM2 logs after pushing code updates?"
    The live database structure has desynchronized from the application's `schema.ts` file. To resolve this, go to the root folder `/root/ssi-info-hub/info-hub/` and execute `npx drizzle-kit push` to safely align the live PostgreSQL tables with your codebase models.

??? question "What do I do if the database hits its maximum connection limit and refuses new handshakes?"
    Check your active connection allocation by inspecting PostgreSQL pool usage. If background administrative tasks or third-party analytical scripts are hanging, you can manually terminate idle backends using `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';` to clear pool space for the primary Next.js cluster.

## Physical Storage & Attachments Volume

??? question "Users are getting errors trying to download files. How do I verify the server attachment volume is intact?"
    Verify that the physical storage partition hasn't dropped into a read-only state or run out of disk space. Run `df -h` in the terminal to inspect memory capacity, and confirm the application user has ownership permissions over the media volume by executing `ls -ld /mnt/internaltool`.

??? question "What happens if a physical attachment file is deleted from disk but its metadata row remains in PostgreSQL?"
    The UI will display a broken link indicator or throw a warning when a user attempts to stream/download the file. To fix this, log into Drizzle Studio (`npx drizzle-kit studio`), search for the broken file metadata entry by its `id` or `fileName`, and delete the matching record row manually.
    
??? question "How do you add/change pictures in the welcome splash page?"
    Go to `/root/ssi-info-hub/info-hub/public/landing-page-slideshow/` and upload/replace pictures there.