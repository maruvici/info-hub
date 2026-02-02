import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowRight, BookOpen, MessageSquare, Search, Shield, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-card backdrop-blur px-4">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gradient">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>info-hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="py-20 text-center space-y-6 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Your Team's Central <br />
            <span className="text-primary">Knowledge Engine</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-gray-500 dark:text-gray-400">
            Share wisdom, ask questions, and collaborate across departments. 
            The single source of truth for our organization.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* 3. Features Grid */}
        <section className="py-20 bg-[rgb(var(--card))]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why info-hub?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard icon={<BookOpen />} title="Knowledge Base" desc="Structured articles and guides for every team." />
              <FeatureCard icon={<MessageSquare />} title="Discussions" desc="Open forums for brainstorming and debate." />
              <FeatureCard icon={<Search />} title="Smart Search" desc="Find exactly what you need with tag filtering." />
              <FeatureCard icon={<Zap />} title="Trending Topics" desc="See what's popular across the organization." />
              <FeatureCard icon={<Users />} title="Community" desc="Connect with experts from other departments." />
              <FeatureCard icon={<Shield />} title="Quality Content" desc="Verified solutions and curated resources." />
            </div>
          </div>
        </section>

        {/* 4. Mock Locked Content */}
        <section className="py-20 container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Insights</h2>
          
          {/* Blurred Grid */}
          <div className="grid md:grid-cols-2 gap-6 opacity-30 blur-[2px] pointer-events-none select-none">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="border p-6 rounded-xl space-y-4">
                 <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                 <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                 <div className="h-20 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
               </div>
             ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-background/80 backdrop-blur-md p-8 rounded-2xl border shadow-2xl text-center max-w-md mx-4">
               <h3 className="text-2xl font-bold mb-4">Join the Conversation</h3>
               <p className="mb-6 text-gray-500">
                 Unlock access to thousands of internal articles, discussions, and inquiries.
               </p>
               <Link 
                 href="/signup"
                 className="block w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90"
               >
                 Sign Up to View
               </Link>
             </div>
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className="py-20 bg-primary text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to contribute?</h2>
          <Link 
             href="/signup" 
             className="inline-flex items-center bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100"
          >
            Create your account <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-sm text-gray-500">
        <p>&copy; 2026 info-hub. Internal use only.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl border bg-background hover:border-primary/50 hover:shadow-lg transition-all group">
      <div className="text-primary mb-4 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}