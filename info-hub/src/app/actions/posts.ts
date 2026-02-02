"use server";

import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
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

  if (!session?.user?.id) {
    throw new Error("You must be logged in to post.");
  }

  // Insert into PostgreSQL
  await db.insert(posts).values({
    authorId: session.user.id,
    title: data.title,
    content: data.content,
    type: data.type,
    tags: data.tags,
  });

  // Refresh the dashboard so the new post appears immediately
  revalidatePath("/dashboard");
  // Send them to the dashboard
  redirect("/dashboard");
}

export async function incrementViewCount(postId: string) {
  await db
    .update(posts)
    .set({
      views: sql`${posts.views} + 1`,
    })
    .where(eq(posts.id, postId));
}