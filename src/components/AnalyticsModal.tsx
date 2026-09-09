import React from 'react';
import { useLinks } from '../context/LinkContext';
import { formatDate } from '../utils/url';
import {
  X,
  BarChart3,
  Globe2,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Clock
} from 'lucide-react';

export const AnalyticsModal: React.FC = () => {
  const { activeAnalyticsModalLink, closeAnalyticsModal } = useLinks();

  if (!activeAnalyticsModalLink) return null;

  const link = activeAnalyticsModalLink;
  const clicks = link.clicksLog || [];
  const total = link.clicksCount;

  // Compute Device breakdown
  const deviceCounts = clicks.reduce(
    (acc, c) => {
      acc[c.device] = (acc[c.device] || 0) + 1;
      return acc;
    },
    { Desktop: 0, Mobile: 0, Tablet: 0 } as Record<string, number>
  );

  // Compute Referrer breakdown
  const referrerCounts = clicks.reduce((acc, c) => {
    acc[c.referrer] = (acc[c.referrer] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeAnalyticsModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Real-time Analytics
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white truncate max-w-md">
              {link.title || link.shortCode}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              /#/r/{link.shortCode}
            </p>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Total Clicks
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center space-x-2">
              <span>{total.toLocaleString()}</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Unique Referrers
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {Object.keys(referrerCounts).length || 1}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Last Clicked
            </span>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
              {clicks.length > 0 ? formatDate(clicks[0].timestamp) : 'No clicks yet'}
            </div>
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          
          {/* Device Distribution */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-brand-500" />
              <span>Devices Breakdown</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center"><Monitor className="w-3.5 h-3.5 mr-1" /> Desktop</span>
                  <span>{clicks.length > 0 ? Math.round(((deviceCounts.Desktop || 0) / clicks.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${clicks.length > 0 ? ((deviceCounts.Desktop || 0) / clicks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center"><Smartphone className="w-3.5 h-3.5 mr-1" /> Mobile</span>
                  <span>{clicks.length > 0 ? Math.round(((deviceCounts.Mobile || 0) / clicks.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${clicks.length > 0 ? ((deviceCounts.Mobile || 0) / clicks.length) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span className="flex items-center"><Tablet className="w-3.5 h-3.5 mr-1" /> Tablet</span>
                  <span>{clicks.length > 0 ? Math.round(((deviceCounts.Tablet || 0) / clicks.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${clicks.length > 0 ? ((deviceCounts.Tablet || 0) / clicks.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Referrers */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Globe2 className="w-4 h-4 text-emerald-500" />
              <span>Top Traffic Sources</span>
            </h4>

            {sortedReferrers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No referrer data logged yet.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {sortedReferrers.slice(0, 4).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{source}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                      {count} clicks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Recent Click Logs Table */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Recent Activity Logs</span>
          </h4>

          {clicks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No click events recorded yet for this short code.</p>
          ) : (
            <div className="overflow-x-auto max-h-44">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="py-2">Time</th>
                    <th className="py-2">Source</th>
                    <th className="py-2">Device</th>
                    <th className="py-2">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {clicks.slice(0, 8).map(c => (
                    <tr key={c.id}>
                      <td className="py-2 text-slate-600 dark:text-slate-400 font-medium">{formatDate(c.timestamp)}</td>
                      <td className="py-2 text-slate-800 dark:text-slate-200 font-semibold">{c.referrer}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">{c.device}</td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">{c.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
