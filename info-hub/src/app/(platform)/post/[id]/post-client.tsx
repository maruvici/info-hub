"use client";

import { useState, useTransition } from "react";
import { Heart, Eye, Paperclip, MessageCircle, User } from "lucide-react";
import { toggleLike } from "@/app/actions/likes";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";

export default function PostClient({
  post,
  initialLikeCount,
  initialIsLiked,
  comments,
}: {
  post: any;
  initialLikeCount: number;
  initialIsLiked: boolean;
  comments: any[];
}) {
  const [isPending, startTransition] = useTransition();

  // Optimistic UI state for Likes
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  // Build the tree from the flat comments array
  console.log("Raw Comments:", comments);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    startTransition(async () => {
      try {
        await toggleLike(post.id);
      } catch (error) {
        setIsLiked(isLiked);
        setLikeCount(likeCount);
        console.error("Failed to toggle like:", error);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-6">
      {/* 1. Post Content Section */}
      <article className="bg-card rounded-[40px] p-8 md:p-14 shadow-soft border border-primary/5 space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-bold">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-[10px] text-white">
                {post.authorName[0]}
              </div>
              <span className="text-foreground uppercase tracking-tight">
                {post.authorName}
              </span>
            </div>
            <span className="opacity-30">•</span>
            <span className="uppercase tracking-widest text-[10px]">
              Published {post.createdAt}
            </span>
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              {post.type}
            </span>
            <div className="flex gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] font-black text-primary/40 uppercase">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-lg leading-relaxed text-foreground/80 space-y-6 border-t border-primary/5 pt-10 whitespace-pre-wrap font-medium">
          {post.content}
        </div>

        {/* Attachments Section */}
        <div className="pt-8 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Paperclip size={14} className="text-primary" /> Attachments
          </p>
          <div className="p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/20 text-primary/50 font-bold italic text-sm text-center">
            No files attached to this post.
          </div>
        </div>

        {/* Stats & Like Button */}
        <div className="flex items-center gap-6 pt-10 border-t border-primary/5">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all active:scale-95 shadow-lg ${
              isLiked
                ? "bg-red-500 text-white shadow-red-500/30"
                : "bg-red-500/5 text-red-500 hover:bg-red-500/10 shadow-none border border-red-500/10"
            }`}
          >
            <Heart size={22} fill={isLiked ? "white" : "none"} />
            {likeCount}
          </button>
          <div className="flex items-center gap-2 text-muted-foreground font-black uppercase tracking-widest text-[10px] bg-secondary/50 px-5 py-4 rounded-3xl">
            <Eye size={18} className="text-primary" /> {post.views.toLocaleString()} Views
          </div>
        </div>
      </article>

      {/* 2. Comments Section */}
      <section className="space-y-10">
        <div className="flex items-center justify-between border-b border-primary/5 pb-6">
          <h3 className="text-3xl font-black flex items-center gap-4 tracking-tighter">
            <MessageCircle size={32} className="text-primary" /> Discussion
          </h3>
          <div className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
            {comments.length} Comments
          </div>
        </div>

        {/* New Root Comment Input */}
        <div className="bg-card p-8 rounded-[40px] shadow-soft border border-primary/5">
           <div className="flex items-center gap-3 mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-primary">Join the conversation</p>
           </div>
           <CommentForm postId={post.id} placeholder="Share your insights with the team..." />
        </div>

        {/* Dynamic Nested Comments */}
        <div className="space-y-10 pt-4">
          {comments.length > 0 ? (
            comments.map((comment: any) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                postId={post.id} 
              />
            ))
          ) : (
            <div className="text-center py-20 bg-card/30 rounded-[40px] border-2 border-dashed border-primary/5">
              <p className="text-muted-foreground font-bold italic">
                No thoughts shared yet. Start the discussion above!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}