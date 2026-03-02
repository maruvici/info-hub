import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import CreatePostClient from "./create-post-client";

export default async function CreatePostPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user] = await db
    .select({ team: users.team })
    .from(users)
    .where(eq(users.id, session.user.id));

  // We pass the user data so the client knows who the author is
  return <CreatePostClient user={session.user} userTeam={user?.team}/>;
}