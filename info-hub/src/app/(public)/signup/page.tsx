"use client";

import { Suspense } from "react";
import SignupFormContent from "./signup-form-content";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 py-20">
      <div className="w-full max-w-2xl space-y-10">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        
        <div className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-4 font-bold text-5xl text-gradient">
            <span 
              className="bg-primary-gradient" 
              style={{
                height: '1em', 
                width: '0.5em',
                WebkitMaskImage: 'url(/ssi-logo.svg)',
                maskImage: 'url(/ssi-logo.svg)',
                maskRepeat: 'no-repeat',
                maskSize: 'contain'
              }}
            />
            <span className="text-gradient">SSI Info Hub</span>
          </Link>
          <p className="text-muted-foreground font-medium">Create your account to start sharing knowledge.</p>
        </div>

        {/* THE FIX: Wrapping the form content in Suspense.
            This allows Next.js to prerender the page during 'npm run build'.
        */}
        <Suspense fallback={
          <div className="bg-card shadow-soft rounded-[40px] p-12 text-center animate-pulse">
            <p className="text-muted-foreground">Loading registration details...</p>
          </div>
        }>
          <SignupFormContent />
        </Suspense>
      </div>
    </div>
  );
}