"use server";

import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(data: {
  title: string;
  content: string;
  type: "Article" | "Discussion" | "Inquiry";
  tags: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in to post.");

  // 1. Insert and RETURN the ID
  const [newPost] = await db.insert(posts).values({
    authorId: session.user.id,
    title: data.title,
    content: data.content,
    type: data.type,
    tags: data.tags,
  }).returning({ id: posts.id });

  if (!newPost) throw new Error("Failed to create post record.");

  revalidatePath("/dashboard");
  
  // 2. Return the ID to the client, DO NOT redirect here
  return { id: newPost.id };
}

export async function incrementViewCount(postId: string) {
  await db
    .update(posts)
    .set({
      views: sql`${posts.views} + 1`,
    })
    .where(eq(posts.id, postId));
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Fetch user role to check for Admin
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  // 2. Perform the delete with strict authorization check
  // We allow deletion if: User is Admin OR User is the Author
  const deleted = await db
    .delete(posts)
    .where(
      and(
        eq(posts.id, postId),
        currentUser.role === "Admin" 
          ? undefined // If admin, ignore author check (allow all)
          : eq(posts.authorId, session.user.id) // If user, must be author
      )
    )
    .returning();

  if (!deleted.length) {
    throw new Error("You are not authorized to delete this post.");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updatePost(
  postId: string, 
  data: { title: string; content: string; type: any; tags: string[] }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Perform update with author/admin check
  const updated = await db
    .update(posts)
    .set({ 
      title: data.title, 
      content: data.content,
      type: data.type,
      tags: data.tags,
    })
    .where(eq(posts.id, postId))
    .returning();

  if (!updated.length) throw new Error("Failed to update post");

  revalidatePath(`/post/${postId}`);
  redirect(`/post/${postId}`);
}