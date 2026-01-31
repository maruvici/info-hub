"use client";

import { Heart, Eye, Paperclip, MessageCircle, Send, CornerDownRight } from "lucide-react";

export default function PostPage() {
  return (
    <div className="max-w-8xl mx-auto space-y-8">
      {/* 1. Post Content Section */}
      <article className="bg-card rounded-3xl p-8 md:p-12 shadow-sm space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-black leading-tight">Implementing Multi-Region Resilience</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-bold">Mark Tech</span>
            <span>•</span>
            <span>Published Oct 24, 2025</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">Article</span>
            <div className="flex gap-2">
               <span className="text-xs">#Cloud</span>
               <span className="text-xs">#Infrastructure</span>
            </div>
          </div>
        </div>

        <div className="text-lg leading-relaxed text-foreground/80 space-y-4 border-t pt-8">
          <p>This article outlines our new strategy for regional failover...</p>
          <p>By leveraging Route53 latency-based routing combined with Aurora Global Databases, we can achieve an RPO of under 1 second.</p>
        </div>

        {/* Attachments */}
        <div className="pt-8 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Paperclip size={14}/> Attachments
          </p>
          <a href="#" className="flex items-center gap-2 text-primary font-bold hover:underline">
            <div className="p-2 bg-primary/10 rounded-lg"><FileIcon type="pdf"/></div>
            Architecture_Diagram_V2.pdf
          </a>
        </div>

        <div className="flex items-center gap-6 pt-8 border-t">
          <button className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all">
            <Heart size={20}/> 124
          </button>
          <div className="flex items-center gap-2 text-muted-foreground font-bold">
            <Eye size={20}/> 2,401 Views
          </div>
        </div>
      </article>

      {/* 2. Comments Section */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black flex items-center gap-2">
          <MessageCircle/> Discussion
        </h3>

        {/* New Comment Input */}
        <div className="flex gap-4 bg-card p-4 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/20 shrink-0" />
          <div className="flex-1 relative">
            <textarea 
              placeholder="Add to the conversation..." 
              className="w-full bg-transparent border-none outline-none resize-none pt-2"
            />
            <button className="absolute bottom-0 right-0 p-2 text-primary hover:bg-primary/10 rounded-lg">
              <Send size={20}/>
            </button>
          </div>
        </div>

        {/* Comment Thread (Example Nesting) */}
        <div className="space-y-4">
           <CommentItem author="Alice Security" date="1 hour ago" content="Great write up! Does this cover the US-East-1 outage scenarios?" likes={12} />
           <div className="pl-8 md:pl-12 border-l-2 border-primary/10 space-y-4">
             <CommentItem author="Mark Tech" date="30 mins ago" content="Yes, US-East-1 is our primary target for the active-passive switch." likes={5} isReply />
           </div>
        </div>
      </section>
    </div>
  );
}

function CommentItem({ author, date, content, likes, isReply = false }: any) {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 shadow-sm relative">
      {isReply && <CornerDownRight className="absolute -left-7 top-6 text-primary/30" size={20}/>}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div>
            <p className="text-sm font-black">{author}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{date}</p>
          </div>
        </div>
        <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Reply</button>
      </div>
      <p className="text-sm text-foreground/80">{content}</p>
      <div className="flex items-center gap-4 pt-2">
         <button className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:scale-110 transition-transform">
           <Heart size={14}/> {likes}
         </button>
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  return <span className="text-[10px] font-black uppercase">{type}</span>;
}