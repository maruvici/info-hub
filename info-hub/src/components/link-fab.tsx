"use client";

import { useState } from "react";
import { MessageSquarePlus, Bug, BookText, X } from "lucide-react";

export function LinkFAB() {
  const [isOpen, setIsOpen] = useState(false);

  const links = {
    bugReport: "https://forms.cloud.microsoft/r/dmEmaxjTtY",
    docs: process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002",
  };

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end gap-3">
      {/* Expanded Buttons */}
      {isOpen && (
        <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <a
            href={links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3 bg-card border shadow-2xl rounded-2xl text-sm font-bold hover:bg-accent transition-all hover:-translate-x-1"
          >
            <BookText className="w-5 h-5 text-primary" />
            Documentation
          </a>
          <a
            href={links.bugReport}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3 bg-red-600 text-white shadow-2xl rounded-2xl text-sm font-bold hover:bg-red-700 transition-all hover:-translate-x-1"
          >
            <Bug className="w-5 h-5" />
            Report a Bug
          </a>
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-primary shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 active:scale-90"
        title="QA Feedback"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageSquarePlus className="w-7 h-7" />}
      </button>
    </div>
  );
}