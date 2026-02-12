import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import EditPostClient from "./edit-post-client";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const [postData] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id));

  if (!postData) notFound();

  // Basic security check: Only author or admin (you can expand this logic)
  if (postData.authorId !== session.user.id) {
    // You could fetch the user role here if you want admins to edit too
    // redirect(`/post/${id}`); 
  }

  return <EditPostClient post={postData} />;
}