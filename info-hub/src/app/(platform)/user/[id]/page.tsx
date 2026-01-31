"use client";

import { useState } from "react";
import { User, FileText, Settings, Mail, Shield, Users, Heart, Eye } from "lucide-react";

type Tab = "Details" | "Posts" | "Settings";

export default function UserPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Details");

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
      {/* Sidebar Profile Card */}
      <aside className="w-full md:w-80 shrink-0">
        <div className="bg-card rounded-3xl p-8 text-center space-y-12 shadow-sm sticky top-24">
          <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-primary p-1">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
               <User size={64} className="text-gray-400" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black">Jane Doe</h2>
            <p className="text-sm text-primary font-bold">Product Team</p>
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
        {activeTab === "Details" && <UserDetails />}
        {activeTab === "Posts" && <p className="text-muted-foreground">Rendering PostCards here... (reuse PostCard component)</p>}
        {activeTab === "Settings" && <UserSettings />}
      </main>
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

function UserDetails() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <h3 className="text-xl font-black border-b pb-4">Personal Information</h3>
      <div className="grid sm:grid-cols-2 gap-6">
        <DetailItem icon={<Mail/>} label="Email" value="jane.doe@company.com" />
        <DetailItem icon={<Users/>} label="Team" value="Product Management" />
        <DetailItem icon={<Shield/>} label="Role" value="Administrator" />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 pt-8">
        <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-bold text-primary mb-1">Total Post Views</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Eye className="text-primary"/> 12,402
          </div>
        </div>
        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-sm font-bold text-red-500 mb-1">Total Likes Received</p>
          <div className="flex items-center gap-2 text-3xl font-black">
            <Heart className="text-red-500"/> 1,290
          </div>
        </div>
      </div>
    </div>
  );
}

function UserSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black border-b pb-4 text-red-500">Account Settings</h3>
      <button className="w-full p-4 border rounded-xl font-bold hover:bg-background transition-colors flex justify-between">
        Change Password <span>→</span>
      </button>
      <button className="w-full p-4 border rounded-xl font-bold hover:bg-background transition-colors flex justify-between">
        Change Team <span>→</span>
      </button>
      <button className="w-full p-4 border rounded-xl font-bold hover:bg-background transition-colors flex justify-between">
        Update Profile Picture <span>→</span>
      </button>
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