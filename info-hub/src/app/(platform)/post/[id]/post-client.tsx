"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { 
  Heart, Eye, Paperclip, MessageCircle, MoreVertical, Edit, 
  Trash2, DownloadCloud, ExternalLink, FileText, FileImage, 
  FileAudio, FileVideo, File 
} from "lucide-react";
import { toggleLike } from "@/app/actions/likes";
import { deletePost } from "@/app/actions/posts";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";
import Link from "next/link"
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext!)) return <FileImage size={20} className="text-purple-500" />;
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext!)) return <FileVideo size={20} className="text-red-500" />;
  if (['mp3', 'wav', 'ogg'].includes(ext!)) return <FileAudio size={20} className="text-yellow-500" />;
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(ext!)) return <FileText size={20} className="text-blue-500" />;
  
  return <File size={20} className="text-gray-500" />;
}

export default function PostClient({
  post,
  attachments = [],
  initialLikeCount,
  initialIsLiked,
  comments,
  currentUserId,
  currentUserRole,
}: {
  post: any;
  attachments?: any[];
  initialLikeCount: number;
  initialIsLiked: boolean;
  comments: any[];
  currentUserId: string | null;
  currentUserRole: "User" | "Admin" | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: (() => {
      try {
        return JSON.parse(post.content);
      } catch (e) {
        return post.content; 
      }
    })(),
    editable: false, 
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none text-base md:text-lg leading-relaxed text-foreground/80 font-medium [&_ul]:list-disc [&_ul]:ml-4 md:[&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-4 md:[&_ol]:ml-6 [&_pre]:bg-[#1e1e1e] [&_pre]:p-4 md:[&_pre]:p-5 [&_pre]:rounded-xl md:[&_pre]:rounded-2xl overflow-x-auto",
      },
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    
    startTransition(async () => {
      try {
        await deletePost(post.id);
      } catch (err: any) {
        if (err.message !== "NEXT_REDIRECT") {
          alert("Failed to delete post.");
        }
      }
    });
  };

  const canEdit = currentUserId && (currentUserRole === "Admin" || currentUserId === post.authorId);

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
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 py-6 md:py-10 px-4 md:px-6">
      {/* 1. Post Content Section */}
      <article className="bg-card rounded-3xl md:rounded-[40px] p-5 md:p-14 shadow-soft border border-primary/5 space-y-6 md:space-y-8 overflow-hidden">
        <div className="space-y-4 md:space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tighter pr-4 md:pr-12 break-words">
              {post.title}
            </h1>
            {/* ACTION MENU */}
            {canEdit && (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 md:p-3 bg-secondary/50 hover:bg-primary/10 rounded-full transition-all text-muted-foreground hover:text-primary shadow-sm border border-primary/5"
                  aria-label="Post options"
                >
                  <MoreVertical size={20} className="md:w-6 md:h-6" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 md:mt-3 w-48 md:w-56 bg-card border border-primary/10 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black hover:bg-primary/5 text-foreground/80 hover:text-primary transition-colors border-b border-primary/5"
                    >
                      <Edit size={16} className="md:w-[18px] md:h-[18px]" /> EDIT POST
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black hover:bg-red-500/10 text-red-500 transition-colors w-full text-left"
                    >
                      <Trash2 size={16} className="md:w-[18px] md:h-[18px]" /> DELETE POST
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 md:gap-4 text-xs md:text-sm text-muted-foreground font-bold">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary-gradient flex items-center justify-center text-[8px] md:text-[10px] text-white shrink-0">
                {post.authorName[0]}
              </div>
              <Link href={`/user/view/${encodeURIComponent(post.authorName)}`} className="truncate max-w-[120px] md:max-w-none">
                <span className="text-foreground uppercase tracking-tight hover:text-primary hover:underline transition-all">
                  {post.authorName}
                </span>
              </Link>
            </div>
            <span className="opacity-30 hidden sm:inline">•</span>
            <span className="uppercase tracking-widest text-[8px] md:text-[10px] whitespace-nowrap">
              Published {post.createdAt}
            </span>
            <span className="px-3 py-1 md:px-4 md:py-1.5 bg-primary/10 text-primary rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              {post.type}
            </span>
            <div className="flex flex-wrap gap-1 md:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[9px] md:text-[10px] font-black text-primary/40 uppercase">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary/5 pt-6 md:pt-10 overflow-x-hidden">
          <EditorContent editor={editor} />
        </div>

        {/* Attachments Section */}
        <div className="pt-6 md:pt-8 space-y-4">
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Paperclip size={14} className="text-primary" /> Attachments
          </p>
          
          {attachments.length === 0 ? (
            <div className="p-4 md:p-6 bg-primary/5 rounded-2xl md:rounded-3xl border border-dashed border-primary/20 text-primary/50 font-bold italic text-xs md:text-sm text-center">
              No files attached to this post.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {attachments.map((file: any) => (
                <div key={file.id} className="group flex items-center p-2 md:p-3 bg-primary/30 border border-secondary/50 rounded-xl md:rounded-2xl hover:border-primary/50 transition-all">
                  <div className="p-2 md:p-3 bg-card rounded-lg md:rounded-xl mr-2 md:mr-3 shrink-0">
                    {getFileIcon(file.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-bold truncate">{file.fileName}</p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase">{(file.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex gap-0.5 md:gap-1 shrink-0">
                    <a 
                      href={file.fileUrl} 
                      download={file.fileName}
                      className="p-1.5 md:p-2 text-muted-foreground hover:text-primary rounded-lg transition-all"
                      title="Download"
                    >
                      <DownloadCloud size={16} className="md:w-[18px] md:h-[18px]" />
                    </a>
                    <a 
                      href={file.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 md:p-2 text-muted-foreground hover:text-primary rounded-lg transition-all"
                      title="View"
                    >
                      <ExternalLink size={16} className="md:w-[18px] md:h-[18px]" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats & Like Button */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6 pt-6 md:pt-10 border-t border-primary/5">
          <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-black transition-all active:scale-95 shadow-lg ${
              isLiked
                ? "bg-red-500 text-white shadow-red-500/30"
                : "bg-red-500/5 text-red-500 hover:bg-red-500/10 shadow-none border border-red-500/10"
            }`}
          >
            <Heart size={20} className="md:w-[22px] md:h-[22px]" fill={isLiked ? "white" : "none"} />
            {likeCount}
          </button>
          <div className="flex-1 sm:flex-none flex justify-center items-center gap-2 text-muted-foreground font-black uppercase tracking-widest text-xs md:text-sm bg-secondary/50 px-4 py-3 md:px-5 md:py-4 rounded-2xl md:rounded-3xl">
            <Eye size={16} className="md:w-[18px] md:h-[18px] text-primary" /> {post.views.toLocaleString()} Views
          </div>
        </div>
      </article>

      {/* 2. Comments Section */}
      <section className="space-y-6 md:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/5 pb-4 md:pb-6">
          <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3 md:gap-4 tracking-tighter">
            <MessageCircle size={24} className="md:w-8 md:h-8 text-primary" /> Discussion
          </h3>
          <div className="self-start sm:self-auto px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest">
            {comments.length} Comment Threads
          </div>
        </div>

        {/* New Root Comment Input */}
        <div className="bg-card p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-soft border border-primary/5">
           <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-primary">Join the conversation</p>
           </div>
           <CommentForm postId={post.id} placeholder="Share your insights with the team..." />
        </div>

        {/* Dynamic Nested Comments */}
        <div className="space-y-6 md:space-y-10 pt-2 md:pt-4">
          {comments.length > 0 ? (
            comments.map((comment: any) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                postId={post.id}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))
          ) : (
            <div className="text-center py-12 md:py-20 bg-card/30 rounded-3xl md:rounded-[40px] border-2 border-dashed border-primary/5 px-4">
              <p className="text-xs md:text-sm text-muted-foreground font-bold italic">
                No thoughts shared yet. Start the discussion above!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}