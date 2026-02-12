"use server";

import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
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

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Fetch user role and the comment to verify ownership
  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  const [targetComment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!targetComment) throw new Error("Comment not found");

  // 2. Permission Check
  const canDelete = currentUser.role === "Admin" || targetComment.authorId === session.user.id;
  if (!canDelete) throw new Error("Unauthorized");

  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath(`/post/${targetComment.postId}`);
}

export async function updateComment(commentId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  const [targetComment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!targetComment) throw new Error("Comment not found");

  const canEdit = currentUser.role === "Admin" || targetComment.authorId === session.user.id;
  if (!canEdit) throw new Error("Unauthorized");

  await db.update(comments).set({ content }).where(eq(comments.id, commentId));
  revalidatePath(`/post/${targetComment.postId}`);
}