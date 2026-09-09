import React, { useEffect, useState, useRef } from 'react';
import { useLinks } from '../context/LinkContext';
import { supabase, isSupabaseConfigured, mapRowToBioTree } from '../lib/supabase';
import { BioTree, BioTreeItem } from '../types';
import {
  Globe,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Youtube,
  Instagram,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export const getBioTreeThemeStyle = (themeName: string = 'indigo') => {
  const key = (themeName || 'indigo').toLowerCase();

  const presets: Record<string, { mainColor: string; bgGradient: string; cardClass: string; avatarBorder: string }> = {
    indigo: {
      mainColor: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
      cardClass: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/25 text-white',
      avatarBorder: '#818cf8'
    },
    emerald: {
      mainColor: '#10b981',
      bgGradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 60%, #020617 100%)',
      cardClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/25 text-white',
      avatarBorder: '#34d399'
    },
    rose: {
      mainColor: '#f43f5e',
      bgGradient: 'linear-gradient(135deg, #4c0519 0%, #1f040a 60%, #020617 100%)',
      cardClass: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25 text-white',
      avatarBorder: '#fb7185'
    },
    amber: {
      mainColor: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #451a03 0%, #1c0a00 60%, #020617 100%)',
      cardClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/25 text-white',
      avatarBorder: '#fbbf24'
    },
    violet: {
      mainColor: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #3b0764 0%, #1a032e 60%, #020617 100%)',
      cardClass: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/25 text-white',
      avatarBorder: '#a78bfa'
    },
    ocean: {
      mainColor: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #083344 0%, #031c26 60%, #020617 100%)',
      cardClass: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/25 text-white',
      avatarBorder: '#22d3ee'
    },
    sunset: {
      mainColor: '#f97316',
      bgGradient: 'linear-gradient(135deg, #431407 0%, #1f0802 60%, #020617 100%)',
      cardClass: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/25 text-white',
      avatarBorder: '#fb923c'
    },
    slate: {
      mainColor: '#64748b',
      bgGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%)',
      cardClass: 'bg-white/10 hover:bg-white/20 border-white/15 text-white',
      avatarBorder: '#94a3b8'
    },
    dark: {
      mainColor: '#0f172a',
      bgGradient: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
      cardClass: 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-white',
      avatarBorder: '#475569'
    }
  };

  if (presets[key]) {
    return presets[key];
  }

  // Handle Any Custom Color (e.g. '#ec4899')
  const hex = key.startsWith('#') ? key : '#6366f1';
  return {
    mainColor: hex,
    bgGradient: `linear-gradient(135deg, ${hex}bb 0%, #0f172a 70%, #020617 100%)`,
    cardClass: 'bg-white/10 hover:bg-white/20 border-white/20 text-white',
    avatarBorder: hex
  };
};

export const BioTreeViewer: React.FC = () => {
  const { bioTrees, recordBioTreePageVisit, recordBioTreeLinkClick } = useLinks();

  const [slug, setSlug] = useState<string | null>(null);
  const [remoteTree, setRemoteTree] = useState<BioTree | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveAttempted, setResolveAttempted] = useState(false);

  const visitedSlugRef = useRef<string | null>(null);

  // Extract /#/tree/:slug from hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/(?:tree|b)\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const extracted = decodeURIComponent(match[1]).toLowerCase();
        setSlug(extracted);
        setRemoteTree(null);
        setResolveAttempted(false);
      } else {
        setSlug(null);
        setRemoteTree(null);
        visitedSlugRef.current = null;
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Record page visit ONCE when slug is available
  useEffect(() => {
    if (!slug) return;
    if (visitedSlugRef.current !== slug) {
      visitedSlugRef.current = slug;
      recordBioTreePageVisit(slug);
    }
  }, [slug]);

  // Async remote lookup from Supabase if not present in local state
  useEffect(() => {
    if (!slug) return;

    const localMatch = bioTrees.find(t => t.slug.toLowerCase() === slug.toLowerCase());
    if (localMatch) return;

    if (isSupabaseConfigured && supabase && !resolveAttempted && !isResolving) {
      setIsResolving(true);
      
      const fetchRemote = async () => {
        try {
          const { data, error } = await supabase!
            .from('bio_trees')
            .select('*')
            .ilike('slug', slug)
            .maybeSingle();

          if (!error && data) {
            const parsed = mapRowToBioTree(data);
            setRemoteTree(parsed);
          }
        } catch (err) {
          console.error('Bio Tree remote lookup error:', err);
        } finally {
          setIsResolving(false);
          setResolveAttempted(true);
        }
      };

      fetchRemote();
    }
  }, [slug, bioTrees, resolveAttempted, isResolving]);

  if (!slug) return null;

  const targetTree = slug
    ? bioTrees.find(t => t.slug.toLowerCase() === slug.toLowerCase()) || remoteTree
    : null;

  if (!targetTree && isResolving) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Loading Bio Tree...
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Fetching <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-500">/#/tree/{slug}</code>
          </p>
        </div>
      </div>
    );
  }

  if (!targetTree) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Bio Tree Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The link tree <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500">/#/tree/{slug}</code> does not exist or was removed.
          </p>

          <a
            href="#/"
            onClick={() => {
              window.location.hash = '';
              setSlug(null);
            }}
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to URLSnip Homepage</span>
          </a>
        </div>
      </div>
    );
  }

  const themeStyle = getBioTreeThemeStyle(targetTree.theme);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'github': return <Github className="w-5 h-5 text-slate-200" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-400" />;
      case 'mail': return <Mail className="w-5 h-5 text-emerald-400" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-rose-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-400" />;
      default: return <Globe className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleLinkClick = (item: BioTreeItem) => {
    const targetItemId = item.id || item.url;
    recordBioTreeLinkClick(targetTree.slug, targetItemId);

    // If viewing a remotely resolved tree, update remoteTree state locally as well
    if (remoteTree && remoteTree.slug.toLowerCase() === targetTree.slug.toLowerCase()) {
      setRemoteTree(prev => {
        if (!prev) return null;
        const updatedItems = prev.items.map(i =>
          (i.id === targetItemId || i.url === targetItemId) ? { ...i, clicksCount: (i.clicksCount || 0) + 1 } : i
        );
        return { ...prev, items: updatedItems };
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto animate-fade-in py-12 px-4 transition-all duration-300 text-white"
      style={{ background: themeStyle.bgGradient }}
    >
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 blur-3xl opacity-25 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full" style={{ backgroundColor: themeStyle.mainColor }} />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-slate-800" />
      </div>

      <div className="max-w-md mx-auto relative z-10 text-center space-y-6">
        
        {/* User Profile Avatar */}
        <div className="relative inline-block">
          {targetTree.avatarUrl ? (
            <img
              src={targetTree.avatarUrl}
              alt={targetTree.title}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 shadow-2xl mx-auto"
              style={{ borderColor: themeStyle.avatarBorder }}
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-4 flex items-center justify-center text-3xl font-black shadow-2xl mx-auto uppercase text-white"
              style={{ borderColor: themeStyle.avatarBorder, backgroundColor: `${themeStyle.mainColor}44` }}
            >
              {targetTree.title.slice(0, 2)}
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Bio Tree" />
        </div>

        {/* Title & Bio */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {targetTree.title}
          </h1>
          {targetTree.bio && (
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
              {targetTree.bio}
            </p>
          )}
        </div>

        {/* Links List */}
        <div className="space-y-3 pt-2">
          {targetTree.items.filter(i => i.isEnabled).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleLinkClick(item)}
              className={`w-full py-4 px-5 rounded-2xl border backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-between group ${themeStyle.cardClass}`}
            >
              <div className="flex items-center space-x-3 truncate pr-2">
                <div className="p-2 rounded-xl bg-white/10 shrink-0">
                  {getIcon(item.icon)}
                </div>
                <span className="text-sm font-bold truncate">
                  {item.title}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ))}
        </div>

        {/* Footer Powered By URLSnip */}
        <div className="pt-8 border-t border-white/10">
          <a
            href="#/"
            onClick={() => {
              window.location.hash = '';
              setSlug(null);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-semibold transition-all border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Create your own Bio Tree on <strong className="text-white">URLSnip</strong></span>
          </a>
        </div>

      </div>
    </div>
  );
};
