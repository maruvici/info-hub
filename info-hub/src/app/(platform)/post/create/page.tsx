"use client";

import { useState } from "react";
import { 
  Bold, Italic, List, Link as LinkIcon, Code, 
  Paperclip, Send, X, FileText, Hash, 
  BookOpen, MessageSquare, HelpCircle 
} from "lucide-react";
import Link from "next/link";

type PostType = 'Article' | 'Discussion' | 'Inquiry';

export default function CreatePostPage() {
  const [postType, setPostType] = useState<PostType>('Article');
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{name: string, type: string}[]>([]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gradient">What post do you want to make?</h1>
          <p className="text-muted-foreground font-medium">Categorize your thoughts and share them with the hub.</p>
        </div>

        <div className="bg-card shadow-soft rounded-[40px] p-8 md:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />

          {/* 1. Post Type Selector (Segmented Control) */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Select Category</p>
            <div className="flex p-1.5 bg-background/50 rounded-2xl gap-1 w-fit border border-primary/5">
              <TypeButton 
                active={postType === 'Article'} 
                onClick={() => setPostType('Article')} 
                icon={<BookOpen size={16}/>} 
                label="Article" 
              />
              <TypeButton 
                active={postType === 'Discussion'} 
                onClick={() => setPostType('Discussion')} 
                icon={<MessageSquare size={16}/>} 
                label="Discussion" 
              />
              <TypeButton 
                active={postType === 'Inquiry'} 
                onClick={() => setPostType('Inquiry')} 
                icon={<HelpCircle size={16}/>} 
                label="Inquiry" 
              />
            </div>
          </div>

          {/* 2. Title Input */}
          <input 
            type="text" 
            placeholder="Give your post a compelling title..."
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:opacity-20 focus:ring-0"
          />

          {/* 3. Tag Input System */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center min-h-12 p-2 bg-background/30 rounded-2xl border border-primary/5 focus-within:border-primary/20 transition-all">
              <div className="p-2 text-primary">
                <Hash size={18} />
              </div>
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold animate-in fade-in zoom-in-95">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                </span>
              ))}
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-30 focus:ring-0"
              />
            </div>
          </div>

          {/* 4. Rich Text Placeholder */}
          <div className="space-y-4">
             <div className="flex flex-wrap items-center gap-1 pb-4 border-b border-primary/5">
                <EditorToolbarButton icon={<Bold size={18}/>} />
                <EditorToolbarButton icon={<Italic size={18}/>} />
                <EditorToolbarButton icon={<List size={18}/>} />
                <EditorToolbarButton icon={<LinkIcon size={18}/>} />
                <EditorToolbarButton icon={<Code size={18}/>} />
             </div>
             <textarea 
               placeholder="Write your content here..."
               className="w-full min-h-62.5 bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:opacity-20 focus:ring-0"
             />
          </div>

          <div className="pt-10 flex justify-end">
            <Link href="/dashboard">
              <button className="group flex items-center gap-3 px-10 py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <span>Publish {postType}</span>
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
        active 
        ? "bg-card text-primary shadow-soft" 
        : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function EditorToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2.5 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
      {icon}
    </button>
  );
}