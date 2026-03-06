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
import RichTextEditor from "@/components/ui/rich-text-editor";

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

const AVAILABLE_TAGS=["Digital Transformation", "Service Delivery", "Project Management", "Infrastructure", "Security", "Product"];

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

  const [editorJSON, setEditorJSON] = useState<any>(() => {
    try {
      // Parse the JSON string from the database back into an object
      return JSON.parse(post.content);
    } catch (e) {
      // Fallback if the post was created before the rich text update
      return post.content; 
    }
  });

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

    if (!title || !editorJSON) return alert("Please fill in all fields");

    setIsPending(true);
    try {
      // 1. Update text content
      await updatePost(post.id, {
        title,
        content: JSON.stringify(editorJSON),
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

      window.location.assign(`/post/${post.id}`);

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

        <form action={handleUpdate} className="bg-card shadow-soft rounded-3xl md:rounded-[40px] p-5 md:p-12 space-y-6 md:space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />

          {/* 1. Post Type Selector */}
          <div className="space-y-3">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 md:ml-2">Select Category</p>
            <div className="flex flex-wrap p-1 md:p-1.5 bg-background/50 rounded-xl md:rounded-2xl gap-1 w-full md:w-fit border border-primary/5">
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
            className="w-full text-xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder:opacity-20 focus:ring-0 px-0"
          />

          {/* 3. Tag Input System */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Hash size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest">Select Tags</span>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2 p-3 md:p-4 bg-background/30 rounded-2xl md:rounded-3xl border border-primary/5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        removeTag(tag);
                      } else {
                        setTags([...tags, tag]); 
                      }
                    }}
                    className={`px-2.5 py-1.5 md:px-3 md:py-1 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all border-2 ${
                      isSelected 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-100" 
                        : "bg-card text-muted-foreground border-transparent hover:border-primary/20 hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            
            {tags.length === 0 && (
              <p className="text-[10px] text-muted-foreground font-medium ml-2">
                Please select at least one tag to categorize your post.
              </p>
            )}
          </div>

          {/* 4. Rich Text Editor */}
          <div className="min-h-[250px] md:min-h-[300px]">
             <RichTextEditor 
               content={editorJSON} 
               onChange={(json) => setEditorJSON(json)} 
             />
          </div>

          {/* 5. ATTACHMENT SYSTEM */}
          <div className="space-y-3 pt-4 border-t border-primary/5">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 md:ml-2">
              Attachments ({visibleExistingAttachments.length + selectedFiles.length}/{MAX_FILES})
            </p>
            
            <div className="flex flex-wrap gap-2 md:gap-3">
              {/* A. Existing Attachments */}
              {initialAttachments.map((file) => {
                const isMarkedForDeletion = deletedFileIds.includes(file.id);
                return (
                  <div 
                    key={file.id} 
                    className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/5 border rounded-xl transition-all ${
                      isMarkedForDeletion 
                        ? "bg-red-500/10 border-red-500/20 opacity-60 grayscale" 
                        : "bg-secondary/50 border-primary/10"
                    }`}
                  >
                    <FileText size={14} className={isMarkedForDeletion ? "text-red-500" : "text-primary"} />
                    <span className={`text-[10px] md:text-xs font-bold truncate max-w-[120px] md:max-w-[150px] ${isMarkedForDeletion ? "line-through text-red-500" : ""}`}>
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
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in zoom-in-95 max-w-full">
                  <FileText size={14} className="text-primary shrink-0" />
                  <span className="text-[10px] md:text-xs font-bold truncate max-w-[120px] md:max-w-[150px]">{file.name}</span>
                  <button type="button" onClick={() => removeSelectedFile(index)} className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* C. Add Button */}
              {(visibleExistingAttachments.length + selectedFiles.length) < MAX_FILES && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border-2 border-dashed border-primary/20 rounded-xl text-primary/60 hover:border-primary/40 hover:text-primary transition-all text-[10px] md:text-xs font-black uppercase"
                >
                  <Paperclip size={14} /> Add Files
                </button>
              )}
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>
          </div>
          
          <div className="pt-6 md:pt-10 flex justify-end">
             <a href={`/post/${post.id}`} className="px-8 py-4 font-bold text-muted-foreground hover:text-foreground transition-colors">
               Cancel
             </a>
            <button 
              disabled={isPending}
              type="submit"
              className="w-full md:w-auto group flex items-center justify-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-primary-gradient text-white rounded-xl md:rounded-2xl text-sm md:text-base font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
    <button 
      type="button" 
      onClick={onClick} 
      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold transition-all ${
        active 
          ? "bg-card text-primary shadow-soft" 
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-[10px] md:text-sm whitespace-nowrap">{label}</span>
    </button>
  );
}