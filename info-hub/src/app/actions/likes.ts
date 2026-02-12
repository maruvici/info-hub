"use server";

import { db } from "@/db";
import { likes } from "@/db/schema";
import { auth } from "@/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // 1. Check if the like already exists
  const existingLike = await db.query.likes.findFirst({
    where: and(
      eq(likes.userId, userId),
      eq(likes.postId, postId)
    ),
  });

  if (existingLike) {
    // 2. If it exists, remove it (Unlike)
    await db.delete(likes).where(eq(likes.id, existingLike.id));
  } else {
    // 3. If not, create it (Like)
    await db.insert(likes).values({
      userId,
      postId,
    });
  }
}

export async function toggleCommentLike(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existingLike = await db
    .select()
    .from(likes)
    .where(and(eq(likes.commentId, commentId), eq(likes.userId, userId)))
    .limit(1);

  if (existingLike.length > 0) {
    await db.delete(likes).where(eq(likes.id, existingLike[0].id));
  } else {
    await db.insert(likes).values({
      userId,
      commentId,
    });
  }
  // Revalidate so the UI updates
  revalidatePath("/post/[id]", "page");
}