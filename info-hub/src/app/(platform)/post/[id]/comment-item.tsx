"use client";

import { useState } from "react";
import { Reply, User } from "lucide-react";
import CommentForm from "./comment-form";

export default function CommentItem({ comment, postId }: { comment: any; postId: string }) {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex gap-4">
        {/* Profile indicator */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <User size={20} />
        </div>

        <div className="flex-1 space-y-2">
          <div className="bg-card p-4 rounded-3xl border border-primary/5 shadow-sm group-hover:border-primary/20 transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-black text-primary">{comment.authorName}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{comment.date}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
          </div>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors ml-2 uppercase tracking-widest"
          >
            <Reply size={12} /> {isReplying ? "Cancel" : "Reply"}
          </button>

          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-primary/10">
              <CommentForm 
                postId={postId} 
                parentId={comment.id} 
                placeholder={`Replying to ${comment.authorName}...`}
                onSuccess={() => setIsReplying(false)} 
              />
            </div>
          )}

          {/* Render Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 border-l-2 border-primary/5 pl-6">
              {comment.replies.map((reply: any) => (
                <CommentItem key={reply.id} comment={reply} postId={postId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}