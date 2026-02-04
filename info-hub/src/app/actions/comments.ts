"use server";

import { db } from "@/db";
import { comments } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, content: string, parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.insert(comments).values({
    postId,
    authorId: session.user.id,
    content,
    parentId: parentId || null,
  });

  revalidatePath(`/post/${postId}`);
}