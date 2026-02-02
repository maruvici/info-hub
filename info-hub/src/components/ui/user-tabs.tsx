"use client";

import { User, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserTabs({ activeTab }: { activeTab: string }) {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    // Explicitly set the path to /user and add the query string
    router.push(`/user?tab=${tab}`);
  };

  return (
    <nav className="flex flex-col gap-2">
      <TabButton 
        active={activeTab === "Details"} 
        onClick={() => handleTabChange("Details")} 
        icon={<User size={18}/>} 
        label="User Details" 
      />
      <TabButton 
        active={activeTab === "Posts"} 
        onClick={() => handleTabChange("Posts")} 
        icon={<FileText size={18}/>} 
        label="My Posts" 
      />
      <TabButton 
        active={activeTab === "Settings"} 
        onClick={() => handleTabChange("Settings")} 
        icon={<Settings size={18}/>} 
        label="Settings" 
      />
    </nav>
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