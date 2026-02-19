"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Bold, Italic, List, Link as LinkIcon, Code, 
  Send, X, Hash, BookOpen, MessageSquare, HelpCircle,
  Paperclip, FileText, FileWarning
} from "lucide-react";
import { createPost } from "@/app/actions/posts";
import { uploadAttachment } from "@/app/actions/attachments";
import RichTextEditor from "@/components/ui/rich-text-editor";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_FILES = 3;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
  'video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // doc, docx
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xls, xlsx
  'text/plain', 'text/csv'
];

type PostType = 'Article' | 'Discussion' | 'Inquiry';

export default function CreatePostClient({ user }: { user: any }) {
  const [postType, setPostType] = useState<PostType>('Article');
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editorJSON, setEditorJSON] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // 1. Check Total Count
      if (selectedFiles.length + newFiles.length > MAX_FILES) {
        alert(`You can only upload a maximum of ${MAX_FILES} files.`);
        return;
      }

      // 2. Validate Each File
      const validFiles = newFiles.filter(file => {
        // Size Check
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" is too large (Max 25MB).`);
          return false;
        }
        // Type Check
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`File "${file.name}" format is not supported.`);
          return false;
        }
        return true;
      });

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
    // Reset input so you can select the same file again if needed
    e.target.value = ""; 
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

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

  const handlePublish = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !editorJSON) return alert("Please fill in all fields");

    setIsPending(true);
    try {
      // 1. Create the post and get the ID back
      const result = await createPost({
        title,
        content: JSON.stringify(editorJSON),
        type: postType,
        tags: tags,
      });

      // 2. Only proceed to uploads if we have an ID
      if (result?.id && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileData = new FormData();
          fileData.append("file", file);
          await uploadAttachment(result.id, fileData); // 👈 Wait for each upload
        }
      }

      // 3. NOW we redirect manually
      router.push(`/post/${result.id}`);

    } catch (error) {
      console.error("Publishing Error:", error);
      alert("Something went wrong. Check the server console for details.");
    } finally {
      setIsPending(false);
    }
  };
    
  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gradient">Hello, {user.name?.split(' ')[0]}</h1>
          <h2 className="text-2xl font-black">What post do you want to make?</h2>
          <p className="text-muted-foreground font-medium">Categorize your thoughts and share them with the hub.</p>
        </div>

        <form autoComplete="off" action={handlePublish} className="bg-card shadow-soft rounded-[40px] p-8 md:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />

          {/* 1. Post Type Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Select Category</p>
            <div className="flex flex-wrap p-1.5 bg-background/50 rounded-2xl gap-1 w-fit border border-primary/5">
              <TypeButton active={postType === 'Article'} onClick={() => setPostType('Article')} icon={<BookOpen size={16}/>} label="Article" />
              <TypeButton active={postType === 'Discussion'} onClick={() => setPostType('Discussion')} icon={<MessageSquare size={16}/>} label="Discussion" />
              <TypeButton active={postType === 'Inquiry'} onClick={() => setPostType('Inquiry')} icon={<HelpCircle size={16}/>} label="Inquiry" />
            </div>
          </div>

          {/* 2. Title Input */}
          <input 
            name="title"
            required
            type="text" 
            placeholder="Give your post a compelling title..."
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:opacity-20 focus:ring-0"
          />

          {/* 3. Tag Input System */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center min-h-12 p-2 bg-background/30 rounded-2xl border border-primary/5 focus-within:border-primary/20 transition-all">
              <div className="p-2 text-primary"><Hash size={18} /></div>
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold animate-in fade-in zoom-in-95">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14}/></button>
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

          {/* 4. Rich Text Editor */}
          <RichTextEditor 
            onChange={(json) => setEditorJSON(json)} 
          />

          {/* 5. ATTACHMENT SYSTEM */}
          <div className="space-y-4 pt-4 border-t border-primary/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Attachments</p>
            
            <div className="flex flex-wrap gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in zoom-in-95">
                  <FileText size={14} className="text-primary" />
                  <span className="text-xs font-bold truncate max-w-37.5">{file.name}</span>
                  <button type="button" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))} 

              {selectedFiles.length < MAX_FILES && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary/20 rounded-xl text-primary/60 hover:border-primary/40 hover:text-primary transition-all text-xs font-black uppercase"
              >
                <Paperclip size={14} /> Add Files
              </button>
              )}
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          </div>

          <div className="pt-10 flex justify-end">
            <button 
              disabled={isPending}
              type="submit"
              className="group flex items-center gap-3 px-10 py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{isPending ? "Publishing..." : `Publish ${postType}`}</span>
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper components (keep them in the same file or export them)
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