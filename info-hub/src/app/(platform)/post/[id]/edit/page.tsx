import { db } from "@/db";
import { users, posts, attachments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import EditPostClient from "./edit-post-client";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  // 1. Fetch Post Data
  const [postData] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id));

  if (!postData) notFound();

  // 2. Fetch Initial Attachments for this post
  const postAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.postId, id));

  const [userResult] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isAdmin = userResult?.role === "Admin";

    // Basic security check
  if (!isAdmin && postData.authorId !== session.user.id) {
    redirect(`/post/${id}`); 
  }

  // 3. Pass the data to the client component
  return (
    <EditPostClient 
      post={postData} 
      initialAttachments={postAttachments} 
    />
  );
}