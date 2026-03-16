import React from 'react';
import { LayoutDashboard, Upload, User, LogOut, HardDrive } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const { profile } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-2xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <HardDrive size={20} />
            </div>
            CloudVault
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                currentView === item.id 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=random`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.name}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <HardDrive size={24} />
            CloudVault
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('profile')}>
              <img 
                src={profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=random`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden bg-white border-t border-slate-200 p-2 flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-colors",
                currentView === item.id 
                  ? "text-indigo-600" 
                  : "text-slate-500"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => auth.signOut()}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-500"
          >
            <LogOut size={20} />
            Exit
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
