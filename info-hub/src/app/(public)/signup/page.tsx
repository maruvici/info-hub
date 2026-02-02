"use client";

import { useActionState, useState } from "react"; 
import { signUpUser } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookOpen, Mail, Lock, User, Users, Camera, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(signUpUser, null);
  const [fileName, setFileName] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") || "";
  const prefilledName = searchParams.get("name") || "";

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
          
          <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Error Message */}
            {state?.error?.message && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold">
                {state.error.message}
              </div>
            )}

            {/* Full Name */}
            <div className="md:col-span-2">
              <CustomInput name="fullName" defaultValue={prefilledName} label="Full Name" placeholder="John Doe" icon={User} required />
              {state?.error?.fullName && <p className="text-red-500 text-xs mt-1">{state.error.fullName}</p>}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <CustomInput name="email" defaultValue={prefilledEmail} label="Email Address" placeholder="john@company.com" icon={Mail} type="email" required />
              {state?.error?.email && <p className="text-red-500 text-xs mt-1">{state.error.email}</p>}
            </div>

            {/* Team Selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Assigned Team</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select 
                  name="team"
                  className="w-full pl-12 pr-10 py-4 bg-background/50 rounded-2xl border-none outline-none appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  required
                >
                  <option value="" disabled selected>Select your team...</option>
                  <option value="Digital Transformation">Digital Transformation</option>
                  <option value="Service Delivery">Service Delivery</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <CustomInput name="password" label="Password" placeholder="••••••••" icon={Lock} type="password" required />

            {/* Confirm Password */}
            <CustomInput name="confirmPassword" label="Confirm Password" placeholder="••••••••" icon={Lock} type="password" required />
              {state?.error?.confirmPassword && <p className="text-red-500 text-xs mt-1">{state.error.confirmPassword}</p>}

            {/* Photo ID Upload (Optional) */}
            <div className="md:col-span-2 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Photo ID (Optional)</label>
              <div className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-background/50 hover:bg-primary/5 border-2 border-dashed border-primary/10 rounded-2xl cursor-pointer transition-all group">
                  <Camera className="text-primary group-hover:scale-110 transition-transform" size={20} />
                  <span className="text-sm font-bold text-muted-foreground">Upload ID</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    name="photoId" // This matches the formData.get("photoId") in the action
                    className="hidden" 
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} 
                  />
                  {state?.error?.photoId && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 italic">
                      {state.error.photoId[0]}
                    </p>
                  )}
                </label>
                {fileName && (
                  <div className="flex items-center gap-2 text-xs font-bold text-primary animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 size={16} />
                    <span className="truncate max-w-[150px]">{fileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 pt-6 flex flex-col gap-4">
              <button disabled={isPending} className="w-full py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl disabled:opacity-50">
                {isPending ? "Processing..." : "Create Account"}
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