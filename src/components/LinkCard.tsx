import React, { useState } from 'react';
import { ShortLink } from '../types';
import { useLinks } from '../context/LinkContext';
import { evaluateStatus, getExpiryText, formatDate, getShortUrl } from '../utils/url';
import {
  Copy,
  Check,
  QrCode,
  BarChart2,
  Star,
  ExternalLink,
  Lock,
  Clock,
  MoreVertical,
  Trash2,
  Power,
  Edit2,
  Tag,
  Globe
} from 'lucide-react';

interface LinkCardProps {
  link: ShortLink;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const {
    deleteLink,
    toggleFavorite,
    toggleStatus,
    openQrModal,
    openAnalyticsModal,
    addToast,
    updateLink
  } = useLinks();

  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit mode fields
  const [editTitle, setEditTitle] = useState(link.title || '');
  const [editUrl, setEditUrl] = useState(link.originalUrl);

  const status = evaluateStatus(link);
  const fullShortUrl = getShortUrl(link.shortCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    updateLink(link.id, {
      title: editTitle.trim(),
      originalUrl: editUrl.trim()
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 relative transition-all duration-200 ${
        status === 'disabled'
          ? 'opacity-70 border-slate-300 dark:border-slate-800'
          : status === 'expired'
          ? 'border-amber-300/60 dark:border-amber-900/40 bg-amber-500/5'
          : 'hover:border-brand-500/50 dark:hover:border-brand-500/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        
        {/* Left Info Section */}
        <div className="space-y-2 flex-1 min-w-0 w-full">
          
          {/* Header Row: Title & Badges */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <button
              onClick={() => toggleFavorite(link.id)}
              className={`p-1 rounded-md transition-colors ${
                link.isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 dark:text-slate-700 hover:text-slate-400'
              }`}
              title={link.isFavorite ? 'Unstar Link' : 'Favorite Link'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="px-2 py-1 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none"
              />
            ) : (
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {link.title || link.shortCode}
              </h3>
            )}

            {/* Status Badge */}
            {status === 'active' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Active
              </span>
            )}
            {status === 'expired' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3 h-3 mr-1" />
                Expired
              </span>
            )}
            {status === 'disabled' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                <Power className="w-3 h-3 mr-1" />
                Disabled
              </span>
            )}

            {/* Lock Badge if Passcode Protected */}
            {link.isProtected && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Lock className="w-3 h-3 mr-1 text-indigo-500" />
                Protected
              </span>
            )}
          </div>

          {/* Short Link display with quick copy */}
          <div className="flex items-center space-x-2 font-mono font-semibold text-brand-600 dark:text-brand-400 text-sm sm:text-base">
            <a
              href={fullShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center space-x-1 truncate max-w-full"
            >
              <span>{fullShortUrl}</span>
            </a>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Copy Short Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Destination URL */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
            <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="shrink-0 font-medium">Dest:</span>
            {isEditing ? (
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              />
            ) : (
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-slate-700 dark:hover:text-slate-200 truncate flex items-center space-x-1"
              >
                <span className="truncate">{link.originalUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
              </a>
            )}
          </div>

          {/* Tags & Metadata Footer */}
          <div className="flex items-center space-x-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex-wrap gap-y-1">
            <span>Created {formatDate(link.createdAt)}</span>
            <span>•</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {getExpiryText(link.expiresAt)}
            </span>

            {/* Tags list */}
            {link.tags && link.tags.length > 0 && (
              <div className="flex items-center space-x-1 ml-auto">
                <Tag className="w-3 h-3 text-slate-400" />
                {link.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Controls & Clicks Counter */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/80 dark:border-slate-800/80 gap-2">
          
          {/* Clicks Metric Badge */}
          <button
            onClick={() => openAnalyticsModal(link)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/50 transition-colors"
            title="View Detailed Analytics"
          >
            <BarChart2 className="w-4 h-4 text-brand-500" />
            <span className="font-extrabold text-sm">{link.clicksCount}</span>
            <span className="text-xs font-medium opacity-80">clicks</span>
          </button>

          {/* Quick Action Icons */}
          <div className="flex items-center space-x-1 relative">
            
            {/* Edit / Save Button */}
            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => openQrModal(link)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Generate QR Code"
              >
                <QrCode className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Context Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 text-xs animate-fade-in"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-brand-500" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Link Details'}</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleStatus(link.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <Power className="w-3.5 h-3.5 text-amber-500" />
                    <span>{link.status === 'disabled' ? 'Enable Link' : 'Disable Link'}</span>
                  </button>

                  <button
                    onClick={() => {
                      deleteLink(link.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Link</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
