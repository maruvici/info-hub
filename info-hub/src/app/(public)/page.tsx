"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowRight, BookOpen, MessageSquare, Search, Shield, Users, Zap } from "lucide-react";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  // Fetch images for slideshow using API
  useEffect(() => {
    async function fetchImages() {
      const res = await fetch('/api/slideshow');
      const data = await res.json();
      if (data.length > 0) setImages(data);
    }
    fetchImages();
    sessionStorage.clear();
  }, []);

  // Automated Rotation of Slideshow
  useEffect(() => {
    if (images.length === 0) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-card/70 backdrop-blur-xl border-b border-primary/5 px-2 sm:px-4">
        <div className="container mx-auto h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl text-gradient truncate">
            <BookOpen/>
            <span className="text-gradient truncate">Info Hub</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 shrink-0"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION WITH DYNAMIC SLIDESHOW */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4 py-20">
          {/* 1. THE IMAGE LAYER (Bottom) */}
          <div className="absolute inset-0 z-0 bg-background">
            <AnimatePresence mode="wait">
              {images.length > 0 && (
                <motion.div
                  key={images[index]} // Using the URL as key is more robust than the index
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('${images[index]}')` }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* 2. THE OVERLAY LAYER (Middle) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            <div className="absolute inset-0 bg-card/20" />
          </div>

          {/* 3. THE CONTENT LAYER (Top) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 text-center space-y-6 max-w-4xl p-6 md:p-12"
          >
            {/* Hero Text */}
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Our Organization's Central <br className="hidden sm:block" />
              <span className="bg-primary-gradient bg-clip-text text-transparent">
                Knowledge Engine
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Share your wisdom, ask questions, and collaborate across our teams. 
              The single source of truth for our organization.
            </p>
            <div className="flex justify-center pt-4">
              <Link 
                href="/signup" 
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="py-12 md:py-20 bg-[rgb(var(--card))]">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Why Join Our Hub?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <FeatureCard icon={<BookOpen />} title="Knowledge Base" desc="Structured articles and guides for every team." />
              <FeatureCard icon={<MessageSquare />} title="Discussions" desc="Open forums for brainstorming and debate." />
              <FeatureCard icon={<Search />} title="Smart Search" desc="Find exactly what you need using advanced filters." />
              <FeatureCard icon={<Zap />} title="Trending Topics" desc="See what's popular across the organization." />
              <FeatureCard icon={<Users />} title="Community" desc="Connect with our experts across different teams." />
              <FeatureCard icon={<Shield />} title="Quality Content" desc="Verified solutions and curated resources." />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 container mx-auto px-4 relative">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Latest Insights</h2>
          
          <div className="grid grid-cols-2 gap-4 md:gap-6 opacity-30 blur-[2px] pointer-events-none select-none">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="border p-4 md:p-6 rounded-xl space-y-4">
                 <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                 <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                 <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
               </div>
             ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-4">
             <div className="bg-card/90 md:bg-card/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border shadow-2xl text-center max-w-md w-full">
               <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Join the Conversation</h3>
               <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-500">
                 Unlock access to hundreds of internal articles, discussions, and inquiries.
               </p>
               <Link 
                 href="/signup"
                 className="block w-full py-2.5 md:py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90"
               >
                 Sign Up to View
               </Link>
             </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-primary text-white text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Ready to contribute?</h2>
          <Link 
             href="/signup" 
             className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-primary px-6 py-3 md:px-8 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Create your account <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
          </Link>
        </section>
      </main>

      <footer className="py-6 md:py-8 border-t text-center text-xs md:text-sm text-gray-500">
        <p>&copy; 2026 ssi-info-hub. Internal use only.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-4 md:p-6 rounded-xl border bg-background hover:border-primary/50 hover:shadow-lg transition-all group flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="text-primary mb-3 md:mb-4 transition-transform">{icon}</div>
      <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">{title}</h3>
      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}
