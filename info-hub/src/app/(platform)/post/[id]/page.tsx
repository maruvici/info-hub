import { db } from "@/db";
import { posts, users, likes, comments } from "@/db/schema";
import { eq, and, sql, count, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { incrementViewCount } from "@/app/actions/posts";
import { auth } from "@/auth"; // Added auth import
import { buildCommentTree } from "@/lib/utils";
import PostClient from "./post-client";

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth(); // 1. Get current session

  // 2. Increment views immediately on load
  await incrementViewCount(id);

  // 3. Fetch Data: Post details, Like Count, and User Like Status
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

  // 4. Fetch the total number of likes for this post
  const [likeCountResult] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.postId, id));

  // 5. Check if the logged-in user has liked this post
  const userLike = session?.user?.id 
    ? await db.query.likes.findFirst({
        where: and(
          eq(likes.postId, id), 
          eq(likes.userId, session.user.id)
        )
      })
    : null;

  // 6. Format posts for the client component
  const formattedPost = {
    ...postData,
    createdAt: postData.createdAt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    tags: postData.tags || [],
  };

  // 7. Fetch Data: Comment Details for Post
  const allComments = await db
  .select({
    id: comments.id,
    content: comments.content,
    parentId: comments.parentId,
    createdAt: comments.createdAt,
    authorName: users.fullName,
  })
  .from(comments)
  .leftJoin(users, eq(comments.authorId, users.id))
  .where(eq(comments.postId, id))
  .orderBy(desc(comments.createdAt));

  // 8. Format comments for the client component
  const formattedComments = allComments.map(c => ({
    ...c,
    date: c.createdAt.toLocaleDateString()
  }));

  const commentTree = buildCommentTree(formattedComments);

  return (
    <PostClient 
      post={formattedPost} 
      initialLikeCount={likeCountResult.count} 
      initialIsLiked={!!userLike} 
      comments={commentTree}
    />
  );
}