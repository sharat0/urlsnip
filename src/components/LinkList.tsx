import React, { useState } from 'react';
import { useLinks } from '../context/LinkContext';
import { LinkCard } from './LinkCard';
import { evaluateStatus } from '../utils/url';
import { FilterStatus } from '../types';
import {
  Search,
  Trash2,
  Tag,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  QrCode,
  BarChart2
} from 'lucide-react';

export const LinkList: React.FC = () => {
  const {
    links,
    filteredLinks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    setSortField,
    setSortOrder,
    selectedTag,
    setSelectedTag,
    clearAllLinks,
    openAnalyticsModal,
    openQrModal
  } = useLinks();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Collect all unique tags across links
  const allTags = Array.from(
    new Set(links.flatMap(l => l.tags || []))
  );

  // Compute status counts
  const counts = {
    all: links.length,
    active: links.filter(l => evaluateStatus(l) === 'active').length,
    expired: links.filter(l => evaluateStatus(l) === 'expired').length,
    disabled: links.filter(l => evaluateStatus(l) === 'disabled').length,
    favorites: links.filter(l => l.isFavorite).length
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'newest') {
      setSortField('createdAt');
      setSortOrder('desc');
    } else if (val === 'oldest') {
      setSortField('createdAt');
      setSortOrder('asc');
    } else if (val === 'clicks-high') {
      setSortField('clicksCount');
      setSortOrder('desc');
    } else if (val === 'title-asc') {
      setSortField('title');
      setSortOrder('asc');
    }
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header & Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Your Shortened Links</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {filteredLinks.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, track, and monitor all active & dynamic short codes
          </p>
        </div>

        {/* Right Action Tools: Search, Sort & View Mode */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, URL, tag..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              onChange={handleSortChange}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="clicks-high">Sort: Most Clicks</option>
              <option value="title-asc">Sort: Title (A-Z)</option>
            </select>
          </div>

          {/* Grid vs Table View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Filter Status Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          
          {(['all', 'active', 'expired', 'disabled', 'favorites'] as FilterStatus[]).map(status => {
            const isActive = statusFilter === status;
            const count = counts[status];

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

        </div>

        {links.length > 0 && (
          <button
            onClick={clearAllLinks}
            className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors flex items-center space-x-1 shrink-0 ml-4"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Tags Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1" />
            Filter by tag:
          </span>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-medium"
            >
              Clear tag filter ✕
            </button>
          )}
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Main Links Container */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No shortened links found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery || statusFilter !== 'all' || selectedTag
              ? 'Try adjusting your search filters or status selection.'
              : 'Paste a URL above to generate your first trackable short link!'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLinks.map(link => (
            <LinkCard key={link.id} link={link} />
          ))}
        </div>
      ) : (
        /* Table View Option */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title / Short Code</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {filteredLinks.map(link => (
                  <tr key={link.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{link.title || link.shortCode}</div>
                      <div className="font-mono text-brand-600 dark:text-brand-400 font-semibold">{link.shortCode}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      <a href={link.originalUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center space-x-1">
                        <span className="truncate">{link.originalUrl}</span>
                        <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evaluateStatus(link) === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {evaluateStatus(link)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {link.clicksCount}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => openAnalyticsModal(link)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" title="Analytics">
                        <BarChart2 className="w-4 h-4 text-brand-500" />
                      </button>
                      <button onClick={() => openQrModal(link)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" title="QR Code">
                        <QrCode className="w-4 h-4 text-slate-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
};
