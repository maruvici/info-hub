"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Heart, Reply, CornerDownRight, MoreVertical, Edit2, Trash2, X, Check } from "lucide-react";
import { toggleCommentLike } from "@/app/actions/likes";
import { deleteComment, updateComment } from "@/app/actions/comments";
import CommentForm from "./comment-form";

interface CommentItemProps {
  comment: any;
  postId: string;
  currentUserId: string | null;
  currentUserRole: "User" | "Admin" | null;
}

export default function CommentItem({ comment, postId, currentUserId, currentUserRole }: CommentItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isReplying, setIsReplying] = useState(false);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // Menu State
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Optimistic Like State
  const [likes, setLikes] = useState(Number(comment.likeCount) || 0);
  const [isLiked, setIsLiked] = useState(!!comment.isLiked);

  // Click Outside Handler for Menu
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

  const canEdit = currentUserId && (currentUserRole === "Admin" || currentUserId === comment.authorId);

  return (
    <div className="group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shadow-sm">
          {comment.authorName?.[0]}
        </div>

        <div className="flex-1 space-y-2">
          {/* Comment Bubble */}
          <div className="bg-card p-5 rounded-[28px] border border-primary/5 shadow-soft hover:border-primary/20 transition-all relative group/bubble">
            
            {/* Header: Author + Date + Menu */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-xs font-black text-primary uppercase">{comment.authorName}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">{comment.date}</span>
              </div>

              {/* Action Menu (Top Right) */}
              {canEdit && !isEditing && (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 hover:bg-primary/10 rounded-full text-muted-foreground/50 hover:text-primary transition-colors opacity-0 group-hover/bubble:opacity-100"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 w-32 bg-card border border-primary/10 shadow-xl rounded-xl overflow-hidden z-10 animate-in fade-in zoom-in-95">
                      <button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-primary/5 w-full text-left"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-red-500/10 text-red-500 w-full text-left"
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
              <div className="space-y-3">
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-background/50 border border-primary/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 ring-primary/20 resize-none min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-muted-foreground hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={isPending}
                    className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>

          {/* Action Buttons (Like, Reply) */}
          <div className="flex items-center gap-6 pl-2">
            <button 
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-1.5 text-xs font-black transition-all hover:scale-110 ${
                isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
              {likes}
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-xs font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              <Reply size={14} /> {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-primary/10 relative">
               <CornerDownRight className="absolute -left-[9px] top-0 text-primary/30 bg-background" size={16}/>
              <CommentForm 
                postId={postId} 
                parentId={comment.id} 
                placeholder={`Replying to ${comment.authorName}...`}
                onSuccess={() => setIsReplying(false)} 
              />
            </div>
          )}

          {/* Recursive Replies - NOW PASSING USER PROPS DOWN */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-6 border-l-2 border-primary/5 pl-6 md:pl-8 relative">
              {comment.replies.map((reply: any) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  postId={postId} 
                  // 👇 Critical: Pass permissions to children
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