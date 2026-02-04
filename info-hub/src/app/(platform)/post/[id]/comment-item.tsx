"use client";

import { useState, useTransition } from "react";
import { Heart, Reply, User } from "lucide-react";
import { toggleCommentLike } from "@/app/actions/likes";

export default function CommentItem({ comment, postId }: { comment: any; postId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isReplying, setIsReplying] = useState(false);
  
  // Optimistic State
  const [likes, setLikes] = useState(Number(comment.likeCount) || 0);
  const [isLiked, setIsLiked] = useState(!!comment.isLiked);

  const handleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);

    startTransition(async () => {
      try {
        await toggleCommentLike(comment.id);
      } catch (err) {
        // Rollback
        setLikes(Number(comment.likeCount));
        setIsLiked(!!comment.isLiked);
      }
    });
  };

  return (
    <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shadow-sm">
          {comment.authorName?.[0]}
        </div>

        <div className="flex-1 space-y-2">
          <div className="bg-card p-5 rounded-[28px] border border-primary/5 shadow-soft hover:border-primary/20 transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-primary uppercase">{comment.authorName}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">{comment.date}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed font-medium">{comment.content}</p>
          </div>

          <div className="flex items-center gap-6 pl-2">
            {/* THE NEW LIKE BUTTON */}
            <button 
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-1.5 text-[10px] font-black transition-all hover:scale-110 ${
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
              {likes}
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              <Reply size={14} /> {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>

          {/* ... nested ReplyForm and recursive CommentItems ... */}
        </div>
      </div>
    </div>
  );
}