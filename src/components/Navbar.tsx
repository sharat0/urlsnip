import React, { useState, useRef } from 'react';
import { useLinks } from '../context/LinkContext';
import {
  Zap,
  Sun,
  Moon,
  Download,
  Upload,
  BarChart3,
  Globe,
  Settings,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { links, theme, toggleTheme, exportData, importData } = useLinks();
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalClicks = links.reduce((acc, l) => acc + l.clicksCount, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importData(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Zap className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-600 dark:from-white dark:via-brand-300 dark:to-indigo-400">
                SnipURL
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3 h-3 mr-0.5" />
                Trusted
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              Dynamic Shortcode & Analytics Platform
            </p>
          </div>
        </div>

        {/* Center Live Metrics Pill */}
        <div className="hidden md:flex items-center space-x-6 px-4 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-brand-500" />
            <span>Links: <strong className="text-slate-900 dark:text-white font-semibold">{links.length}</strong></span>
          </div>
          <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Total Clicks: <strong className="text-slate-900 dark:text-white font-semibold">{totalClicks.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Data Backup Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Data Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    exportData();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4 text-brand-500" />
                  <span>Export Links JSON</span>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Import Backup</span>
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center border border-slate-200/60 dark:border-slate-800"
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
