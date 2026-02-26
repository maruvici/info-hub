import { db } from "@/db";
import { users, posts, likes } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import PublicUserClient from "./view-user-client";

export default async function PublicUserPage({ 
  params 
}: { 
  params: Promise<{ name: string }> 
}) {
  const { name } = await params;
  // Convert "John%20Doe" back to "John Doe"
  const decodedName = decodeURIComponent(name);

  // 1. Fetch the target user by fullName
  const targetUser = await db.query.users.findFirst({
    where: eq(users.fullName, decodedName),
  });

  if (!targetUser) notFound();

  // 2. Fetch their posts
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
    .where(eq(posts.authorId, targetUser.id))
    .groupBy(posts.id)
    .orderBy(desc(posts.createdAt));

  // 3. Simple Stats
  const stats = {
    totalViews: userPosts.reduce((acc, post) => acc + post.views, 0),
    postCount: userPosts.length,
  };

  const formattedPosts = userPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toLocaleDateString(),
    likes: post.likeCount
  }));

  return (
    <PublicUserClient 
      user={{
        fullName: targetUser.fullName,
        team: targetUser.team,
        email: targetUser.email,
        createdAt: targetUser.createdAt.toLocaleDateString(),
      }} 
      posts={formattedPosts}
      stats={stats}
    />
  );
}