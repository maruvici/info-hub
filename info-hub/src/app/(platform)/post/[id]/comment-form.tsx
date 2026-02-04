"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/app/actions/comments";
import { Send } from "lucide-react";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export default function CommentForm({ postId, parentId, placeholder, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        await createComment(postId, content, parentId);
        setContent("");
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Comment failed", err);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || "Write your thoughts..."}
          disabled={isPending}
          className="w-full bg-background border border-primary/10 rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:ring-2 ring-primary/20 min-h-25 transition-all resize-none"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:scale-105 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}