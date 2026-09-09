import React, { useEffect, useState, useRef } from 'react';
import { useLinks } from '../context/LinkContext';
import { evaluateStatus, getDomain, formatUrl } from '../utils/url';
import { supabase, isSupabaseConfigured, mapRowToLink } from '../lib/supabase';
import { ShortLink } from '../types';
import {
  ExternalLink,
  ShieldAlert,
  Lock,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const RedirectionHandler: React.FC = () => {
  const { links, recordClick } = useLinks();

  const [shortCode, setShortCode] = useState<string | null>(null);
  const [remoteLink, setRemoteLink] = useState<ShortLink | null>(null);
  const [isResolvingRemote, setIsResolvingRemote] = useState(false);
  const [resolveAttempted, setResolveAttempted] = useState(false);

  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [countdown, setCountdown] = useState(2);

  const redirectStartedRef = useRef(false);

  // Monitor location hash changes for /#/r/:code
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/#\/r\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const extracted = decodeURIComponent(match[1]);
        setShortCode(extracted);
        setRemoteLink(null);
        setResolveAttempted(false);
        setIsUnlocked(false);
        setCountdown(2);
        setPasscodeInput('');
        setPasscodeError('');
        redirectStartedRef.current = false;
      } else {
        setShortCode(null);
        setRemoteLink(null);
        redirectStartedRef.current = false;
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Async remote lookup from Supabase if not present in local state
  useEffect(() => {
    if (!shortCode) return;

    const localMatch = links.find(l => l.shortCode.toLowerCase() === shortCode.toLowerCase());
    if (localMatch) return; // found locally

    if (isSupabaseConfigured && supabase && !resolveAttempted && !isResolvingRemote) {
      setIsResolvingRemote(true);
      
      const fetchRemote = async () => {
        try {
          const { data, error } = await supabase!
            .from('links')
            .select('*')
            .ilike('short_code', shortCode)
            .maybeSingle();

          if (!error && data) {
            setRemoteLink(mapRowToLink(data));
          }
        } catch (err) {
          console.error('Remote lookup error:', err);
        } finally {
          setIsResolvingRemote(false);
          setResolveAttempted(true);
        }
      };

      fetchRemote();
    }
  }, [shortCode, links, resolveAttempted, isResolvingRemote]);

  const targetLink = shortCode
    ? links.find(l => l.shortCode.toLowerCase() === shortCode.toLowerCase()) || remoteLink
    : null;

  // Trigger automatic redirection once target link is active & unlocked
  useEffect(() => {
    if (!targetLink) return;
    const isLinkActive = evaluateStatus(targetLink) === 'active';
    const isLinkUnlocked = !targetLink.isProtected || !targetLink.passcode || isUnlocked;

    if (isLinkActive && isLinkUnlocked && !redirectStartedRef.current) {
      redirectStartedRef.current = true;

      // Record click count & click analytics log
      recordClick(targetLink.shortCode);

      const dest = formatUrl(targetLink.originalUrl);

      let remaining = 2;
      setCountdown(2);

      const intervalId = window.setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);

        if (remaining <= 0) {
          window.clearInterval(intervalId);
          window.location.replace(dest);
        }
      }, 700);
    }
  }, [targetLink, isUnlocked]);

  if (!shortCode) return null;

  // Resolving Spinner Screen
  if (!targetLink && isResolvingRemote) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Resolving Short Link...
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Looking up <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-500">/#/r/{shortCode}</code>
          </p>
        </div>
      </div>
    );
  }

  // Link Not Found Screen
  if (!targetLink) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Link Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The short code <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-rose-500">/#/r/{shortCode}</code> does not exist or was deleted.
          </p>

          <a
            href="#/"
            onClick={() => {
              window.location.hash = '';
              setShortCode(null);
            }}
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const currentStatus = evaluateStatus(targetLink);

  // Link Expired or Disabled Screen
  if (currentStatus !== 'active') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Link Unavailable ({currentStatus})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            This short link has {currentStatus === 'expired' ? 'expired based on its scheduled window.' : 'been temporarily disabled by its creator.'}
          </p>

          <a
            href="#/"
            onClick={() => {
              window.location.hash = '';
              setShortCode(null);
            }}
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <span>Return to Shortener</span>
          </a>
        </div>
      </div>
    );
  }

  // Password Verification Modal
  if (targetLink.isProtected && targetLink.passcode && !isUnlocked) {
    const handleVerifyPasscode = (e: React.FormEvent) => {
      e.preventDefault();
      if (passcodeInput.trim() === targetLink.passcode?.trim()) {
        setIsUnlocked(true);
      } else {
        setPasscodeError('Incorrect passcode. Please try again.');
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Password Protected Link
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Enter the required passcode to access destination link
          </p>

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                if (passcodeError) setPasscodeError('');
              }}
              placeholder="Enter passcode"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-center text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />

            {passcodeError && (
              <p className="text-xs font-medium text-rose-500">{passcodeError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
            >
              Unlock & Redirect
            </button>
          </form>
        </div>
      </div>
    );
  }

  const destinationDomain = getDomain(targetLink.originalUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in space-y-6">
        
        {/* Animated Redirect Icon */}
        <div className="relative w-16 h-16 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Dynamic Redirection
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Taking you to <span className="text-brand-600 dark:text-brand-400">{destinationDomain}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            {targetLink.originalUrl}
          </p>
        </div>

        {/* Progress Countdown Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 animate-pulse-subtle transition-all duration-500" style={{ width: `${((3 - countdown) / 3) * 100}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">
            Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        {/* Direct Button */}
        <a
          href={formatUrl(targetLink.originalUrl)}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all"
        >
          <span>Redirect Immediately</span>
          <ExternalLink className="w-4 h-4" />
        </a>

      </div>
    </div>
  );
};
