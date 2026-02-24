"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  initialPosts, 
  activeType, 
  activeTag,
  activeSort
}: { 
  initialPosts: any[], 
  activeType?: string, 
  activeTag?: string,
  activeSort?: string
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [posts] = useState<PostPreview[]>(initialPosts);

  // Helper to update URL params
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-6">
      {/* 1. Vertically Collapsible Filter Section */}
      <aside className="w-full transition-all duration-500 ease-in-out">
        <div className="bg-card/50 backdrop-blur-md rounded-3xl shadow-soft overflow-hidden border border-primary/5">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-gradient rounded-xl text-white shadow-lg">
                <Filter size={18} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest text-gradient">
                Filter Explorer
              </span>
            </div>
            <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
              <ChevronDown size={20} className="text-primary" />
            </div>
          </button>

          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isExpanded ? "max-h-96 opacity-100 p-6 pt-0" : "max-h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-primary/10 pt-6">
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <BookOpen size={12}/> Post Content Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Article", "Discussion", "Inquiry"].map((item) => (
                    <button key={item} onClick={() => updateFilter("type", activeType === item ? null : item)}className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                        activeType === item 
                        ? "bg-primary text-white border-primary" 
                        : "bg-background border-transparent hover:border-primary/30"
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Tag size={12}/> Filter by Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Later, we can derive these from actual post tags */}
                  {["Digital Transformation", "Service Delivery", "Project Management", "Infrastructure", "Security", "Product"].map((tag) => (
                    <span 
                      key={tag} 
                      onClick={() => updateFilter("tag", activeTag === tag ? null : tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
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
            {/* Clear All Option */}
            {(activeType || activeTag) && (
              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-6 text-[10px] font-black text-primary uppercase underline underline-offset-4"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-3xl shadow-soft border border-primary/5">
          <div className="flex items-center gap-4">
            <h2 className="font-black text-lg ml-2">Knowledge Feed</h2>
            <Link href="/post/create">
              <button className="flex items-center gap-2 px-5 py-2 bg-primary-gradient text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus size={20} />
                <span>Create Post</span>
              </button>
            </Link>
          </div>
          <div className="flex gap-2 p-1 bg-background rounded-xl text-[10px] font-black">
           {["Recent", "Liked", "Views"].map((sortOption) => (
              <button 
                key={sortOption} 
                onClick={() => updateFilter("sort", sortOption)}
                className={`px-3 py-2 rounded-lg transition-all uppercase tracking-widest ${
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
            <div className="text-center py-20 bg-card rounded-[40px] border border-dashed">
              <p className="text-muted-foreground font-bold">No posts found. Be the first to share something!</p>
            </div>
          )}
        </div>

        {/* Pagination Placeholder */}
        <div className="flex justify-center items-center gap-4 py-6">
          <button className="p-3 border rounded-full hover:bg-primary/5 transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-sm font-black uppercase tracking-widest opacity-50">Page 1 of 1</span>
          <button className="p-3 border rounded-full hover:bg-primary/5 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </main>
    </div>
  );
}

function PostCard({ post }: { post: PostPreview }) {
  const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
  
  return (
    <div className="bg-card rounded-4xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/10">
      <div className="flex gap-5">
        <div className="shrink-0 w-14 h-14 rounded-2xl bg-background border border-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
          <Icon size={28} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <Link href={`/post/${post.id}`} className="text-xl font-black group-hover:text-primary transition-colors leading-tight">
                {post.title}
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-black text-foreground uppercase tracking-widest">
              <User size={14} className="text-primary"/> {post.author}
            </span>
            <span className="opacity-30">•</span>
            <span className="font-bold">{post.date}</span>
            <div className="flex gap-1">
              {post.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-black uppercase tracking-tighter">#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 pt-4 border-t border-primary/5">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <Heart size={16} />
          <span>{post.likes} Likes</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Eye size={16} className="text-primary" />
          <span>{post.views} Views</span>
        </div>
      </div>
    </div>
  );
}