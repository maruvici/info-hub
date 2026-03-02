import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { users, posts, comments, likes, attachments } from "./schema";
import { sql } from "drizzle-orm";

async function reset() {
  console.log("🗑️ Emptying database...");

  // We use a transaction to ensure everything is wiped or nothing is
  await db.transaction(async (tx) => {
    // Delete in reverse order of dependencies
    await tx.delete(attachments);
    await tx.delete(likes);
    await tx.delete(comments);
    await tx.delete(posts);
    await tx.delete(users);
    
    // Optional: Reset the identity sequences so IDs start fresh (if using serial/autoincrement)
    // Since you use UUIDs, this isn't strictly necessary, but good practice.
  });

  console.log("✅ Database is now empty.");
  process.exit(0);
}

reset().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});