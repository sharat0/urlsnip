import React, { useState } from 'react';
import { useLinks } from '../context/LinkContext';
import { isValidUrl, getShortUrl } from '../utils/url';
import {
  Link as LinkIcon,
  Sparkles,
  SlidersHorizontal,
  KeyRound,
  Clock,
  Tag,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const HeroShortener: React.FC = () => {
  const { createLink, addToast, openQrModal } = useLinks();

  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced options
  const [customCode, setCustomCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [expirationPreset, setExpirationPreset] = useState<'never' | '1h' | '24h' | '7d' | '30d' | 'custom'>('never');
  const [customExpiryDate, setCustomExpiryDate] = useState('');
  const [passcode, setPasscode] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Result state after shortening
  const [createdLinkResult, setCreatedLinkResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!url.trim()) {
      setErrorMsg('Please enter a destination URL');
      return;
    }

    if (!isValidUrl(url)) {
      setErrorMsg('Please enter a valid web URL (e.g., https://example.com)');
      return;
    }

    // Calculate expiration date ISO string
    let expiresAt: string | null = null;
    const now = Date.now();

    if (expirationPreset === '1h') {
      expiresAt = new Date(now + 1000 * 60 * 60).toISOString();
    } else if (expirationPreset === '24h') {
      expiresAt = new Date(now + 1000 * 60 * 60 * 24).toISOString();
    } else if (expirationPreset === '7d') {
      expiresAt = new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString();
    } else if (expirationPreset === '30d') {
      expiresAt = new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString();
    } else if (expirationPreset === 'custom' && customExpiryDate) {
      expiresAt = new Date(customExpiryDate).toISOString();
    }

    // Process tags array
    const tagsArr = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const result = await createLink({
      originalUrl: url,
      customCode: customCode || undefined,
      title: title || undefined,
      description: description || undefined,
      tags: tagsArr.length > 0 ? tagsArr : undefined,
      expiresAt,
      passcode: passcode || undefined,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined
    });

    if (result) {
      setCreatedLinkResult(result);
      // Reset main input form
      setUrl('');
      setCustomCode('');
      setTitle('');
      setDescription('');
      setTagsInput('');
      setPasscode('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setShowAdvanced(false);
    }
  };

  const handleCopyResult = () => {
    if (!createdLinkResult) return;
    const fullShortUrl = getShortUrl(createdLinkResult.shortCode);
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    addToast('Shortened link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-8 pb-12 overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 blur-3xl opacity-30 dark:opacity-20 pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-brand-500" />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-indigo-500" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Headline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200/80 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant & Dynamic URL Shortener</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Shorten Links with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300">Total Confidence</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create clean, customizable, trackable short URLs with password protection, expiration controls, and real-time click analytics.
          </p>
        </div>

        {/* Shortener Card Form */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl relative">
          <form onSubmit={handleShorten} className="space-y-4">
            
            {/* Primary Input Row */}
            <div className="relative flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Paste your long destination URL here (e.g. https://mybrand.com/launch)"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-950 border ${
                    errorMsg ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                  } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm sm:text-base transition-all shadow-inner`}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <span>Shorten URL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Error Feedback */}
            {errorMsg && (
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-medium pl-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Controls Bar: Advanced Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Options' : 'Advanced Options (Alias, Passcode, Expiry & UTM)'}</span>
              </button>

              <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>HTTPS Safe & Dynamic</span>
              </div>
            </div>

            {/* Collapsible Advanced Settings */}
            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4 animate-fade-in text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Custom Alias */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Custom Shortcode / Alias
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono">
                        /#/r/
                      </span>
                      <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                        placeholder="my-custom-code"
                        className="w-full pl-14 pr-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Title / Label */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Link Title / Label
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Campaign Landing Page"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* Expiration Settings */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Link Expiration</span>
                    </label>
                    <select
                      value={expirationPreset}
                      onChange={(e: any) => setExpirationPreset(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="never">Never Expire</option>
                      <option value="1h">1 Hour</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                      <option value="custom">Custom Date & Time</option>
                    </select>

                    {expirationPreset === 'custom' && (
                      <input
                        type="datetime-local"
                        value={customExpiryDate}
                        onChange={(e) => setCustomExpiryDate(e.target.value)}
                        className="w-full mt-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    )}
                  </div>

                  {/* Password Protection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Password Protect (Optional)</span>
                    </label>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Require passcode to access"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                </div>

                {/* Tags & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-brand-500" />
                      <span>Tags (Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="marketing, twitter, dev"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* UTM Source */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      UTM Source Tag
                    </label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      placeholder="e.g. newsletter, google, twitter"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Recently Created Link Banner Result */}
          {createdLinkResult && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 animate-slide-up">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Link Ready!
                    </span>
                    <div className="font-mono font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                      {getShortUrl(createdLinkResult.shortCode)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                  <button
                    onClick={handleCopyResult}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-600/20"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={() => openQrModal(createdLinkResult)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs transition-colors"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
