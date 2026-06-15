"use client";

import { Suspense } from "react";
import SignupFormContent from "./signup-form-content";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 py-12 md:py-20">
      <div className="w-full max-w-2xl space-y-8 md:space-y-10">
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ThemeToggle />
        </div>
        
        <div className="text-center space-y-3">
          <Link href="/" className="flex items-center justify-center gap-3 md:gap-4 font-bold text-3xl md:text-5xl text-gradient">
            <BookOpen />
            <span className="text-gradient">Info Hub</span>
          </Link>
          <p className="text-sm md:text-base text-muted-foreground font-medium px-4">
            Create your account to start sharing knowledge.
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-card shadow-soft rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-center animate-pulse border border-primary/5">
            <p className="text-muted-foreground text-sm font-bold">Loading registration details...</p>
          </div>
        }>
          <SignupFormContent />
        </Suspense>
      </div>
    </div>
  );
}