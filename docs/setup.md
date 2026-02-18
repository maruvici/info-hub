# Steps

## NextJS and Frontend Dependencies
1. Install node and npm `sudo apt install nodejs npm`
2. Create next app: `npx create-next-app@latest project_title`
3. Install UI Dependencies: `npm install lucide-react clsx tailwind-merge next-themes` (inside project root)

## PostgreSQL
1. Install postgresql: `sudo apt install postgresql postgresql-contrib`
2. Create User with Password and SU privileges:
    ```
    sudo -u postgres psql
    CREATE USER dbadmin WITH SUPERUSER PASSWORD 'infohubpasswd_123';
    ```
3. Create DB: `CREATE DATABASE infohub_db;`   
4. Grant User with SU Access to DB: `GRANT ALL PRIVILEGES ON DATABASE infohub_db TO dbadmin;`

## Local Environment Setup
1. Create .env.local in project root: `touch .env.local`
2. Enter DatabaseURL: `DATABASE_URL="postgresql://dbadmin:infohubpasswd_123@localhost:5432/infohub_db"`
3. Generate Secret: `npx auth secret`

##  Drizzle ORM
1. Install postgresql (precaution) and drizzle orm: `npm install postgres drizzle-orm`
2. Install Drizzle Dependencies: `npm install -D drizzle-kit`
3. Install dotenv (for local env var): `npm install dotenv`
4. Create .env.local with `DATABASE_URL="postgresql://dbadmin:infohubpasswd_123@localhost:5432/infohub_db"`
4. Sync Drizzle Schema with Local Postgres DB: `npx drizzle-kit push`

## Other Dependencies
1. Install password hash gen: `npm install bcrypt`
    - For Typescript: `npm install -D @types/bcrypt`
2. Install form validator: `npm install zod`
3. Install auth.js: `npm install next-auth@beta @auth/drizzle-adapter`
4. Install uuid: `npm install uuid` `npm install -D @types/uuid`s
5. Install TipTap: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder`
    6. Install typography: `npm install -D @tailwindcss/typography`