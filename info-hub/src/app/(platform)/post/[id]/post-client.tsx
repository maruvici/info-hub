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
  
  return <File size={20} className="text-gray-500" />; // Fallback
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

  // --- TIPTAP READ-ONLY SETUP ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: (() => {
      try {
        return JSON.parse(post.content);
      } catch (e) {
        return post.content; // Fallback if content is old plain text/HTML
      }
    })(),
    editable: false, // Disables all editing capabilities
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // We preserve your original font-medium and text colors, adding Tailwind Typography classes
        class: "prose prose-invert max-w-none text-lg leading-relaxed text-foreground/80 font-medium [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_pre]:bg-[#1e1e1e] [&_pre]:p-5 [&_pre]:rounded-2xl",
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

  // Permission Check
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
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-6">
      {/* 1. Post Content Section */}
      <article className="bg-card rounded-[40px] p-8 md:p-14 shadow-soft border border-primary/5 space-y-8">
        <div className="space-y-6">
          <div className="flex justify-between">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter pr-12">
              {post.title}
            </h1>
            {/* ACTION MENU */}
            {canEdit && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-3 bg-secondary/50 hover:bg-primary/10 rounded-full transition-all text-muted-foreground hover:text-primary shadow-sm border border-primary/5"
                  aria-label="Post options"
                >
                  <MoreVertical size={24} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-card border border-primary/10 shadow-2xl rounded-3xl overflow-hidden z-60 animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="flex items-center gap-3 px-6 py-4 text-sm font-black hover:bg-primary/5 text-foreground/80 hover:text-primary transition-colors border-b border-primary/5"
                    >
                      <Edit size={18} /> EDIT POST
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-3 px-6 py-4 text-sm font-black hover:bg-red-500/10 text-red-500 transition-colors w-full text-left"
                    >
                      <Trash2 size={18} /> DELETE POST
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

        <div className="border-t border-primary/5 pt-10">
          <EditorContent editor={editor} />
        </div>

        {/* Attachments Section */}
        <div className="pt-8 space-y-4">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Paperclip size={14} className="text-primary" /> Attachments
          </p>
          
          {attachments.length === 0 ? (
            <div className="p-6 bg-primary/5 rounded-3xl border border-dashed border-primary/20 text-primary/50 font-bold italic text-sm text-center">
              No files attached to this post.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file: any) => (
                <div key={file.id} className="group flex items-center p-3 bg-primary/30 border border-secondary/50 rounded-2xl hover:border-primary/50 transition-all">
                  <div className="p-3 bg-card rounded-xl mr-3">{getFileIcon(file.fileName)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{file.fileName}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase">{(file.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                  {/* ATTACHMENT ACTIONS */}
                  <div className="flex gap-1">
                    {/* DOWNLOAD */}
                    <a 
                      href={file.fileUrl} 
                      download={file.fileName}
                      className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-all"
                      title="Download"
                    >
                      <DownloadCloud size={18} />
                    </a>
                    {/* VIEW */}
                    <a 
                      href={file.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-all"
                      title="View"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className="flex items-center gap-2 text-muted-foreground font-black uppercase tracking-widest text-sm bg-secondary/50 px-5 py-4 rounded-3xl">
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
            {comments.length} Comment Threads
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
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
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