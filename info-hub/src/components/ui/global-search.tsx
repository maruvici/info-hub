"use client";

import { Search as SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function GlobalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Sync state with URL so the input isn't empty after searching
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Redirect to dashboard with the search query
      router.push(`/dashboard?q=${encodeURIComponent(query.trim())}`);
    } else {
      // If cleared, just go to dashboard
      router.push(`/dashboard`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles..."
        className="w-full pl-10 pr-4 py-2 bg-background rounded-full text-sm focus:ring-2 focus:ring-primary outline-none transition-all border border-primary/5"
      />
    </form>
  );
}