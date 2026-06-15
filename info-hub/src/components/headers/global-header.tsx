import { User, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { Suspense } from "react";
import GlobalSearch from "@/components/ui/global-search";

export default function GlobalHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-card backdrop-blur border-b border-primary/5 py-1">
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center gap-2 md:gap-4">
        {/* Logo - Text hidden on smallest screens to save space */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg md:text-xl text-gradient shrink-0">
          <BookOpen />
          <span className="text-gradient after:content-[var(--content)] [--content:'Info Hub'] md:[--content:'SSI_Info_Hub']"></span>
        </Link>

        {/* Search - Takes up all available middle space */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<div className="h-10 w-full bg-muted animate-pulse rounded-full" />}>
            <GlobalSearch />
          </Suspense>
        </div>

        {/* Icons - Stay on the right */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <ThemeToggle />
          <Link href={'/user'} className="p-2 rounded-full hover:bg-muted transition-colors">
            <User size={18} className="md:w-[20px] md:h-[20px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}