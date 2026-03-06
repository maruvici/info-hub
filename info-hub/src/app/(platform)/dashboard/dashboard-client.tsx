"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, MessageSquare, HelpCircle, Eye, Heart, 
  Filter, ChevronLeft, ChevronRight, ChevronDown, 
  Tag, User, Plus 
} from "lucide-react";
import Link from "next/link";

interface PostPreview {
  id: string;
  title: string;
  author: string;
  type: 'Article' | 'Discussion' | 'Inquiry';
  tags: string[];
  views: number;
  likes: number;
  date: string;
}

export default function DashboardClient({ 
  initialPosts, activeType, activeTag, activeSort, currentPage, totalPages 
}: { 
  initialPosts: any[], activeType?: string, activeTag?: string, 
  activeSort?: string, currentPage: number, totalPages: number 
}) {
  const router = useRouter();
  const [posts] = useState<PostPreview[]>(initialPosts);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.delete("page");
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-6xl mx-auto px-4 py-4 md:py-8">
      <aside className="w-full transition-all duration-500 ease-in-out">
        <div className="bg-card backdrop-blur-md rounded-2xl md:rounded-3xl shadow-soft overflow-hidden border border-primary/5">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-gradient rounded-xl text-white shadow-lg">
                <Filter size={16} className="md:w-[18px] md:h-[18px]" />
              </div>
              <span className="font-black text-xs md:text-sm uppercase tracking-widest text-gradient">
                Filter Explorer
              </span>
            </div>
            <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
              <ChevronDown size={18} className="text-primary md:w-[20px] md:h-[20px]" />
            </div>
          </button>

          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isExpanded ? "max-h-[1000px] opacity-100 p-4 md:p-6 pt-0" : "max-h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-t border-primary/10 pt-4 md:pt-6">
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <BookOpen size={12}/> Post Content Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Article", "Discussion", "Inquiry"].map((item) => (
                    <button 
                      key={item} 
                      onClick={() => updateFilter("type", activeType === item ? null : item)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm border ${
                        activeType === item 
                        ? "bg-primary text-white border-primary" 
                        : "bg-background border-transparent hover:border-primary/30"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Tag size={12}/> Filter by Tags
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {["Digital Transformation", "Service Delivery", "Project Management", "Infrastructure", "Security", "Product"].map((tag) => (
                    <span 
                      key={tag} 
                      onClick={() => updateFilter("tag", activeTag === tag ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold cursor-pointer transition-colors ${
                        activeTag === tag
                        ? "bg-primary text-white"
                        : "bg-primary/5 text-primary hover:bg-primary/10"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {(activeType || activeTag || activeSort ) && (
              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-6 text-[9px] md:text-[10px] font-black text-primary uppercase underline underline-offset-4"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-4 md:space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-card p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-soft border border-primary/5">
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <h2 className="font-black text-base md:text-lg ml-2 shrink-0">Knowledge Feed</h2>
            <Link href="/post/create" className="shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-primary-gradient text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus size={18} className="md:w-[20px] md:h-[20px]" />
                <span>Create Post</span>
              </button>
            </Link>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-background rounded-xl text-[9px] md:text-[10px] font-black">
           {["Recent", "Liked", "Views"].map((sortOption) => (
              <button 
                key={sortOption} 
                onClick={() => updateFilter("sort", sortOption)}
                className={`px-3 py-2 rounded-lg transition-all uppercase tracking-widest whitespace-nowrap flex-1 lg:flex-none ${
                  activeSort === sortOption 
                  ? "bg-card text-primary shadow-sm" 
                  : "hover:bg-card hover:text-primary text-muted-foreground"
                }`}
              >
                Most {sortOption}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12 md:py-20 bg-card rounded-3xl md:rounded-[40px] border border-dashed px-4">
              <p className="text-muted-foreground text-sm md:text-base font-bold">No posts found. Be the first to share something!</p>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center gap-4 md:gap-6 py-8 md:py-10 border-t border-primary/5">
          <button 
            disabled={currentPage <= 1}
            onClick={() => updateFilter("page", (currentPage - 1).toString())}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-card border border-primary/10 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-foreground transition-all shadow-soft"
          >
            <ChevronLeft size={18} className="md:w-[20px] md:h-[20px]" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-sm md:text-lg font-black whitespace-nowrap">Page {currentPage} of {totalPages || 1}</span>
          </div>

          <button 
            disabled={currentPage >= totalPages}
            onClick={() => updateFilter("page", (currentPage + 1).toString())}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-card border border-primary/10 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-card disabled:hover:text-foreground transition-all shadow-soft"
          >
            <ChevronRight size={18} className="md:w-[20px] md:h-[20px]" />
          </button>
        </div>
      </main>
    </div>
  );
}

function PostCard({ post }: { post: PostPreview }) {
  const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
  
  return (
    <div className="bg-card rounded-2xl md:rounded-4xl p-4 md:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/10">
      <div className="flex gap-3 md:gap-5">
        <div className="shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-background border border-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
          <Icon size={20} className="md:w-[28px] md:h-[28px]" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
          <div className="flex justify-between items-start">
            <Link href={`/post/${post.id}`} className="text-base md:text-xl font-black group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {post.title}
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 md:gap-x-4 md:gap-y-2 text-[10px] md:text-xs text-muted-foreground">
            <Link href={`/user/view/${encodeURIComponent(post.author)}`}>
              <span className="flex items-center gap-1 font-black text-foreground uppercase tracking-widest hover:text-primary hover:underline transition-all">
                <User size={12} className="text-primary md:w-[14px] md:h-[14px]"/> {post.author}
              </span>
            </Link>
            <span className="opacity-30">•</span>
            <span className="font-bold whitespace-nowrap">{post.date}</span>
            <div className="flex flex-wrap gap-1">
              {post.tags.map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded-md bg-primary/5 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-tighter">#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6 flex items-center gap-4 md:gap-6 pt-3 md:pt-4 border-t border-primary/5">
        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest">
          <Heart size={14} className="md:w-[16px] md:h-[16px]" />
          <span>{post.likes} <span className="hidden xs:inline">Likes</span></span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Eye size={14} className="text-primary md:w-[16px] md:h-[16px]" />
          <span>{post.views} <span className="hidden xs:inline">Views</span></span>
        </div>
      </div>
    </div>
  );
}