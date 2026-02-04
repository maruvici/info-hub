import { auth } from "@/auth";
import { db } from "@/db";
import { users, posts, likes } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
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
    .select()
    .from(posts)
    .where(eq(posts.authorId, currentUser.id))
    .orderBy(desc(posts.createdAt));

  const userLikes = await db
    .select()
    .from(likes)
    .where(inArray(likes.postId, userPosts.map((post) => post.id)));

  const stats = {
    totalViews: userPosts.reduce((acc, post) => acc + post.views, 0),
    totalLikes: userLikes.length
  };

  const formattedPosts = userPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toLocaleDateString(),
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