import React, { useState } from 'react';
import { useLinks } from '../context/LinkContext';
import { formatDate } from '../utils/url';
import {
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  Clock,
  FolderTree
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { links, bioTrees } = useLinks();

  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');

  const selectedLink = links.find(l => l.id === selectedEntityId);
  const selectedBioTree = bioTrees.find(t => t.id === selectedEntityId);

  // Compute clicks log array
  let clicks = selectedEntityId === 'all'
    ? links.flatMap(l => l.clicksLog)
    : (selectedLink ? selectedLink.clicksLog : []);

  // Compute total engagement
  let totalEngagement = 0;
  if (selectedEntityId === 'all') {
    const shortLinkClicks = links.reduce((acc, l) => acc + l.clicksCount, 0);
    const bioTreeViews = bioTrees.reduce((acc, t) => acc + t.viewsCount, 0);
    const bioTreeClicks = bioTrees.reduce((acc, t) => acc + t.items.reduce((sum, item) => sum + (item.clicksCount || 0), 0), 0);
    totalEngagement = shortLinkClicks + bioTreeViews + bioTreeClicks;
  } else if (selectedLink) {
    totalEngagement = selectedLink.clicksCount;
  } else if (selectedBioTree) {
    const treeClicks = selectedBioTree.items.reduce((sum, item) => sum + (item.clicksCount || 0), 0);
    totalEngagement = selectedBioTree.viewsCount + treeClicks;
  }

  // Device breakdown
  const deviceCounts = clicks.reduce(
    (acc, c) => {
      acc[c.device] = (acc[c.device] || 0) + 1;
      return acc;
    },
    { Desktop: 0, Mobile: 0, Tablet: 0 } as Record<string, number>
  );

  // Referrer breakdown
  const referrerCounts = clicks.reduce((acc, c) => {
    acc[c.referrer] = (acc[c.referrer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]);

  // Compute dynamic top device stats
  const totalLogs = clicks.length;
  let topDeviceName = 'No Data Yet';
  let topDevicePercent = 0;
  let runnerUpDeviceText = 'Awaiting traffic';

  if (totalLogs > 0) {
    const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);
    if (sortedDevices[0] && sortedDevices[0][1] > 0) {
      topDeviceName = sortedDevices[0][0];
      topDevicePercent = Math.round((sortedDevices[0][1] / totalLogs) * 100);
    }
    if (sortedDevices[1] && sortedDevices[1][1] > 0) {
      const runnerUpPercent = Math.round((sortedDevices[1][1] / totalLogs) * 100);
      runnerUpDeviceText = `Followed by ${sortedDevices[1][0]} (${runnerUpPercent}%)`;
    } else {
      runnerUpDeviceText = 'Primary traffic channel';
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <BarChart3 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Traffic & Click Analytics Dashboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor real-time engagement, traffic origins, and device statistics across short links and Bio Trees
            </p>
          </div>
        </div>

        {/* Link / Bio Tree Selector */}
        <div className="w-full sm:w-72">
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="all">📊 All Links & Bio Trees Combined</option>

            {links.length > 0 && (
              <optgroup label="🔗 Short Links">
                {links.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title || l.shortCode} (/#/r/{l.shortCode})
                  </option>
                ))}
              </optgroup>
            )}

            {bioTrees.length > 0 && (
              <optgroup label="🌴 Bio Link Trees">
                {bioTrees.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} (/#/tree/{t.slug})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Primary Analytics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Engagement</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 flex items-center justify-between">
            <span>{totalEngagement.toLocaleString()}</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {selectedEntityId === 'all'
              ? 'Across all short links & Bio Trees'
              : selectedLink
              ? `For short link /#/r/${selectedLink.shortCode}`
              : `For Bio Tree /#/tree/${selectedBioTree?.slug}`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Traffic Source</span>
          <div className="text-lg font-extrabold text-brand-600 dark:text-brand-400 mt-2 truncate">
            {sortedReferrers[0]?.[0] || (totalEngagement > 0 ? 'Direct / Social' : 'No Data')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {sortedReferrers[0]?.[1] || totalEngagement} engagements recorded
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Device Type</span>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
            {topDeviceName} {totalLogs > 0 ? `(${topDevicePercent}%)` : ''}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {runnerUpDeviceText}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Channels</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {sortedReferrers.length || (totalEngagement > 0 ? 1 : 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Distinct traffic referrers
          </p>
        </div>

      </div>

      {/* Selected Bio Tree Stats Overview if Bio Tree is Selected */}
      {selectedBioTree && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <FolderTree className="w-4 h-4 text-indigo-500" />
            <span>Bio Tree Performance Breakdown (/#/tree/{selectedBioTree.slug})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Page Views</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {selectedBioTree.viewsCount.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Link Clicks</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {selectedBioTree.items.reduce((sum, item) => sum + (item.clicksCount || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Per-Link Click Counts</h4>
            <div className="space-y-2">
              {selectedBioTree.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                    <span className="text-slate-400 font-mono block truncate text-[11px]">{item.url}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-900 shrink-0">
                    {item.clicksCount || 0} clicks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Device Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Monitor className="w-4 h-4 text-brand-500" />
            <span>Devices Breakdown</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center"><Monitor className="w-4 h-4 mr-2 text-brand-500" /> Desktop</span>
                <span>{totalLogs > 0 ? Math.round(((deviceCounts.Desktop || 0) / totalLogs) * 100) : 0}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${totalLogs > 0 ? ((deviceCounts.Desktop || 0) / totalLogs) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center"><Smartphone className="w-4 h-4 mr-2 text-indigo-500" /> Mobile</span>
                <span>{totalLogs > 0 ? Math.round(((deviceCounts.Mobile || 0) / totalLogs) * 100) : 0}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${totalLogs > 0 ? ((deviceCounts.Mobile || 0) / totalLogs) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center"><Tablet className="w-4 h-4 mr-2 text-purple-500" /> Tablet</span>
                <span>{totalLogs > 0 ? Math.round(((deviceCounts.Tablet || 0) / totalLogs) * 100) : 0}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${totalLogs > 0 ? ((deviceCounts.Tablet || 0) / totalLogs) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>Top Traffic Sources</span>
          </h3>

          {sortedReferrers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">
              {totalEngagement > 0 ? 'Direct / Bio Link visits recorded.' : 'No traffic source data recorded yet.'}
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {sortedReferrers.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{source}</span>
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-xs font-extrabold text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-800 shadow-sm">
                    {count} clicks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Complete Click Event Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Full Redirect Log Activity History</span>
        </h3>

        {clicks.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No redirection logs recorded yet for selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Source Channel</th>
                  <th className="py-3 px-3">Device Type</th>
                  <th className="py-3 px-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {clicks.slice(0, 15).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{formatDate(c.timestamp)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{c.referrer}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{c.device}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{c.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

