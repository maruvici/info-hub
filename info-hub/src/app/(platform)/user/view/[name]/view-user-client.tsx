"use client";

import { User, Mail, Briefcase, Eye, FileText, Calendar } from "lucide-react";

export default function PublicUserClient({ user, posts, stats }: any) {
  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 px-4 md:px-6 space-y-6 md:space-y-8">
      {/* Header Profile Card */}
      <div className="bg-card rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-soft border border-primary/5 relative overflow-hidden">
        {/* Background Decorative Blur - Slightly smaller on mobile */}
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/5 rounded-full -mr-24 -mt-24 md:-mr-32 md:-mt-32 blur-3xl" />
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start relative z-10">
          {/* Profile Icon Container */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary-gradient flex items-center justify-center text-white shadow-2xl shadow-primary/30 shrink-0">
            <User size={48} className="md:hidden" />
            <User size={64} className="hidden md:block" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight truncate">
                {user.fullName}
              </h1>
              <p className="text-primary font-bold flex items-center justify-center md:justify-start gap-2 mt-1 text-sm md:text-base">
                <Briefcase size={16} /> {user.team}
              </p>
            </div>

            {/* Badges Container */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-primary/5 whitespace-nowrap">
                <Mail size={14} className="text-primary" /> {user.email}
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-primary/5 whitespace-nowrap">
                <Calendar size={14} className="text-primary" /> Joined {user.createdAt}
              </span>
            </div>
          </div>

          {/* Quick Stats Block - Stays side-by-side even on small screens */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <StatBox label="Views" value={stats.totalViews} icon={<Eye size={18}/>} />
            <StatBox label="Posts" value={stats.postCount} icon={<FileText size={18}/>} />
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-card rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-soft border border-primary/5">
        <h2 className="text-lg md:text-xl font-black mb-6 px-2">Published Knowledge</h2>
        
        {/* Scrollable Container with Mobile-optimized Height */}
        <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto pr-2 md:pr-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <div className="grid gap-3 md:gap-4">
            {posts.length > 0 ? (
              posts.map((post: any) => (
                <a 
                  key={post.id} 
                  href={`/post/${post.id}`}
                  className="group p-4 md:p-5 bg-background/50 rounded-2xl md:rounded-3xl border border-transparent hover:border-primary/20 hover:shadow-md transition-all flex justify-between items-center gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-bold group-hover:text-primary transition-colors text-sm md:text-base truncate">
                      {post.title}
                    </h3>
                    <div className="flex gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-50">
                      <span className="shrink-0">{post.type}</span>
                      <span>•</span>
                      <span className="truncate">{post.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold">
                      <Eye size={14} /> {post.views}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-16 md:py-20 bg-background/30 rounded-3xl border border-dashed border-primary/10">
                <p className="text-muted-foreground font-medium italic text-sm">
                  This user hasn't shared any posts yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-background/80 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-primary/5 flex flex-col items-center justify-center min-w-[100px] md:min-w-24 shadow-sm">
      <div className="text-primary mb-1">{icon}</div>
      <span className="text-base md:text-lg font-black">{value.toLocaleString()}</span>
      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter opacity-40">{label}</span>
    </div>
  );
}