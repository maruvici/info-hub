"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Bold, Italic, List, Link as LinkIcon, Code, 
  Save, X, Hash, BookOpen, MessageSquare, HelpCircle,
  Paperclip, FileText, Trash2, Undo2
} from "lucide-react";
import { updatePost } from "@/app/actions/posts";
import { uploadAttachment, deleteAttachment } from "@/app/actions/attachments";

// Validation Constants (Same as Create Post)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_FILES = 3;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
  'video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv'
];

export default function EditPostClient({ post, initialAttachments = [] }: { post: any, initialAttachments?: any[] }) {
  const router = useRouter();
  
  // Existing States
  const [postType, setPostType] = useState(post.type);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [isPending, setIsPending] = useState(false);

  // New File States
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out attachments that are marked for deletion for the UI
  const visibleExistingAttachments = initialAttachments.filter(
    (file) => !deletedFileIds.includes(file.id)
  );

  // --- 1. Tag Logic (Unchanged) ---
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

  // --- 2. Attachment Logic (Adapted from Create Post) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check Total Count (Existing + New)
      const currentTotal = initialAttachments.length + selectedFiles.length;
      if (currentTotal + newFiles.length > MAX_FILES) {
        alert(`You can only upload a maximum of ${MAX_FILES} files.`);
        return;
      }

      // Validate Each File
      const validFiles = newFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" is too large (Max 25MB).`);
          return false;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`File "${file.name}" format is not supported.`);
          return false;
        }
        return true;
      });

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
    e.target.value = ""; 
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Toggle Deletion State instead of calling Action ---
  const toggleDeleteExisting = (id: string) => {
    setDeletedFileIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // --- 3. Submit Logic ---
  const handleUpdate = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) return alert("Please fill in all fields");

    setIsPending(true);
    try {
      // 1. Update text content
      await updatePost(post.id, {
        title,
        content,
        type: postType,
        tags: tags,
      });

      // 2. Perform PENDING DELETIONS now that user clicked "Save"
      if (deletedFileIds.length > 0) {
        for (const id of deletedFileIds) {
          await deleteAttachment(id);
        }
      }

      // 3. Upload NEW files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileData = new FormData();
          fileData.append("file", file);
          await uploadAttachment(post.id, fileData);
        }
      }
      router.push(`/post/${post.id}`);
      router.refresh();

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

          {/* 5. ATTACHMENT SYSTEM */}
          <div className="space-y-4 pt-4 border-t border-primary/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
              Attachments ({visibleExistingAttachments.length + selectedFiles.length}/{MAX_FILES})
            </p>
            
            <div className="flex flex-wrap gap-3">
              {/* A. Existing Attachments */}
              {initialAttachments.map((file) => {
                const isMarkedForDeletion = deletedFileIds.includes(file.id);
                return (
                  <div 
                    key={file.id} 
                    className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${
                      isMarkedForDeletion 
                        ? "bg-red-500/10 border-red-500/20 opacity-60 grayscale" 
                        : "bg-secondary/50 border-primary/10"
                    }`}
                  >
                    <FileText size={14} className={isMarkedForDeletion ? "text-red-500" : "text-primary"} />
                    <span className={`text-xs font-bold truncate max-w-[150px] ${isMarkedForDeletion ? "line-through text-red-500" : ""}`}>
                      {file.fileName}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => toggleDeleteExisting(file.id)} 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title={isMarkedForDeletion ? "Undo deletion" : "Remove file"}
                    >
                      {isMarkedForDeletion ? <Undo2 size={14} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                );
              })}

              {/* B. New Uploads (Pending) */}
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                  <FileText size={14} className="text-primary" />
                  <span className="text-xs font-bold truncate max-w-[150px]">{file.name} (New)</span>
                  <button type="button" onClick={() => removeSelectedFile(index)} className="text-muted-foreground hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* C. Add Button */}
              {(visibleExistingAttachments.length + selectedFiles.length) < MAX_FILES && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary/20 rounded-xl text-primary/60 hover:border-primary/40 hover:text-primary transition-all text-xs font-black uppercase"
                >
                  <Paperclip size={14} /> Add Files
                </button>
              )}
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
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

// Reuse helpers
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