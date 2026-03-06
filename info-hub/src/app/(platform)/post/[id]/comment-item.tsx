"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Heart, Reply, CornerDownRight, MoreVertical, Edit2, Trash2, X, Check } from "lucide-react";
import { toggleCommentLike } from "@/app/actions/likes";
import { deleteComment, updateComment } from "@/app/actions/comments";
import CommentForm from "./comment-form";
import Link from "next/link";

interface CommentItemProps {
  comment: any;
  postId: string;
  currentUserId: string | null;
  currentUserRole: "User" | "Admin" | null;
}

export default function CommentItem({ comment, postId, currentUserId, currentUserRole }: CommentItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isReplying, setIsReplying] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [likes, setLikes] = useState(Number(comment.likeCount) || 0);
  const [isLiked, setIsLiked] = useState(!!comment.isLiked);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);

    startTransition(async () => {
      try {
        await toggleCommentLike(comment.id);
      } catch (err) {
        setLikes(Number(comment.likeCount));
        setIsLiked(!!comment.isLiked);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this comment?")) return;
    startTransition(async () => {
      await deleteComment(comment.id);
    });
  };

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    startTransition(async () => {
      await updateComment(comment.id, editContent);
      setIsEditing(false);
    });
  };

  const isDeleted = comment.content === "[This comment has been deleted]";
  const canEdit = currentUserId && (currentUserRole === "Admin" || currentUserId === comment.authorId);

  return (
    <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex gap-2.5 md:gap-4">
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs shadow-sm ${
          isDeleted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        }`}>
          {isDeleted ? "?" : comment.authorName?.[0]}
        </div>

        <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
          {/* Comment Bubble */}
          <div className={`bg-card p-3.5 md:p-5 rounded-[20px] md:rounded-[28px] border shadow-soft transition-all relative group/bubble ${
            isDeleted ? "border-dashed border-muted bg-muted/5" : "border-primary/5 hover:border-primary/20"
          }`}>
            
            {/* Header: Author + Date + Menu */}
            <div className="flex justify-between items-start mb-1.5 md:mb-2">
              <div className="flex flex-col truncate pr-2">
                {isDeleted ? (
                  <span className="text-[10px] md:text-xs font-black text-muted-foreground uppercase truncate">Deleted User</span>
                ) : (
                  <Link href={`/user/view/${encodeURIComponent(comment.authorName)}`} className="truncate">
                    <span className="text-[10px] md:text-xs font-black text-primary uppercase hover:underline truncate block">{comment.authorName}</span>
                  </Link>
                )}
                <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-50 truncate">{comment.date}</span>
              </div>

              {/* Action Menu (Top Right) */}
              {canEdit && !isEditing && (
                <div className="relative shrink-0" ref={menuRef}>
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 md:p-1.5 hover:bg-primary/10 rounded-full text-muted-foreground/50 hover:text-primary transition-colors md:opacity-0 md:group-hover/bubble:opacity-100"
                  >
                    <MoreVertical size={14} className="md:w-4 md:h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 w-28 md:w-32 bg-card border border-primary/10 shadow-xl rounded-xl overflow-hidden z-10 animate-in fade-in zoom-in-95">
                      {!isDeleted && (<button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-[10px] md:text-xs font-bold hover:bg-primary/5 w-full text-left"
                      >
                        <Edit2 size={12} /> Edit
                      </button>)}
                      <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-[10px] md:text-xs font-bold hover:bg-red-500/10 text-red-500 w-full text-left"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Logic: Display vs Edit Mode */}
            {isEditing ? (
              <div className="space-y-2 md:space-y-3">
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-background/50 border border-primary/10 rounded-xl p-2 md:p-3 text-base md:text-sm focus:outline-none focus:ring-2 ring-primary/20 resize-none min-h-20"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 md:p-2 text-muted-foreground hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <X size={14} className="md:w-4 md:h-4" />
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={isPending}
                    className="p-1.5 md:p-2 bg-primary text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Check size={14} className="md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-xs md:text-sm leading-relaxed font-medium whitespace-pre-wrap break-words ${
                isDeleted ? "text-muted-foreground italic" : "text-foreground/80"
              }`}>
                {comment.content}
              </p>
            )}
          </div>

          {/* Action Buttons (Like, Reply) */}
          <div className="flex items-center gap-4 md:gap-6 pl-2">
            {!isDeleted && (
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-black transition-all ${
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart size={12} className="md:w-[14px] md:h-[14px]" fill={isLiked ? "currentColor" : "none"} />
                {likes}
              </button>
            )}

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              <Reply size={12} className="md:w-[14px] md:h-[14px]" /> {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 md:mt-4 pl-3 md:pl-4 border-l-2 border-primary/10 relative">
               <CornerDownRight className="absolute -left-2 md:-left-2.5 md:w-4 md:h-4 top-0 text-primary/30 bg-background" size={14} />
              <CommentForm 
                postId={postId} 
                parentId={comment.id} 
                placeholder={`Replying to ${comment.authorName}...`}
                onSuccess={() => setIsReplying(false)} 
              />
            </div>
          )}

          {/* Recursive Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 md:mt-4 space-y-4 md:space-y-6 border-l-2 border-primary/5 pl-3 md:pl-8 relative">
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  postId={postId} 
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}