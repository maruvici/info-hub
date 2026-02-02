import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { incrementViewCount } from "@/app/actions/posts";
import PostClient from "./post-client";

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // 1. Increment views immediately on load
  await incrementViewCount(id);

  // 2. Fetch real data
  const [postData] = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      type: posts.type,
      tags: posts.tags,
      views: posts.views,
      createdAt: posts.createdAt,
      authorName: users.fullName,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id));

  if (!postData) notFound();

  // 3. Format date to string to avoid the "Date Object" React error
  const formattedPost = {
    ...postData,
    createdAt: postData.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    tags: postData.tags || [],
  };

  return <PostClient post={formattedPost} />;
}