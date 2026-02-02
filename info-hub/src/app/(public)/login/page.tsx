"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookOpen, Mail, Lock } from "lucide-react";
import { useActionState } from "react";
import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  // Hook to handle server action state (errors, loading)
  const [state, action, isPending] = useActionState(loginUser, null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-[rgb(var(--background))]">
      {/* Top Right Toggle */}
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-3xl text-gradient mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span>info-hub</span>
          </Link>
          <p className="text-gray-500">Welcome back! Please enter your details.</p>
        </div>

        {/* Login Box */}
        <div className="bg-background border rounded-2xl shadow-xl p-8 space-y-6">
          
          {/* Main Credentials Form */}
          <form action={action} className="space-y-4">
            
            {/* Error Message Display */}
            {state?.error?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium text-center">
                {state.error.message}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-transparent" 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  name="password"
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-transparent" 
                />
              </div>
            </div>

            <button 
              disabled={isPending}
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Microsoft Login Form */}
          <button type="submit" className="w-full py-3 border rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
              <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Login with Microsoft Account
          </button>

        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Sign Up Now
          </Link>
        </p>
      </div>
      
      <footer className="mt-12 text-xs text-gray-400 flex gap-4">
        <Link href="#">Privacy Policy</Link>
        <Link href="#">Terms of Service</Link>
        <Link href="#">Contact Support</Link>
      </footer>
    </div>
  );
}