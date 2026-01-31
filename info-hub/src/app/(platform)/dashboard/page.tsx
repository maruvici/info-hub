"use client";

import { useState } from "react";
import { BookOpen, MessageSquare, HelpCircle, Eye, Heart, Filter, ChevronLeft, ChevronRight, ChevronDown, Tag, User, Plus  } from "lucide-react";
import Link from "next/link";

// Types for our Mock Data
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

const MOCK_POSTS: PostPreview[] = [
  { id: "1", title: "Standard Operating Procedures for Security Patching", author: "Mark Tech", type: "Article", tags: ["Security", "Infrastructure"], views: 1204, likes: 45, date: "2 days ago" },
  { id: "2", title: "How do we handle client-side state in the new hub?", author: "Sarah Dev", type: "Inquiry", tags: ["Product", "Frontend"], views: 89, likes: 12, date: "5 hours ago" },
  { id: "3", title: "Brainstorming: 2026 Q1 Digital Transformation Goals", author: "Alex Lead", type: "Discussion", tags: ["Digital Transformation"], views: 450, likes: 67, date: "1 week ago" },
];

export default function DashboardPage() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Vertically Collapsible Filter Section */}
      <aside className="w-full transition-all duration-500 ease-in-out">
        <div className="bg-card/50 backdrop-blur-md rounded-3xl shadow-soft overflow-hidden">
          
          {/* Header - Always Visible */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-5 hover:bg-primary/10 transition-colors"
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

          {/* Collapsible Content */}
          <div 
            className={`transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-125 opacity-100 p-6 pt-0" : "max-h-0 opacity-0 p-0"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-primary/10 pt-6">
              {/* Filter Group: Type */}
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <BookOpen size={12}/> Post Content Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Articles", "Discussions", "Inquiries"].map((item) => (
                    <button key={item} className="px-4 py-2 rounded-xl bg-background border border-transparent hover:border-primary/30 hover:text-primary text-sm font-bold transition-all shadow-sm">
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Group: Tags */}
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Tag size={12}/> Popular Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Security", "Cloud", "DevOps", "Frontend"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold cursor-pointer hover:bg-primary/10 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg">Knowledge Feed</h2>
            <Link href="/post/create">
              <button className="flex items-center gap-2 px-5 py-1.5 bg-primary-gradient text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                <Plus size={20} />
                <span>Create Post</span>
              </button>
            </Link>
          </div>
          <div className="flex gap-2 p-1 bg-background rounded-lg text-xs font-semibold">
            {["Recent", "Liked", "Views"].map((sort) => (
              <button key={sort} className="px-3 py-1.5 rounded-md hover:bg-card hover:text-primary transition-all uppercase tracking-tighter">
                Most {sort}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 py-10">
          <button className="p-2 border rounded-full hover:bg-primary/10 transition-colors"><ChevronLeft size={20} /></button>
          <span className="text-sm font-medium px-4">Page 1 of 12</span>
          <button className="p-2 border rounded-full hover:bg-primary/10 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </main>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PostCard({ post }: { post: PostPreview }) {
  const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
  
  return (
    <div className="bg-card rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
      <div className="flex gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-background border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
          <Icon size={24} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <Link href={`/post/${post.id}`} className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                {post.title}
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex gap-x-2 font-bold text-foreground"><User size={16}></User> {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <div className="flex gap-1">
              {post.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-background border text-[10px] font-bold">#{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 pt-3">
        <div className="flex items-center gap-1.5 text-xs font-bold hover:text-red-500 transition-colors">
          <Heart size={16} />
          <span>{post.likes} Likes</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Eye size={16} />
          <span>{post.views} Views</span>
        </div>
      </div>
    </div>
  );
}