"use client";

import { User, Mail, Briefcase, Eye, FileText, Calendar } from "lucide-react";

export default function PublicUserClient({ user, posts, stats }: any) {
  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-card rounded-[40px] p-8 md:p-12 shadow-soft border border-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-primary-gradient flex items-center justify-center text-white shadow-2xl shadow-primary/30">
            <User size={64} />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight">{user.fullName}</h1>
              <p className="text-primary font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                <Briefcase size={16} /> {user.team}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-primary/5">
                <Mail size={14} className="text-primary" /> {user.email}
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-primary/5">
                <Calendar size={14} className="text-primary" /> Joined {user.createdAt}
              </span>
            </div>
          </div>

          {/* Quick Stats Block */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <StatBox label="Views" value={stats.totalViews} icon={<Eye size={18}/>} />
            <StatBox label="Posts" value={stats.postCount} icon={<FileText size={18}/>} />
          </div>
        </div>
      </div>

      {/* Posts Section with Scrollable UI */}
      <div className="bg-card rounded-[40px] p-8 shadow-soft border border-primary/5">
        <h2 className="text-xl font-black mb-6 px-2">Published Knowledge</h2>
        
        {/* THE UI POLISH: Scrollable Container */}
        <div className="max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <div className="grid gap-4">
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <a 
                  key={post.id} 
                  href={`/post/${post.id}`}
                  className="group p-5 bg-background/50 rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-md transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest opacity-50">
                      <span>{post.type}</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Eye size={14} /> {post.views}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-center py-20 text-muted-foreground font-medium italic">
                This user hasn't shared any posts yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-background/80 p-4 rounded-3xl border border-primary/5 flex flex-col items-center justify-center min-w-24">
      <div className="text-primary mb-1">{icon}</div>
      <span className="text-lg font-black">{value}</span>
      <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{label}</span>
    </div>
  );
}