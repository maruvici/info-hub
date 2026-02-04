"use client";

import { useState, useTransition } from "react";
import { Heart, Eye, Paperclip, MessageCircle, Send, CornerDownRight } from "lucide-react";
import { toggleLike } from "@/app/actions/likes";

export default function PostClient({
  post, 
  initialLikeCount, 
  initialIsLiked,
  comments,
}: { 
  post: any, 
  initialLikeCount: number, 
  initialIsLiked: boolean,
  comments: any[],
}) {

  const [isPending, startTransition] = useTransition();
  
  // Optimistic UI state
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleLike = () => {
    // Optimistically update the UI before the server responds
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    startTransition(async () => {
      try {
        await toggleLike(post.id);
      } catch (error) {
        // Rollback on error
        setIsLiked(isLiked);
        setLikeCount(likeCount);
        console.error("Failed to toggle like:", error);
      }
    });
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 py-10 px-6">
      {/* 1. Post Content Section */}
      <article className="bg-card rounded-3xl p-8 md:p-12 shadow-soft border border-primary/5 space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-black leading-tight tracking-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            <span className="text-foreground font-bold uppercase tracking-tight">{post.authorName}</span>
            <span className="opacity-30">•</span>
            <span className="font-bold">Published {post.createdAt}</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
              {post.type}
            </span>
            <div className="flex gap-2">
               {post.tags.map((tag: string) => (
                 <span key={tag} className="text-xs font-bold text-primary/60">#{tag}</span>
               ))}
            </div>
          </div>
        </div>

        <div className="text-lg leading-relaxed text-foreground/80 space-y-4 border-t border-primary/5 pt-8 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Attachments Placeholder */}
        <div className="pt-8 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Paperclip size={14}/> Attachments
          </p>
          <div className="flex items-center gap-2 text-primary font-bold opacity-50 italic text-sm">
            No files attached to this post.
          </div>
        </div>

        <div className="flex items-center gap-6 pt-8 border-t border-primary/5">
          <button 
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all active:scale-95 ${
              isLiked
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            }`}
          >
            <Heart size={20} fill={isLiked ? "white" : "none"} /> 
            {likeCount}
          </button>
          <div className="flex items-center gap-2 text-muted-foreground font-black uppercase tracking-widest text-xs">
            <Eye size={20} className="text-primary"/> {post.views.toLocaleString()} Views
          </div>
        </div>
      </article>

      {/* 2. Comments Section */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <MessageCircle className="text-primary"/> Discussion
        </h3>

        {/* New Comment Input */}
        <div className="flex gap-4 bg-card p-5 rounded-3xl shadow-soft border border-primary/5">
          <div className="w-10 h-10 rounded-full bg-primary-gradient shrink-0" />
          <div className="flex-1 relative">
            <textarea 
              placeholder="Add to the conversation..." 
              className="w-full bg-transparent border-none outline-none resize-none pt-2 text-sm font-medium placeholder:opacity-50"
              rows={2}
            />
            <button className="absolute bottom-0 right-0 p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors">
              <Send size={20}/>
            </button>
          </div>
        </div>

        {/* Mock Comments for UI structure */}
        <div className="space-y-4">
            <CommentItem author="Alice Security" date="1 hour ago" content="Great write up! Does this cover the US-East-1 outage scenarios?" likes={12} />
            <div className="pl-8 md:pl-12 border-l-2 border-primary/10 space-y-4">
              <CommentItem author={post.authorName} date="30 mins ago" content="Yes, that's exactly why we implemented the active-passive switch." likes={5} isReply />
            </div>
        </div>
      </section>
    </div>
  );
}

function CommentItem({ author, date, content, likes, isReply = false }: any) {
  return (
    <div className="bg-card rounded-3xl p-6 space-y-4 shadow-soft border border-primary/5 relative">
      {isReply && <CornerDownRight className="absolute -left-7 top-6 text-primary/30" size={20}/>}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary">
            {author[0]}
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">{author}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">{date}</p>
          </div>
        </div>
        <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Reply</button>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed font-medium">{content}</p>
      <div className="flex items-center gap-4 pt-2">
         <button className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:scale-110 transition-transform">
           <Heart size={14}/> {likes}
         </button>
      </div>
    </div>
  );
}