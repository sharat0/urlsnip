import React from 'react';
import { useLinks } from '../context/LinkContext';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../types';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Link2,
  FolderTree,
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  LogIn,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab } = useLinks();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const navItems: { id: NavTab; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'links', label: 'My Short Links', icon: Link2 },
    { id: 'bio', label: 'Bio Link Trees', icon: FolderTree },
    { id: 'qr', label: 'QR Code Studio', icon: QrCode },
    { id: 'analytics', label: 'Click Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & API', icon: Settings },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <Logo variant="compact" size="md" />

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Group */}
          <div className="p-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Account / Auth Section Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          {isAuthenticated && user ? (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center space-x-3 mb-2.5">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium border border-slate-200 dark:border-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/50 text-center">
              <ShieldCheck className="w-6 h-6 text-brand-600 mx-auto mb-1" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Member Access
              </h4>
              <p className="text-[11px] text-slate-500 mb-2">
                Sign in to save and sync custom links
              </p>
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
