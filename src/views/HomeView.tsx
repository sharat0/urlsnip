import React from 'react';
import { useLinks } from '../context/LinkContext';
import { HeroShortener } from '../components/HeroShortener';
import { LinkCard } from '../components/LinkCard';
import { formatDate, evaluateStatus } from '../utils/url';
import {
  Link2,
  BarChart3,
  TrendingUp,
  Globe,
  Clock,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { links, setActiveTab } = useLinks();

  const totalClicks = links.reduce((acc, l) => acc + l.clicksCount, 0);
  const activeLinks = links.filter(l => evaluateStatus(l) === 'active').length;
  const avgClicks = links.length > 0 ? (totalClicks / links.length).toFixed(1) : '0';

  // Find top performing link
  const topLink = [...links].sort((a, b) => b.clicksCount - a.clicksCount)[0];

  // Flatten recent activity logs
  const recentClicks = links
    .flatMap(l => l.clicksLog.map(c => ({ ...c, linkTitle: l.title || l.shortCode, shortCode: l.shortCode })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Links Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Short Links
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {links.length}
          </div>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Active & trackable</span>
          </p>
        </div>

        {/* Total Clicks Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Engagement Clicks
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {totalClicks.toLocaleString()}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            Real-time redirect logs
          </p>
        </div>

        {/* Active Status Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Status
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {activeLinks} <span className="text-xs font-normal text-slate-400">/ {links.length}</span>
          </div>
          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            {(links.length > 0 ? (activeLinks / links.length) * 100 : 100).toFixed(0)}% uptime status
          </p>
        </div>

        {/* Avg Clicks/Link */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg. Clicks / Link
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            {avgClicks}
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            Across all created codes
          </p>
        </div>

      </div>

      {/* Primary Shortener Box */}
      <HeroShortener />

      {/* Secondary Dashboard Row: Top Performing Link & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Performing Link Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Top Performing Link</span>
            </h3>
            <button
              onClick={() => setActiveTab('links')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {topLink ? (
            <LinkCard link={topLink} />
          ) : (
            <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">No links created yet.</p>
            </div>
          )}
        </div>

        {/* Live Activity Stream Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>Recent Redirect Activity</span>
            </h3>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {recentClicks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent click activity recorded. Shorten a link and visit it to generate click logs!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Link Code</th>
                      <th className="py-3 px-4">Traffic Source</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recentClicks.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                          {formatDate(c.timestamp)}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                          /#/r/{c.shortCode}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {c.referrer}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                          {c.device}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                          {c.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
