import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@/auth";

export default async function SchedulerHeader() {
  const session = await auth();
  
  // 1. Fetch unread notification count from the DB
  let unreadCount = 0;
  if (session?.user?.id) {
    const result = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false)
        )
      );
    unreadCount = result[0]?.value || 0;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-card backdrop-blur border-b border-primary/5 py-1">
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
        
        {/* Logo - Stays on the Left */}
        <Link href="/scheduler" className="flex items-center gap-2 font-bold text-lg md:text-xl text-gradient shrink-0">
          <span 
            className="w-4 h-7 md:h-8 bg-primary-gradient shrink-0" 
            style={{
              WebkitMaskImage: 'url(/ssi-logo.svg)',
              maskImage: 'url(/ssi-logo.svg)',
              maskRepeat: 'no-repeat',
              maskSize: 'contain'
            }}
          />
          <span className="text-gradient after:content-[var(--content)] [--content:'SSI_Scheduler']"></span>
        </Link>

        {/* Action Icons - Right Side */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <ThemeToggle />
          
          {/* Notification Bell with Badge */}
          <button className="relative p-2 rounded-full hover:bg-muted transition-colors group">
            <Bell size={20} className="text-foreground/70 group-hover:text-primary transition-colors" />
            
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-in zoom-in duration-300">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}