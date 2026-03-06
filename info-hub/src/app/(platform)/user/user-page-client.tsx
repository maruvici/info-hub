"use client";

import { useState, useTransition } from "react";
import { User, FileText, Settings, Mail, Shield, Users, Heart, Eye, Calendar, BookOpen, MessageSquare, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { LogoutButton } from "@/components/ui/logout-button";
import Link from "next/link";
import { changePassword, changeTeam, changeUserRole, toggleUserStatus } from "@/app/actions/users";

type Tab = "Details" | "Posts" | "Settings";
type ValidRole = "User" | "Admin";

const ROLES = ["User", "Admin"];

export default function UserPageClient({ user, posts, stats, allUsers, initialTab }: any) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-6xl mx-auto px-4 md:px-0 pb-10">
      {/* Sidebar Profile Card - Switched to horizontal scroll on mobile */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-card rounded-3xl p-6 md:p-8 text-center space-y-6 md:space-y-8 shadow-sm md:sticky md:top-24">
          <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary p-1">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               <User size={48} className="text-gray-400 md:hidden" />
               <User size={64} className="text-gray-400 hidden md:block" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl md:text-2xl font-black">{user.fullName}</h2>
            <p className="text-xs md:text-sm text-primary font-bold">{user.team || "General Team"}</p>
          </div>

          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
            <TabButton active={activeTab === "Details"} onClick={() => setActiveTab("Details")} icon={<User size={18}/>} label="Details" />
            <TabButton active={activeTab === "Posts"} onClick={() => setActiveTab("Posts")} icon={<FileText size={18}/>} label="Posts" />
            <TabButton active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} icon={<Settings size={18}/>} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 bg-card rounded-3xl p-5 md:p-8 shadow-sm">
        {activeTab === "Details" && <UserDetails user={user} stats={stats} />}
        {activeTab === "Posts" && <UserPosts posts={posts} />}
        {activeTab === "Settings" && <UserSettings user={user} allUsers={allUsers}/>}
      </main>
    </div>
  );
}

function UserDetails({ user, stats }: { user: any, stats: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-lg md:text-xl font-black border-b border-primary/5 pb-4 text-primary">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DetailItem icon={<Mail size={20}/>} label="Email" value={user.email} />
        <DetailItem icon={<Users size={20}/>} label="Team" value={user.team || "Not assigned"} />
        <DetailItem icon={<Shield size={20}/>} label="Role" value={user.role || "User"} />
        <DetailItem icon={<Calendar size={20}/>} label="Joined On" value={user.createdAt} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 md:pt-8">
        <div className="p-5 md:p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[10px] md:text-sm font-bold text-primary mb-1 uppercase tracking-tighter">Total Post Views</p>
          <div className="flex items-center gap-2 text-2xl md:text-3xl font-black">
            <Eye className="text-primary" size={24}/> {stats.totalViews.toLocaleString()}
          </div>
        </div>
        <div className="p-5 md:p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-[10px] md:text-sm font-bold text-red-500 mb-1 uppercase tracking-tighter">Total Likes Received</p>
          <div className="flex items-center gap-2 text-2xl md:text-3xl font-black">
            <Heart className="text-red-500" size={24}/> {stats.totalLikes}
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
      className={`flex items-center gap-1 md:gap-3 px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-xs md:text-base ${
        active 
          ? "bg-primary text-white md:shadow-lg shadow-primary/30 md:translate-x-2" 
          : "hover:bg-background text-muted-foreground"
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
            <div className="text-center py-16 md:py-20 bg-background/50 rounded-3xl border border-dashed border-primary/10">
                <p className="text-muted-foreground font-bold text-sm">You haven't posted anything yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg md:text-xl font-black border-b border-primary/5 pb-4">My Contributions</h3>
            <div className="grid gap-3 md:gap-4 max-h-[60vh] md:max-h-[1000px] overflow-y-auto pr-1">
                {posts.map((post) => {
                    const Icon = post.type === "Article" ? BookOpen : post.type === "Discussion" ? MessageSquare : HelpCircle;
                    return (
                        <div key={post.id} className="bg-background/50 p-4 md:p-5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all group">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="p-2.5 md:p-3 bg-card rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                    <Icon size={18} className="md:w-5 md:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <Link href={`/post/${post.id}`} className="font-black text-base md:text-lg hover:text-primary transition-colors line-clamp-1 block">
                                        {post.title}
                                    </Link>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] items-center font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                        <span>{post.createdAt}</span>
                                        <span className="flex items-center gap-1"><Heart size={10}/>{post.totalLikes || post.likes}</span>
                                        <span className="flex items-center gap-1"><Eye size={10}/> {post.views}</span>
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
      if (!result.success) alert("Error: Could not update user status.");
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
        setActiveForm(null);
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

  const eligibleUsers = allUsers.filter(u => u.id !== user.id && u.role !== "Admin");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-lg md:text-xl font-black border-b border-primary/5 pb-4 text-red-500">Account Settings</h3>
      
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-xs md:text-sm ${message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {message.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Accordions with improved tap targets */}
      <div className="space-y-3">
        <div className="border border-red-500/30 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setActiveForm(activeForm === "password" ? null : "password")}
            className="w-full p-4 md:p-5 font-bold hover:bg-primary/5 transition-colors flex justify-between items-center bg-card text-sm md:text-base"
          >
            Change Password <span className={`transition-transform ${activeForm === "password" ? "rotate-90" : ""}`}>→</span>
          </button>
          
          {activeForm === "password" && (
            <form onSubmit={handlePasswordSubmit} className="p-4 md:p-5 border-t border-primary/10 bg-secondary/10 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                <input name="currentPassword" type="password" required className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                  <input name="newPassword" type="password" required minLength={8} className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New</label>
                  <input name="confirmPassword" type="password" required minLength={8} className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none text-sm" placeholder="••••••••" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button disabled={isPending} type="submit" className="w-full md:w-auto px-6 py-3 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50 text-sm">
                  {isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="border border-red-500/30 rounded-2xl overflow-hidden">
          <button 
            onClick={() => setActiveForm(activeForm === "team" ? null : "team")}
            className="w-full p-4 md:p-5 font-bold hover:bg-primary/5 transition-colors flex justify-between items-center bg-card text-sm md:text-base"
          >
            Change Team <span className={`transition-transform ${activeForm === "team" ? "rotate-90" : ""}`}>→</span>
          </button>
          
          {activeForm === "team" && (
            <form onSubmit={handleTeamSubmit} className="p-4 md:p-5 border-t border-primary/10 bg-secondary/10 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select New Team</label>
                <select name="team" defaultValue={user.team} required className="w-full p-3 rounded-xl border-none bg-background focus:ring-2 focus:ring-primary outline-none appearance-none font-bold text-sm">
                  <option value="Digital Transformation">Digital Transformation</option>
                  <option value="Service Delivery">Service Delivery</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Security">Security</option>
                  <option value="Product">Product</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end">
                <button disabled={isPending} type="submit" className="w-full md:w-auto px-6 py-3 bg-primary text-white font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50 text-sm">
                  {isPending ? "Updating..." : "Update Team"}
                </button>
              </div>
            </form>
          )}
        </div>

        {user.role === "Admin" && (
          <button 
            onClick={() => setActiveForm("roles")}
            className="w-full p-4 md:p-5 font-bold border border-red-500 rounded-2xl bg-card text-red-500 hover:bg-primary/5 transition-all shadow-sm flex justify-between items-center text-sm md:text-base"
          >
            <div className="flex items-center gap-3"><Shield size={18} /> Manage User Access</div>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Modal - Improved for Mobile scrolling */}
      {activeForm === "roles" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveForm(null)} />
          <div className="relative w-full max-w-2xl bg-card border border-primary/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 md:p-6 border-b border-primary/10 flex justify-between items-center bg-secondary/10">
              <div className="flex flex-col">
                <h3 className="font-bold flex items-center gap-2 text-red-500 text-sm md:text-base">
                  <Shield size={18} /> User Access Management
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Modify or Deactivate accounts</p>
              </div>
              <button onClick={() => setActiveForm(null)} className="p-2 hover:bg-primary/10 rounded-full font-black text-sm">✕</button>
            </div>

            <div className="p-4 md:p-6 space-y-3 overflow-y-auto bg-secondary/5 flex-1">
              {eligibleUsers.length === 0 ? (
                <p className="text-center text-xs font-bold text-muted-foreground italic py-10">No users available to modify.</p>
              ) : (
                eligibleUsers.map((targetUser) => (
                  <div key={targetUser.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background rounded-xl border border-primary/5 gap-4">
                    <div className="flex flex-col">
                      <p className={`font-bold text-sm ${!targetUser.isActive ? 'text-muted-foreground line-through' : ''}`}>{targetUser.fullName}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                        {targetUser.team || "No Team"} <span className="mx-1">•</span> {targetUser.role || "User"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      <button
                        disabled={isPending}
                        onClick={() => {
                          const action = targetUser.isActive ? "deactivate" : "reactivate";
                          if (window.confirm(`Are you sure you want to ${action} ${targetUser.fullName}?`)) handleStatusToggle(targetUser.id, !targetUser.isActive);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex-1 sm:flex-none ${targetUser.isActive ? "bg-green-500/10 text-green-600" : "bg-red-500 text-white"}`}
                      >
                        {targetUser.isActive ? "Active" : "Inactive"}
                      </button>

                      <select
                        defaultValue={targetUser.role || "User"}
                        onChange={(e) => {
                          const newRole = e.target.value as ValidRole;
                          if (window.confirm(`Change ${targetUser.fullName} to ${newRole}?`)) handleRoleChange(targetUser.id, newRole);
                          else e.target.value = targetUser.role || "User";
                        }}
                        disabled={isPending || !targetUser.isActive}
                        className="p-1.5 text-[10px] font-bold rounded-lg border-none bg-primary/10 text-primary outline-none min-w-20"
                      >
                        {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-secondary/10 border-t border-primary/10">
              <button onClick={() => setActiveForm(null)} className="w-full py-3 text-xs font-bold bg-primary text-white rounded-xl">Close Editor</button>
            </div>
          </div>
        </div>
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
        <div className="p-2.5 md:p-3 bg-background border rounded-lg text-primary shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-[9px] md:text-[10px] uppercase font-black text-muted-foreground tracking-widest">{label}</p>
          <p className="font-bold text-sm md:text-base truncate">{value}</p>
        </div>
      </div>
    );
}