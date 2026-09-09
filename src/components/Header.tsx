import React from 'react';
import { useLinks } from '../context/LinkContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { activeTab, setActiveTab, theme, toggleTheme, searchQuery, setSearchQuery } = useLinks();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const titleMap = {
    home: 'Dashboard Overview',
    links: 'Short Links Workspace',
    bio: 'Bio Link Trees',
    qr: 'QR Code Customizer Studio',
    analytics: 'Analytics & Traffic Insights',
    settings: 'Account Settings & API Tokens'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left Section: Mobile Menu & Active Tab Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {titleMap[activeTab] || 'Dashboard'}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              URLSnip Modern Workspace Platform
            </p>
          </div>
        </div>

        {/* Right Controls: Global Search & Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Search */}
          <div className="relative hidden md:block w-52 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search links, code..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Create Short Link Quick Button */}
          <button
            onClick={() => setActiveTab('home')}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Link</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Auth Button or User Badge */}
          {isAuthenticated && user ? (
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Account Settings"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-brand-500"
              />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
