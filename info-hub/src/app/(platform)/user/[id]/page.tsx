import { auth } from "@/auth";
import { db } from "@/db";
import { users, posts, likes, comments } from "@/db/schema";
import { eq, desc, inArray, or, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import UserPageClient from "./user-page-client";

export default async function UserPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "Details";

  // Fetch the live user from PostgreSQL
  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!currentUser) redirect("/login");

  const userPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      type: posts.type,
      tags: posts.tags,
      views: posts.views,
      createdAt: posts.createdAt,
      likeCount: count(likes.id),
    })
    .from(posts)
    .leftJoin(likes, eq(posts.id, likes.postId))
    .where(eq(posts.authorId, currentUser.id))
    .groupBy(posts.id)
    .orderBy(desc(posts.createdAt));

  const userComments = await db
    .select()
    .from(comments)
    .where(eq(comments.authorId, currentUser.id))
  
  const postIds = userPosts.map((post) => post.id);
  const commentIds = userComments.map((comment) => comment.id);
  
  const userLikes = await db
  .select()
  .from(likes)
  .where(
    or(
      postIds.length > 0 ? inArray(likes.postId, postIds) : undefined,
      commentIds.length > 0 ? inArray(likes.commentId, commentIds) : undefined
    )
  );

  const stats = {
    totalViews: userPosts.reduce((acc, post) => acc + post.views, 0),
    totalLikes: userLikes.length
  };

  const formattedPosts = userPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toLocaleDateString(),
    likes: post.likeCount
  }));

  // Pass the real user data into your original UI structure
  return (
    <UserPageClient 
      user={{
        ...currentUser,
        createdAt: currentUser.createdAt.toLocaleDateString(),
      }} 
      posts={formattedPosts}
      stats={stats}
      initialTab={activeTab as any} 
    />
  );
}