"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookOpen, Mail, Lock, User, Users, Camera, CheckCircle2, ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const teams = [
    "Digital Transformation",
    "Infrastructure",
    "Product", 
    "Project Management", 
    "Security", 
    "Service Delivery", 
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 py-20">
      <div className="w-full max-w-2xl space-y-10">

        {/* Top Right Toggle */}
        <div className="absolute top-8 right-8">
            <ThemeToggle />
        </div>
        
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-4 font-bold text-5xl text-gradient">
            <BookOpen className="h-10 w-10 text-primary" />
            <span>info-hub</span>
          </Link>
          <p className="text-muted-foreground font-medium">Create your account to start sharing knowledge.</p>
        </div>

        {/* Form Container */}
        <div className="bg-card shadow-soft rounded-[40px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Full Name */}
            <div className="md:col-span-2">
              <CustomInput label="Full Name" placeholder="John Doe" icon={User} />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <CustomInput label="Email Address" placeholder="john@company.com" icon={Mail} type="email" />
            </div>

            {/* Team Selection (The "Non-Blocky" Select) */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Assigned Team</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select 
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-background/50 rounded-2xl border-none outline-none appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                >
                  <option value="" disabled>Select your team...</option>
                  {teams.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <CustomInput label="Password" placeholder="••••••••" icon={Lock} type="password" />

            {/* Confirm Password */}
            <CustomInput label="Confirm Password" placeholder="••••••••" icon={Lock} type="password" />

            {/* Photo ID Upload (Optional) */}
            <div className="md:col-span-2 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Photo ID (Optional)</label>
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-background hover:bg-primary/5 border-2 border-dashed border-primary/10 rounded-2xl cursor-pointer transition-all group">
                  <Camera className="text-primary group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-bold text-muted-foreground">Upload ID</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} 
                  />
                </label>
                {fileName && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 size={16} />
                    <span className="truncate max-w-37.5">{fileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 pt-6 flex flex-col gap-4">
              <button className="w-full py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                Create Account
                <ArrowRight size={20} />
              </button>
              
              <p className="text-center text-sm font-medium text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-black hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Internal helper for this page until we refactor
function CustomInput({ label, icon: Icon, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          {...props}
          className="w-full pl-12 pr-4 py-4 bg-background/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30 font-medium"
        />
      </div>
    </div>
  );
}