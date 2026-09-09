import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLinks } from '../context/LinkContext';
import {
  Settings,
  KeyRound,
  User as UserIcon,
  Download,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  LogOut
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, generateApiKey, logout, isAuthenticated, openAuthModal } = useAuth();
  const { exportData, clearAllLinks, addToast } = useLinks();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    updateProfile({ name: name.trim(), email: email.trim() });
    addToast('Profile updated successfully!', 'success');
  };

  const handleCopyKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopiedKey(true);
      addToast('API Key copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleGenerateKey = () => {
    generateApiKey();
    addToast('Generated new API Key!', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
          <Settings className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Account & Developer Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your account preferences, developer API tokens, and backup options
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
          <UserIcon className="w-4 h-4 text-brand-500" />
          <span>User Profile Information</span>
        </h3>

        {isAuthenticated && user ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl">
            <p className="text-xs text-slate-500 mb-3">You are currently using guest mode.</p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Sign In to Sync Account
            </button>
          </div>
        )}
      </div>

      {/* Developer API Key Generator Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
          <KeyRound className="w-4 h-4 text-indigo-500" />
          <span>Developer API Token</span>
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Use your API key to programmatically shorten links and query click analytics.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              value={user?.apiKey || 'urlsnip_live_key_9f83a2'}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200"
            />
            <button
              onClick={handleCopyKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
              title="Copy Key"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleGenerateKey}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* Backup & Data Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Download className="w-4 h-4 text-emerald-500" />
          <span>Data Backup & Export Management</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={exportData}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-colors"
          >
            <Download className="w-5 h-5 text-brand-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Export Links JSON</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Download offline backup file</p>
          </button>

          <button
            onClick={clearAllLinks}
            className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 border border-rose-200/60 dark:border-rose-900/40 text-left transition-colors"
          >
            <Trash2 className="w-5 h-5 text-rose-600 mb-2" />
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Clear All Links</h4>
            <p className="text-[11px] text-rose-500/80 mt-0.5">Reset stored short links</p>
          </button>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Local Storage Active</h4>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">100% Client-side safe</p>
          </div>
        </div>
      </div>

    </div>
  );
};
