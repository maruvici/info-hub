"use client";

import { useActionState, useState, useEffect } from "react"; 
import { signUpUser } from "@/app/actions/auth";
import { Mail, Lock, User, Users, ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupFormContent() {
  const [state, action, isPending] = useActionState(signUpUser, null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [msData] = useState({
    email: searchParams.get("email") || "",
    name: searchParams.get("name") || "",
    microsoftId: searchParams.get("providerAccountId") || ""
  });

  useEffect(() => {
    if (searchParams.has("email")) {
      router.replace("/signup", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <div className="bg-card shadow-soft rounded-[32px] md:rounded-[40px] p-6 md:p-12 relative overflow-hidden border border-primary/5">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />
      
      <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {state?.error?.message && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs md:text-sm font-bold md:col-span-2 animate-in fade-in zoom-in-95">
            {state.error.message}
          </div>
        )}

        {state?.error?.confirmPassword && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs md:text-sm font-bold md:col-span-2 animate-in fade-in zoom-in-95">
            {state.error.confirmPassword}
          </div>
        )}


        <input type="hidden" name="microsoftId" value={msData.microsoftId} />

        <div className="md:col-span-2">
          <CustomInput name="fullName" defaultValue={msData.name} label="Full Name" placeholder="Juan Dela Cruz" icon={User} readOnly={!!msData.name} required />
          {state?.error?.fullName && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{state.error.fullName}</p>}
        </div>

        <div className="md:col-span-2">
          <CustomInput name="email" defaultValue={msData.email} label="Email Address" placeholder="juandelacruz@domain.com" icon={Mail} type="email" readOnly={!!msData.email} required />
          {state?.error?.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-2">{state.error.email}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Assigned Team</label>
          <div className="relative group">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <select 
              name="team"
              className="w-full pl-12 pr-10 py-4 bg-background/50 rounded-2xl border-none outline-none appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
              defaultValue=""
              required
            >
              <option value="" disabled>Select your team...</option>
              <option value="Digital Transformation">Digital Transformation</option>
              <option value="Service Delivery">Service Delivery</option>
              <option value="Project Management">Project Management</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Security">Security</option>
              <option value="Product">Product</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <CustomInput name="password" label="Password" placeholder="••••••••" icon={Lock} type="password" required />
        </div>
        
        <div className="space-y-1">
          <CustomInput name="confirmPassword" label="Confirm Password" placeholder="••••••••" icon={Lock} type="password" required />
        </div>
        
        <div className="md:col-span-2 pt-4 md:pt-6 flex flex-col gap-4">
          <button 
            disabled={isPending} 
            className="w-full py-4 bg-primary-gradient text-white rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50 text-sm md:text-base"
          >
            {isPending ? "Processing..." : "Create Account"}
          </button>
          
          <p className="text-center text-xs md:text-sm font-medium text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">
              Log In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

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
          className="w-full pl-12 pr-4 py-4 bg-background/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30 font-bold text-sm read-only:opacity-60"
        />
      </div>
    </div>
  );
}