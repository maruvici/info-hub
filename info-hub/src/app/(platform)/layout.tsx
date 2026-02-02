import { BookOpen, Search, User, LogOut, LayoutDashboard, UserCircle, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 1. Hard check: If no session, bounce to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Database check: Ensure the user actually exists in Postgres
  // (Prevents ghost sessions from deleted users)
  const currentUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Global Header */}
      <header className="sticky top-0 z-40 w-full bg-card backdrop-blur py-1">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gradient shrink-0">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>info-hub</span>
          </Link>

          <div className="container mx-auto px-4 h-16 flex items-center justify-end gap-4">
            {/* Global Search */}
            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search titles, content, tags, or type..."
                className="w-full pl-10 pr-4 py-2 bg-background rounded-full text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <Link href="/user/me" className="p-2 rounded-full hover:bg-card transition-colors">
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        {children}
      </div>
    </div>
  );
}