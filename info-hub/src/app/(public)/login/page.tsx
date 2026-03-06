"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { loginUser, loginWithMicrosoft } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginUser, null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-background relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 blur-[120px] -z-10 rounded-full" />

      {/* Top Right Toggle - Adjusted for mobile safe areas */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 md:space-y-10 relative z-10">
        {/* Branding Section */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl md:text-4xl text-gradient group">
            <span 
              className="w-5 h-10 bg-primary-gradient transition-transform group-hover:scale-110" 
              style={{
                WebkitMaskImage: 'url(/ssi-logo.svg)',
                maskImage: 'url(/ssi-logo.svg)',
                maskRepeat: 'no-repeat',
                maskSize: 'contain'
              }}
            />
            <span className="text-gradient">SSI Info Hub</span>
          </Link>
          <p className="text-muted-foreground font-medium text-sm md:text-base">
            Welcome back! Login to access the knowledge base.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card shadow-soft rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />
          
          <div className="space-y-6">
            {/* Main Credentials Form */}
            <form action={action} className="space-y-5">
              {state?.error?.message && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-in fade-in zoom-in-95">
                  {state.error.message}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    name="email"
                    type="email" 
                    required
                    placeholder="name@ssiph.com"
                    className="w-full pl-12 pr-4 py-4 bg-background/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm placeholder:opacity-30" 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    name="password"
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-background/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm placeholder:opacity-30" 
                  />
                </div>
              </div>

              <button 
                disabled={isPending}
                type="submit"
                className="w-full py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2 group text-sm"
              >
                {isPending ? "Authenticating..." : "Sign In"}
                {!isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/5"></span>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-card px-3 text-muted-foreground/50">Or Login With</span>
              </div>
            </div>

            {/* Microsoft Login Form */}
            <form action={loginWithMicrosoft}>
              <button 
                type="submit" 
                className="w-full py-4 bg-background/50 border border-primary/5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-background transition-all active:scale-[0.98] shadow-sm text-sm"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Microsoft Account</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm font-medium text-muted-foreground">
          New to the hub?{" "}
          <Link href="/signup" className="text-primary font-black hover:underline underline-offset-4">
            Join Now
          </Link>
        </p>
      </div>
    </div>
  );
} 