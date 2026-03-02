"use client";

import { useState, useTransition } from "react";
import { User, FileText, Settings, Mail, Shield, Users, Heart, Eye, Calendar, BookOpen, MessageSquare, HelpCircle, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import Link from "next/link";
import { changePassword, changeTeam, changeUserRole, toggleUserStatus } from "@/app/actions/users";

type Tab = "Details" | "Posts" | "Settings";
type ValidRole = "User" | "Admin"

interface UserPageClientProps {
  user: any; 
  initialTab: Tab;
  posts: any[];
  stats: any;
  allUsers: any[];
}

const ROLES = ["User", "Admin"];

export default function UserPageClient({ user, posts, stats, allUsers, initialTab }: any) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Sidebar Profile Card */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-card rounded-3xl p-8 text-center space-y-8 shadow-sm sticky top-24">
          <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-primary p-1">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               <User size={64} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black">{user.fullName}</h2>
            <p className="text-sm text-primary font-bold">{user.team || "General Team"}</p>
          </div>

          <nav className="flex flex-col gap-2">
            <TabButton active={activeTab === "Details"} onClick={() => setActiveTab("Details")} icon={<User size={18}/>} label="User Details" />
            <TabButton active={activeTab === "Posts"} onClick={() => setActiveTab("Posts")} icon={<FileText size={18}/>} label="My Posts" />
            <TabButton active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} icon={<Settings size={18}/>} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 bg-card rounded-3xl p-8 shadow-sm">
        {activeTab === "Details" && <UserDetails user={user} stats={stats} />}
        {activeTab === "Posts" && <UserPosts posts={posts} />}
        {activeTab === "Settings" && <UserSettings user={user} allUsers={allUsers}/>}
      </main>
    </div>
  );
}

// Logic components remain identical but accept 'user' props
function UserDetails({ user, stats }: { user: any, stats: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-xl font-black border-b border-primary/5 pb-4">Personal Information</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <DetailItem icon={<Mail/>} label="Email" value={user.email} />
        <DetailItem icon={<Users/>} label="Team" value={user.team || "Not assigned"} />
        <DetailItem icon={<Shield/>} label="Role" value={user.role || "User"} />
        <DetailItem icon={<Calendar/>} label="Joined On" value={user.createdAt} />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 pt-8">
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-bold text-primary mb-1 uppercase tracking-tighter">Total Post Views</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Eye className="text-primary"/> {stats.totalViews.toLocaleString()}
          </div>
        </div>
        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-sm font-bold text-red-500 mb-1 uppercase tracking-tighter">Total Likes Received</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Heart className="text-red-500"/> {stats.totalLikes}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        active ? "bg-primary text-white shadow-lg shadow-primary/30 translate-x-2" : "hover:bg-background text-muted-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function UserPosts({ posts }: { posts: any[] }) {
    if (posts.length === 0) {
        return (
            <div className="text-center py-20 bg-background/50 rounded-3xl border border-dashed border-primary/10">
                <p className="text-muted-foreground font-bold">You haven't posted anything yet.</p>
            </div>
        );
    }

    return (
        <div className="pr-2 max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <h3 className="text-xl font-black border-b border-primary/5 pb-4">My Contributions</h3>
            <div className="grid gap-4">
                {posts.map((post) => {
                    const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
                    return (
                        <div key={post.id} className="bg-background/50 p-5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-card rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <Link href={`/post/${post.id}`} className="font-black text-lg hover:text-primary transition-colors line-clamp-1">
                                            {post.title}
                                        </Link>
                                        <div className="flex gap-3 text-xs items-center font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                            <span>{post.createdAt}</span>
                                            <span className="flex items-center gap-1"><Heart size={10}/>{post.likes}</span>
                                            <span className="flex items-center gap-1"><Eye size={10}/> {post.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function UserSettings({ user, allUsers = [] }: { user: any, allUsers?: any[] }) {
  const [activeForm, setActiveForm] = useState<"password" | "team" | "roles" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleStatusToggle = (userId: string, newStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleUserStatus(userId, newStatus);
      
      if (!result.success) {
        alert("Error: Could not update user status.");
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await changePassword(formData);
        setMessage({ type: "success", text: "Password updated successfully!" });
        setActiveForm(null); // Close form on success
      } catch (error: any) {
        setMessage({ type: "error", text: error.message });
      }
    });
  };

  const handleTeamSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await changeTeam(formData);
        setMessage({ type: "success", text: "Team updated successfully!" });
        setActiveForm(null);
      } catch (error: any) {
        setMessage({ type: "error", text: error.message });
      }
    });
  };

  const handleRoleChange = (targetUserId: string, newRole: ValidRole) => {
    setMessage(null);
    startTransition(async () => {
      try {
        await changeUserRole(targetUserId, newRole);
        setMessage({ type: "success", text: "User role updated successfully!" });
      } catch (error: any) {
        setMessage({ type: "error", text: error.message });
      }
    });
  };

  // Filter out the current user and any other Admins
  const eligibleUsers = allUsers.filter(u => u.id !== user.id && u.role !== "Admin");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-xl font-black border-b border-primary/5 pb-4 text-red-500">Account Settings</h3>
      
      {/* Feedback Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {message.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* CHANGE PASSWORD ACCORDION */}
      <div className="border border-red-500 rounded-2xl overflow-hidden transition-all">
        <button 
          onClick={() => setActiveForm(activeForm === "password" ? null : "password")}
          className="w-full p-5 font-bold hover:bg-primary/5 transition-colors flex justify-between items-center bg-card"
        >
          Change Password <span className={`transition-transform ${activeForm === "password" ? "rotate-90" : ""}`}>→</span>
        </button>
        
        {activeForm === "password" && (
          <form onSubmit={handlePasswordSubmit} className="p-5 border-t border-primary/10 bg-secondary/20 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
              <input name="currentPassword" type="password" required className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="••••••••" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                <input name="newPassword" type="password" required minLength={8} className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
                <input name="confirmPassword" type="password" required minLength={8} className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="••••••••" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button disabled={isPending} type="submit" className="px-6 py-3 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50">
                {isPending ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CHANGE TEAM ACCORDION */}
      <div className="border border-red-500 rounded-2xl overflow-hidden transition-all">
        <button 
          onClick={() => setActiveForm(activeForm === "team" ? null : "team")}
          className="w-full p-5 font-bold hover:bg-primary/5 transition-colors flex justify-between items-center bg-card"
        >
          Change Team <span className={`transition-transform ${activeForm === "team" ? "rotate-90" : ""}`}>→</span>
        </button>
        
        {activeForm === "team" && (
          <form onSubmit={handleTeamSubmit} className="p-5 border-t border-primary/10 bg-secondary/20 space-y-4">
            <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Select New Team
            </label>
            <select 
              name="team" 
              defaultValue={user.team} 
              required 
              className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none appearance-none font-bold"
            >
              <option value="Digital Transformation">Digital Transformation</option>
              <option value="Service Delivery">Service Delivery</option>
              <option value="Project Management">Project Management</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Security">Security</option>
              <option value="Product">Product</option>
            </select>
          </div>
            <div className="pt-2 flex justify-end">
              <button disabled={isPending} type="submit" className="px-6 py-3 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50">
                {isPending ? "Updating..." : "Update Team"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* MANAGE USER ROLES & STATUS (ADMIN ONLY) */}
      {user.role === "Admin" && (
        <>
          {/* The Trigger Button */}
          <button 
            onClick={() => setActiveForm("roles")}
            className="w-full p-5 font-bold border border-red-500 rounded-2xl bg-card text-red-500 hover:bg-primary/5 transition-all shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} /> Manage User Access
            </div>
            <span>→</span>
          </button>
          
          {/* The Popup Window (Modal) */}
          {activeForm === "roles" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
                onClick={() => setActiveForm(null)}
              />
              
              {/* Modal Content */}
              <div className="relative w-full max-w-2xl bg-card border border-primary/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-secondary/10">
                  <div className="flex flex-col">
                    <h3 className="font-bold flex items-center gap-2 text-red-500">
                      <Shield size={20} /> User Access Management
                    </h3>
                    <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-tighter">Toggle roles or deactivate offboarded employees</p>
                  </div>
                  <button 
                    onClick={() => setActiveForm(null)}
                    className="p-2 hover:bg-primary/10 rounded-full transition-colors font-black"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-3 overflow-y-auto bg-secondary/5">
                  {eligibleUsers.length === 0 ? (
                    <p className="text-center text-sm font-bold text-muted-foreground italic py-8">
                      No eligible users available to modify.
                    </p>
                  ) : (
                    eligibleUsers.map((targetUser) => (
                      <div key={targetUser.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-primary/5 shadow-sm">
                        <div className="flex flex-col">
                          <p className={`font-bold text-sm ${!targetUser.isActive ? 'text-muted-foreground line-through' : ''}`}>
                            {targetUser.fullName}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                            {targetUser.team || "No Team"} <span className="mx-1">•</span> {targetUser.role || "User"}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Status Toggle Button */}
                          <button
                            disabled={isPending}
                            onClick={() => {
                              const action = targetUser.isActive ? "deactivate" : "reactivate";
                              if (window.confirm(`Are you sure you want to ${action} ${targetUser.fullName}'s account?`)) {
                                handleStatusToggle(targetUser.id, !targetUser.isActive);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              targetUser.isActive 
                                ? "bg-green-500/10 text-green-600 hover:bg-red-500/10 hover:text-red-600" 
                                : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            }`}
                          >
                            {targetUser.isActive ? "Active" : "Inactive"}
                          </button>

                          {/* Role Select */}
                          <select
                            defaultValue={targetUser.role || "User"}
                            onChange={(e) => {
                              const newRole = e.target.value as ValidRole;
                              const oldRole = targetUser.role || "User";
                              
                              if (window.confirm(`Change ${targetUser.fullName}'s role from ${oldRole} to ${newRole}?`)) {
                                handleRoleChange(targetUser.id, newRole);
                              } else {
                                e.target.value = oldRole;
                              }
                            }}
                            disabled={isPending || !targetUser.isActive}
                            className="p-2 text-xs font-bold rounded-lg border-none bg-primary/10 text-primary outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-30 appearance-none text-center min-w-24"
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-secondary/10 border-t border-primary/10 text-center">
                  <button 
                    onClick={() => setActiveForm(null)}
                    className="px-6 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-md hover:opacity-90 transition-opacity"
                  >
                    Close Editor
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="pt-6">
        <LogoutButton />
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
      <div className="flex items-center gap-4">
        <div className="p-3 bg-background border rounded-lg text-primary">{icon}</div>
        <div>
          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{label}</p>
          <p className="font-bold">{value}</p>
        </div>
      </div>
    );
}