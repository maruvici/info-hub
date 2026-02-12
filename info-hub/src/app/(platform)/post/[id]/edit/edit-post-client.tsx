"use client";

import { useState } from "react";
import { 
  Bold, Italic, List, Link as LinkIcon, Code, 
  Save, X, Hash, BookOpen, MessageSquare, HelpCircle 
} from "lucide-react";
import { updatePost } from "@/app/actions/posts";

export default function EditPostClient({ post }: { post: any }) {
  const [postType, setPostType] = useState(post.type);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [isPending, setIsPending] = useState(false);

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

  const handleUpdate = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) return alert("Please fill in all fields");

    setIsPending(true);
    try {
      await updatePost(post.id, {
        title,
        content,
        type: postType,
        tags: tags,
      });
    } catch (err: any) {
        if (err.message !== "NEXT_REDIRECT") {
            alert("Failed to update post.");
        }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gradient">Edit Post</h1>
          <p className="text-muted-foreground font-medium">Refine your insights and update the hub.</p>
        </div>

        <form action={handleUpdate} className="bg-card shadow-soft rounded-[40px] p-8 md:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />

          {/* 1. Post Type Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Category</p>
            <div className="flex flex-wrap p-1.5 bg-background/50 rounded-2xl gap-1 w-fit border border-primary/5">
              <TypeButton active={postType === 'Article'} onClick={() => setPostType('Article')} icon={<BookOpen size={16}/>} label="Article" />
              <TypeButton active={postType === 'Discussion'} onClick={() => setPostType('Discussion')} icon={<MessageSquare size={16}/>} label="Discussion" />
              <TypeButton active={postType === 'Inquiry'} onClick={() => setPostType('Inquiry')} icon={<HelpCircle size={16}/>} label="Inquiry" />
            </div>
          </div>

          {/* 2. Title Input */}
          <input 
            name="title"
            defaultValue={post.title}
            required
            type="text" 
            placeholder="Title"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:opacity-20 focus:ring-0"
          />

          {/* 3. Tag Input System */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center min-h-12 p-2 bg-background/30 rounded-2xl border border-primary/5">
              <div className="p-2 text-primary"><Hash size={18} /></div>
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
                </span>
              ))}
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tags..."
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-30 focus:ring-0"
              />
            </div>
          </div>

          {/* 4. Content */}
          <div className="space-y-4">
             <div className="flex flex-wrap items-center gap-1 pb-4 border-b border-primary/5">
                <EditorToolbarButton icon={<Bold size={18}/>} />
                <EditorToolbarButton icon={<Italic size={18}/>} />
                <EditorToolbarButton icon={<List size={18}/>} />
                <EditorToolbarButton icon={<LinkIcon size={18}/>} />
                <EditorToolbarButton icon={<Code size={18}/>} />
             </div>
             <textarea 
               name="content"
               defaultValue={post.content}
               required
               placeholder="Write your content here..."
               className="w-full min-h-[300px] bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:opacity-20 focus:ring-0"
             />
          </div>

          <div className="pt-10 flex justify-end gap-4">
             <a href={`/post/${post.id}`} className="px-8 py-4 font-bold text-muted-foreground hover:text-foreground transition-colors">
               Cancel
             </a>
            <button 
              disabled={isPending}
              type="submit"
              className="group flex items-center gap-3 px-10 py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{isPending ? "Saving..." : "Save Changes"}</span>
              <Save size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reuse your helpers
function TypeButton({ active, onClick, icon, label }: any) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${active ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:bg-background hover:text-foreground"}`}>
      {icon} <span className="text-sm">{label}</span>
    </button>
  );
}

function EditorToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button type="button" className="p-2.5 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
      {icon}
    </button>
  );
}