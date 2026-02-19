"use client";

import { useState } from "react";
import { User, FileText, Settings, Mail, Shield, Users, Heart, Eye, Calendar, BookOpen, MessageSquare, HelpCircle, Trash2 } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import Link from "next/link";

type Tab = "Details" | "Posts" | "Settings";

interface UserPageClientProps {
  user: any; 
  initialTab: Tab;
}

export default function UserPageClient({ user, posts, stats, initialTab }: any) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Sidebar Profile Card */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-card rounded-3xl p-8 text-center space-y-8 shadow-sm sticky top-24">
          <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-primary p-1">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               <User size={64} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black">{user.fullName}</h2>
            <p className="text-sm text-primary font-bold">{user.team || "General Team"}</p>
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
        {activeTab === "Details" && <UserDetails user={user} stats={stats} />}
        {activeTab === "Posts" && <UserPosts posts={posts} />}
        {activeTab === "Settings" && <UserSettings />}
      </main>
    </div>
  );
}

// Logic components remain identical but accept 'user' props
function UserDetails({ user, stats }: { user: any, stats: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-xl font-black border-b border-primary/5 pb-4">Personal Information</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <DetailItem icon={<Mail/>} label="Email" value={user.email} />
        <DetailItem icon={<Users/>} label="Team" value={user.team || "Not assigned"} />
        <DetailItem icon={<Shield/>} label="Role" value={user.role || "User"} />
        <DetailItem icon={<Calendar/>} label="Joined On" value={user.createdAt} />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 pt-8">
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-bold text-primary mb-1 uppercase tracking-tighter">Total Post Views</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Eye className="text-primary"/> {stats.totalViews.toLocaleString()}
          </div>
        </div>
        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-sm font-bold text-red-500 mb-1 uppercase tracking-tighter">Total Likes Received</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Heart className="text-red-500"/> {stats.totalLikes}
          </div>
        </div>
      </div>
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

function UserPosts({ posts }: { posts: any[] }) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-20 bg-background/50 rounded-3xl border border-dashed border-primary/10">
                <p className="text-muted-foreground font-bold">You haven't posted anything yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-xl font-black border-b border-primary/5 pb-4">My Contributions</h3>
            <div className="grid gap-4">
                {posts.map((post) => {
                    const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
                    return (
                        <div key={post.id} className="bg-background/50 p-5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-card rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <Link href={`/post/${post.id}`} className="font-black text-lg hover:text-primary transition-colors line-clamp-1">
                                            {post.title}
                                        </Link>
                                        <div className="flex gap-3 text-xs items-center font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            <span>{post.createdAt}</span>
                                            <span className="flex items-center gap-1"><Heart size={10}/>{post.likes}</span>
                                            <span className="flex items-center gap-1"><Eye size={10}/> {post.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
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
        <LogoutButton />
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