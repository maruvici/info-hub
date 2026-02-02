import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { ilike, or, and, eq, arrayContains, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage(props: {
  searchParams: Promise<{ type?: string; tag?: string; sort?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const typeFilter = searchParams.type;
  const tagFilter = searchParams.tag;
  const sortOrder = searchParams.sort;
  const filterKey = JSON.stringify(searchParams);
  const query = searchParams.q

  // Build the dynamic WHERE clause
  const conditions = [];
  if (typeFilter) conditions.push(eq(posts.type, typeFilter as any));
  if (tagFilter) conditions.push(arrayContains(posts.tags, [tagFilter]));
  if (query) {
    conditions.push(
      or(
        ilike(posts.title, `%${query}%`),
        ilike(posts.content, `%${query}%`),
      )
    );
  }

  // Built the dynamic orderBy clause
  let orderColumn;
  switch (sortOrder) {
    case "Views":
      orderColumn = desc(posts.views);
      break;
    case "Liked":
      // Default to createdAt for now so it doesn't crash.
      orderColumn = desc(posts.createdAt); 
      break;
    default:
      orderColumn = desc(posts.createdAt); // "Recent"
  }

  const dbPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      type: posts.type,
      tags: posts.tags,
      views: posts.views,
      createdAt: posts.createdAt,
      authorName: users.fullName,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderColumn);

  const formattedPosts = dbPosts.map((post) => ({
    id: post.id,
    title: post.title,
    author: post.authorName || "Unknown User",
    type: post.type as 'Article' | 'Discussion' | 'Inquiry',
    tags: post.tags || [],
    views: post.views,
    likes: 0,
    date: post.createdAt.toLocaleDateString(),
  }));

  return (
    <DashboardClient 
      key={filterKey}
      initialPosts={formattedPosts} 
      activeType={typeFilter}
      activeTag={tagFilter}
    />
  );
}