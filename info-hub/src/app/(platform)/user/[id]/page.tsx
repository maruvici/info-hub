import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import UserPageClient from "./user-page-client"; // We'll move your UI here

export default async function UserPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "Details";

  if (!session?.user?.email) redirect("/login");

  // Fetch the live user from PostgreSQL
  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!currentUser) redirect("/login");

  // Pass the real user data into your original UI structure
  return (
    <UserPageClient 
      user={currentUser} 
      initialTab={activeTab as any} 
    />
  );
}