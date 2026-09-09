import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLinks } from '../context/LinkContext';
import { BioTree, BioTreeItem, BioTreeTheme } from '../types';
import { getBioTreeThemeStyle } from '../components/BioTreeViewer';
import {
  FolderTree,
  Plus,
  Copy,
  Check,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Palette,
  X,
  Link as LinkIcon,
  Pipette
} from 'lucide-react';

interface ThemePreset {
  id: string;
  name: string;
  color: string;
  gradient: string;
}

const PRESET_THEMES: ThemePreset[] = [
  { id: 'indigo', name: 'Indigo', color: '#6366f1', gradient: 'bg-gradient-to-tr from-indigo-700 to-indigo-500' },
  { id: 'emerald', name: 'Emerald', color: '#10b981', gradient: 'bg-gradient-to-tr from-emerald-700 to-emerald-500' },
  { id: 'rose', name: 'Rose', color: '#f43f5e', gradient: 'bg-gradient-to-tr from-rose-700 to-rose-500' },
  { id: 'amber', name: 'Amber', color: '#f59e0b', gradient: 'bg-gradient-to-tr from-amber-700 to-amber-500' },
  { id: 'violet', name: 'Violet', color: '#8b5cf6', gradient: 'bg-gradient-to-tr from-violet-700 to-violet-500' },
  { id: 'ocean', name: 'Ocean', color: '#06b6d4', gradient: 'bg-gradient-to-tr from-cyan-700 to-cyan-500' },
  { id: 'sunset', name: 'Sunset', color: '#f97316', gradient: 'bg-gradient-to-tr from-orange-700 to-orange-500' },
  { id: 'slate', name: 'Slate', color: '#475569', gradient: 'bg-gradient-to-tr from-slate-700 to-slate-500' },
  { id: 'dark', name: 'Dark', color: '#0f172a', gradient: 'bg-gradient-to-tr from-slate-900 to-black' }
];

export const BioTreesView: React.FC = () => {
  const { bioTrees, createBioTree, updateBioTree, deleteBioTree, addToast } = useLinks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTree, setEditingTree] = useState<BioTree | null>(null);

  // Form State
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<BioTreeTheme>('indigo');
  const [customColor, setCustomColor] = useState('#ec4899');
  const [items, setItems] = useState<BioTreeItem[]>([]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenCreateModal = () => {
    setEditingTree(null);
    setSlug('');
    setTitle('');
    setBio('');
    setAvatarUrl('');
    setTheme('indigo');
    setCustomColor('#ec4899');
    setItems([
      { id: `bti-${Date.now()}-1`, title: 'My Portfolio Website', url: 'https://example.com', icon: 'globe', clicksCount: 0, isEnabled: true },
      { id: `bti-${Date.now()}-2`, title: 'Twitter / X Profile', url: 'https://twitter.com', icon: 'twitter', clicksCount: 0, isEnabled: true },
      { id: `bti-${Date.now()}-3`, title: 'GitHub Projects', url: 'https://github.com', icon: 'github', clicksCount: 0, isEnabled: true }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tree: BioTree) => {
    setEditingTree(tree);
    setSlug(tree.slug);
    setTitle(tree.title);
    setBio(tree.bio || '');
    setAvatarUrl(tree.avatarUrl || '');
    
    const treeTheme = tree.theme || 'indigo';
    setTheme(treeTheme);
    if (treeTheme.startsWith('#')) {
      setCustomColor(treeTheme);
    }
    setItems(tree.items || []);
    setIsModalOpen(true);
  };

  const handleSaveTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please enter a title for your Bio Tree', 'error');
      return;
    }

    const selectedThemeValue = theme === 'custom' ? customColor : theme;

    if (editingTree) {
      await updateBioTree(editingTree.id, {
        title: title.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        theme: selectedThemeValue,
        items
      });
      setIsModalOpen(false);
    } else {
      if (!slug.trim()) {
        addToast('Please enter a URL slug for your Bio Tree', 'error');
        return;
      }

      const created = await createBioTree({
        slug: slug.trim(),
        title: title.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        theme: selectedThemeValue,
        items
      });

      if (created) {
        setIsModalOpen(false);
      }
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `bti-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: 'New Link',
        url: 'https://example.com',
        icon: 'globe',
        clicksCount: 0,
        isEnabled: true
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof BioTreeItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleCopyBioUrl = (slugName: string, id: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}#/tree/${slugName}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    addToast('Bio Tree URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };



  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <FolderTree className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Bio Link Trees</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {bioTrees.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create single, easily shareable bio pages containing multiple links for your Instagram, Twitter/X, or TikTok bio
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Bio Tree</span>
        </button>
      </div>

      {/* Grid of Bio Trees */}
      {bioTrees.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Bio Link Trees Created Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Generate a personalized link tree page for your social media bio in seconds!
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all inline-flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Bio Tree</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bioTrees.map(tree => {
            const bioUrl = `/#/tree/${tree.slug}`;
            const totalClicks = tree.items.reduce((acc, i) => acc + (i.clicksCount || 0), 0);

            return (
              <div
                key={tree.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative space-y-4 flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Bar: Avatar & Slug */}
                  <div className="flex items-center space-x-3 mb-4">
                    {tree.avatarUrl ? (
                      <img
                        src={tree.avatarUrl}
                        alt={tree.title}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm uppercase shrink-0">
                        {tree.title.slice(0, 2)}
                      </div>
                    )}
                    <div className="truncate">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {tree.title}
                      </h3>
                      <div className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 truncate">
                        {bioUrl}
                      </div>
                    </div>
                  </div>

                  {tree.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {tree.bio}
                    </p>
                  )}

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Page Views</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{tree.viewsCount}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Link Clicks</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{totalClicks}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items Badge */}
                  <div className="mt-3 text-[11px] font-semibold text-slate-400">
                    Contains <span className="text-slate-700 dark:text-slate-300 font-bold">{tree.items.length}</span> links
                  </div>

                </div>

                {/* Actions Row */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyBioUrl(tree.slug, tree.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedId === tree.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <a
                      href={bioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                      title="Preview Bio Tree"
                    >
                      <Eye className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleOpenEditModal(tree)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-600 dark:text-brand-400 text-xs transition-colors cursor-pointer"
                      title="Edit Bio Tree"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteBioTree(tree.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 text-xs transition-colors cursor-pointer"
                    title="Delete Bio Tree"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Bio Tree Portal Modal - Single Unified Scrollbar */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header Bar */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FolderTree className="w-5 h-5 text-brand-500" />
                <span>{editingTree ? 'Edit Bio Link Tree' : 'Create New Bio Link Tree'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content - Single Natural Scroll Section */}
            <form id="bio-tree-form" onSubmit={handleSaveTree} className="p-6 space-y-6">
              
              {/* Slug (only if creating new) */}
              {!editingTree && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio Tree Custom URL Slug
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-mono">
                      /#/tree/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase())}
                      placeholder="my-custom-name"
                      className="w-full pl-20 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Title & Avatar Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name / Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Bio Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Tagline Description
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g., Designer & Developer 🚀 | Sharing links & projects"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={2}
                />
              </div>

              {/* Visual Color Swatch & Custom Color Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Palette className="w-4 h-4 text-indigo-500" />
                    <span>Color Palette & Background Theme</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {theme === 'custom' || theme.startsWith('#') ? customColor : theme.toUpperCase()}
                  </span>
                </div>

                {/* Swatches Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-3">
                  {PRESET_THEMES.map((preset) => {
                    const isSelected = theme === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setTheme(preset.id)}
                        className={`h-10 rounded-2xl ${preset.gradient} relative flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                          isSelected
                            ? 'ring-4 ring-brand-500/50 scale-105 shadow-md'
                            : 'hover:scale-95 opacity-85 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    );
                  })}

                  {/* Custom Color Wheel Picker Button */}
                  <div className="relative h-10 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setTheme(e.target.value);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Pick custom color from palette"
                    />
                    <div
                      className="w-full h-full flex items-center justify-center text-white"
                      style={{ backgroundColor: (theme === 'custom' || theme.startsWith('#')) ? customColor : undefined }}
                    >
                      <Pipette className={`w-4 h-4 ${theme.startsWith('#') ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Live Mini Preview Box */}
                {(() => {
                  const activeThemeKey = theme === 'custom' ? customColor : theme;
                  const previewStyle = getBioTreeThemeStyle(activeThemeKey);
                  return (
                    <div
                      className="p-5 rounded-2xl border transition-all duration-300 text-center space-y-3 relative overflow-hidden shadow-inner"
                      style={{
                        background: previewStyle.bgGradient,
                        borderColor: `${previewStyle.mainColor}66`
                      }}
                    >
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">
                        Live Theme Preview
                      </div>
                      <div
                        className="w-12 h-12 rounded-full border-2 mx-auto flex items-center justify-center font-black text-white text-xs shadow-md"
                        style={{
                          borderColor: previewStyle.avatarBorder,
                          backgroundColor: `${previewStyle.mainColor}44`
                        }}
                      >
                        {title ? title.slice(0, 2).toUpperCase() : 'AB'}
                      </div>
                      <div className="text-xs font-extrabold text-white truncate max-w-xs mx-auto">
                        {title || 'Display Name Preview'}
                      </div>
                      <div className={`py-2.5 px-4 rounded-xl border text-[11px] font-bold max-w-xs mx-auto shadow-sm ${previewStyle.cardClass}`}>
                        Sample Link Card Button
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Links List Management */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <LinkIcon className="w-4 h-4 text-brand-500" />
                    <span>Tree Links ({items.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-900/60">
                          Link #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Remove link"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Link Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                            placeholder="e.g. Portfolio Website"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Destination URL
                          </label>
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Icon Type
                          </label>
                          <select
                            value={item.icon || 'globe'}
                            onChange={(e) => handleItemChange(item.id, 'icon', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                          >
                            <option value="globe">Globe / Website</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="github">GitHub</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="mail">Email</option>
                            <option value="youtube">YouTube</option>
                            <option value="instagram">Instagram</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </form>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3 bg-slate-50 dark:bg-slate-950/80">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="bio-tree-form"
                className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
              >
                {editingTree ? 'Save Changes' : 'Create Bio Tree'}
              </button>
            </div>

          </div>

        </div>,
        document.body
      )}

    </div>
  );
};
