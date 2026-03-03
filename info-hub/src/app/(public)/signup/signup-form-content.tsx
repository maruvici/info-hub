"use client";

import { useActionState, useState, useEffect } from "react"; 
import { signUpUser } from "@/app/actions/auth";
import { Mail, Lock, User, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupFormContent() {
  const [state, action, isPending] = useActionState(signUpUser, null);
  const searchParams = useSearchParams();

  const [msData, setMsData] = useState({
    email: "",
    name: "",
    microsoftId: ""
  });

  useEffect(() => {
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const providerAccountId = searchParams.get("providerAccountId");

    if (email) {
      setMsData({
        email: email || "",
        name: name || "",
        microsoftId: providerAccountId || ""
      });

      window.history.replaceState({}, "", "/signup");
    }
  }, [searchParams]);

  return (
    <div className="bg-card shadow-soft rounded-[40px] p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary-gradient opacity-80" />
      
      <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state?.error?.message && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold md:col-span-2">
            {state.error.message}
          </div>
        )}

        <input type="hidden" name="microsoftId" value={msData.microsoftId} />

        <div className="md:col-span-2">
          <CustomInput name="fullName" defaultValue={msData.name} label="Full Name" placeholder="Juan Dela Cruz" icon={User} readOnly={!!msData.name} required />
          {state?.error?.fullName && <p className="text-red-500 text-xs mt-1">{state.error.fullName}</p>}
        </div>

        <div className="md:col-span-2">
          <CustomInput name="email" defaultValue={msData.email} label="Email Address" placeholder="juandelacruz@ssiph.com" icon={Mail} type="email" readOnly={!!msData.email} required />
          {state?.error?.email && <p className="text-red-500 text-xs mt-1">{state.error.email}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Assigned Team</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <select 
              name="team"
              className="w-full pl-12 pr-10 py-4 bg-background/50 rounded-2xl border-none outline-none appearance-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
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
          </div>
        </div>

        <CustomInput name="password" label="Password" placeholder="••••••••" icon={Lock} type="password" required />
        <CustomInput name="confirmPassword" label="Confirm Password" placeholder="••••••••" icon={Lock} type="password" required />
          {state?.error?.confirmPassword && <p className="text-red-500 text-xs mt-1">{state.error.confirmPassword}</p>}
        
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
          className="w-full pl-12 pr-4 py-4 bg-background/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30 font-medium"
        />
      </div>
    </div>
  );
}