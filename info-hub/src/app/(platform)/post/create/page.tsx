import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import CreatePostClient from "./create-post-client";

export default async function CreatePostPage() {
  const session = await auth();

  // Guard: Ensure session exists and has a user ID
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Fetch the full user record from the database using the session ID
  const [dbUser] = await db
    .select() // Selects all columns from the 'users' table
    .from(users)
    .where(eq(users.id, session.user.id)); 

  // 2. Handle cases where the user might be in session but not in DB
  if (!dbUser) {
    redirect("/login");
  }

  // 3. Pass the actual database user object to the client component
  return <CreatePostClient user={dbUser} userTeam={dbUser.team} />;
}