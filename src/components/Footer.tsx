import React from 'react';
import { ShieldCheck, Zap, Lock, BarChart3 } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Value Props Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-200/60 dark:border-slate-800/60">
          
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Instant Redirection
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero-lag dynamic routing directly to destination target.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                100% Privacy Focused
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Local Storage persistence with optional passcode locks.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Real-time Analytics
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Detailed click counters, device breakdown & traffic logs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Expiration Control
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set custom expiration windows for time-sensitive links.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Footer Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-3">
            <Logo variant="compact" size="sm" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              © {new Date().getFullYear()} URLSnip — A Product by Vyne Technologies
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span>Shorten • Scan • Share</span>
            <span>•</span>
            <span>Built with React, TypeScript & Supabase</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
