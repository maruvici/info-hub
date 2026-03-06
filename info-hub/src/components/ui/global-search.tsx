"use client";

import { Search as SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/dashboard`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl relative group min-w-0">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 bg-background/50 rounded-full 
                   text-base md:text-sm 
                   focus:ring-2 focus:ring-primary/20 outline-none transition-all 
                   border border-primary/5 placeholder:text-muted-foreground/60"
      />
    </form>
  );
}