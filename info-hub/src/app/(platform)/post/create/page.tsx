import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreatePostClient from "./create-post-client";

export default async function CreatePostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // We pass the user data so the client knows who the author is
  return <CreatePostClient user={session.user} />;
}