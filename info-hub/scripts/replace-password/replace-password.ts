import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function main() {
  const email = process.argv[2];
  const plainPassword = process.argv[3];

  if (!email || !plainPassword) {
    console.error("❌ Error: Missing parameters.");
    process.exit(1);
  }

  if (!email.endsWith("@ssiph.com")) {
    console.error("❌ Error: Targeted email must belong to the @ssiph.com domain.");
    process.exit(1);
  }

  console.log(`⏳ Locating user profile for: ${email}...`);

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const result = await db
      .update(users)
      .set({ password: passwordHash })
      .where(eq(users.email, email))
      .returning({ updatedEmail: users.email });

    if (result.length === 0) {
      console.error("❌ Error: No user account found with that email address.");
      process.exit(1);
    }

    console.log(`✅ Success! Secure password updated for: ${result[0].updatedEmail}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Critical Database Override Failure:", error);
    process.exit(1);
  }
}

main();