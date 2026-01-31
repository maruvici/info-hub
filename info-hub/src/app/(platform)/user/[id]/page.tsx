"use client";

import { useState } from "react";
import { User, FileText, Settings, Mail, Shield, Users, Heart, Eye, BookOpen, MessageSquare, HelpCircle } from "lucide-react";
import Link from "next/link";

type Tab = "Details" | "Posts" | "Settings";

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

export default function UserPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Details");

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Sidebar Profile Card */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-card rounded-3xl p-8 text-center space-y-12 shadow-sm sticky top-24">
          <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-primary p-1">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               <User size={64} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black">Jane Doe</h2>
            <p className="text-sm text-primary font-bold">Product Team</p>
          </div>

          <nav className="flex flex-col gap-2">
            <TabButton active={activeTab === "Details"} onClick={() => setActiveTab("Details")} icon={<User size={18}/>} label="User Details" />
            <TabButton active={activeTab === "Posts"} onClick={() => setActiveTab("Posts")} icon={<FileText size={18}/>} label="My Posts" />
            <TabButton active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} icon={<Settings size={18}/>} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 bg-card rounded-3xl p-8 shadow-sm">
        {activeTab === "Details" && <UserDetails />}
        {activeTab === "Posts" && <UserPosts />}
        {activeTab === "Settings" && <UserSettings />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        active ? "bg-primary text-white shadow-lg shadow-primary/30 translate-x-2" : "hover:bg-background text-muted-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function UserDetails() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-xl font-black border-b pb-4">Personal Information</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <DetailItem icon={<Mail/>} label="Email" value="jane.doe@company.com" />
        <DetailItem icon={<Users/>} label="Team" value="Product Management" />
        <DetailItem icon={<Shield/>} label="Role" value="Administrator" />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 pt-8">
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-bold text-primary mb-1">Total Post Views</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Eye className="text-primary"/> 12,402
          </div>
        </div>
        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-sm font-bold text-red-500 mb-1">Total Likes Received</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Heart className="text-red-500"/> 1,290
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPosts() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-xl font-black border-b pb-4">My Posts</h3>
      <div className="space-y-4">
        {MOCK_POSTS.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

function UserSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black border-b pb-4 text-red-500">Account Settings</h3>
      <button className="w-full p-4 border rounded-xl font-bold hover:bg-background transition-colors flex justify-between">
        Change Password <span>→</span>
      </button>
      <button className="w-full p-4 border rounded-xl font-bold hover:bg-background transition-colors flex justify-between">
        Change Team <span>→</span>
      </button>
      <button className="w-full p-4 border rounded-xl font-bold hover:bg-background transition-colors flex justify-between">
        Update Profile Picture <span>→</span>
      </button>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-background border rounded-lg text-primary">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostPreview }) {
  const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
  
  return (
    <div className="bg-background rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
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