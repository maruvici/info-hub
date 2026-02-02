import { handleLogout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <button 
      onClick={() => handleLogout()}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Sign Out
    </button>
  );
}