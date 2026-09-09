import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ShortLink,
  BioTree,
  BioTreeItem,
  BioTreeTheme,
  Toast,
  ToastType,
  FilterStatus,
  SortField,
  SortOrder,
  NavTab
} from '../types';
import {
  getStoredLinks,
  saveStoredLinks,
  getStoredBioTrees,
  saveStoredBioTrees,
  getStoredTheme,
  saveStoredTheme
} from '../utils/storage';
import {
  generateShortCode,
  formatUrl,
  evaluateStatus,
  createClickLog
} from '../utils/url';
import {
  supabase,
  isSupabaseConfigured,
  mapRowToLink,
  mapLinkToRow,
  mapRowToBioTree,
  mapBioTreeToRow
} from '../lib/supabase';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface CreateLinkPayload {
  originalUrl: string;
  customCode?: string;
  title?: string;
  description?: string;
  tags?: string[];
  expiresAt?: string | null;
  passcode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface CreateBioTreePayload {
  slug: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  theme?: BioTreeTheme;
  items?: BioTreeItem[];
}

interface LinkContextType {
  links: ShortLink[];
  filteredLinks: ShortLink[];
  bioTrees: BioTree[];
  theme: 'light' | 'dark';
  toasts: Toast[];
  searchQuery: string;
  statusFilter: FilterStatus;
  sortField: SortField;
  sortOrder: SortOrder;
  selectedTag: string | null;
  activeTab: NavTab;
  activeQrModalLink: ShortLink | null;
  activeAnalyticsModalLink: ShortLink | null;
  
  // Navigation & View Actions
  setActiveTab: (tab: NavTab) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: FilterStatus) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setSelectedTag: (tag: string | null) => void;
  toggleTheme: () => void;
  
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  
  createLink: (payload: CreateLinkPayload) => Promise<ShortLink | null>;
  updateLink: (id: string, updates: Partial<ShortLink>) => void;
  deleteLink: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleStatus: (id: string) => void;
  recordClick: (shortCode: string) => ShortLink | null;

  // Bio Trees Actions
  createBioTree: (payload: CreateBioTreePayload) => Promise<BioTree | null>;
  updateBioTree: (id: string, updates: Partial<BioTree>) => Promise<void>;
  deleteBioTree: (id: string) => Promise<void>;
  recordBioTreePageVisit: (slug: string) => void;
  recordBioTreeLinkClick: (slug: string, itemId: string) => void;
  
  openQrModal: (link: ShortLink) => void;
  closeQrModal: () => void;
  openAnalyticsModal: (link: ShortLink) => void;
  closeAnalyticsModal: () => void;
  
  exportData: () => void;
  importData: (json: string) => boolean;
  clearAllLinks: () => void;
}

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export const LinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [links, setLinks] = useState<ShortLink[]>(getStoredLinks);
  const [bioTrees, setBioTrees] = useState<BioTree[]>(getStoredBioTrees);
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Helper to read initial tab from URL hash or fallback to 'home'
  const getInitialTab = (): NavTab => {
    const hash = window.location.hash;
    if (hash.startsWith('#/links')) return 'links';
    if (hash.startsWith('#/bio')) return 'bio';
    if (hash.startsWith('#/qr')) return 'qr';
    if (hash.startsWith('#/analytics')) return 'analytics';
    if (hash.startsWith('#/settings')) return 'settings';
    return 'home';
  };

  // Navigation tab synced with URL hash
  const [activeTab, setActiveTabState] = useState<NavTab>(getInitialTab);

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    if (tab === 'home') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/${tab}`;
    }
  };

  // Sync activeTab when browser back/forward buttons or hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/r/') || hash.startsWith('#/tree/') || hash.startsWith('#/b/')) {
        return; // Intercepted routes
      }
      const newTab = getInitialTab();
      setActiveTabState(newTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modals
  const [activeQrModalLink, setActiveQrModalLink] = useState<ShortLink | null>(null);
  const [activeAnalyticsModalLink, setActiveAnalyticsModalLink] = useState<ShortLink | null>(null);

  // Load User Links & Bio Trees from Supabase when connected
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    async function fetchUserData() {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session?.user?.id) return;

      // Load Links
      const { data: linkData, error: linkErr } = await supabase!
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (linkErr) {
        console.error('Error loading Supabase links:', linkErr.message);
      } else if (linkData) {
        setLinks(linkData.map(mapRowToLink));
      }

      // Load Bio Trees
      const { data: treeData, error: treeErr } = await supabase!
        .from('bio_trees')
        .select('*')
        .order('created_at', { ascending: false });

      if (treeErr) {
        console.error('Error loading Supabase bio trees:', treeErr.message);
      } else if (treeData) {
        setBioTrees(treeData.map(mapRowToBioTree));
      }
    }

    fetchUserData();
  }, [user]);

  // Persist local state if Supabase offline
  useEffect(() => {
    if (!isSupabaseConfigured) {
      saveStoredLinks(links);
    }
  }, [links]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      saveStoredBioTrees(bioTrees);
    }
  }, [bioTrees]);

  // Persist & apply theme
  useEffect(() => {
    saveStoredTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToast = (message: string, type: ToastType = 'info', duration: number = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const createLink = async (payload: CreateLinkPayload): Promise<ShortLink | null> => {
    const formattedOriginalUrl = formatUrl(payload.originalUrl);
    
    // Determine shortcode
    let code = payload.customCode?.trim();
    if (code) {
      // Check for uniqueness in local state
      const exists = links.some(l => l.shortCode.toLowerCase() === code!.toLowerCase());
      if (exists) {
        addToast(`Short code "${code}" is already taken. Please choose another.`, 'error');
        return null;
      }

      // Check for uniqueness in Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const { data: existingDbLink } = await supabase
          .from('links')
          .select('id')
          .ilike('short_code', code)
          .maybeSingle();

        if (existingDbLink) {
          addToast(`Short code "${code}" is already taken. Please choose a different alias.`, 'error');
          return null;
        }
      }
    } else {
      // Generate unique short code
      let attempts = 0;
      do {
        code = generateShortCode(6);
        attempts++;
      } while (links.some(l => l.shortCode === code) && attempts < 20);
    }

    // Build UTM modified URL if parameters present
    let finalOriginalUrl = formattedOriginalUrl;
    try {
      const urlObj = new URL(formattedOriginalUrl);
      if (payload.utmSource) urlObj.searchParams.set('utm_source', payload.utmSource);
      if (payload.utmMedium) urlObj.searchParams.set('utm_medium', payload.utmMedium);
      if (payload.utmCampaign) urlObj.searchParams.set('utm_campaign', payload.utmCampaign);
      finalOriginalUrl = urlObj.toString();
    } catch {
      // fallback
    }

    const newLink: ShortLink = {
      id: `link-${Date.now()}`,
      originalUrl: finalOriginalUrl,
      shortCode: code,
      title: payload.title?.trim() || payload.customCode || code,
      description: payload.description?.trim(),
      tags: payload.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: payload.expiresAt || null,
      clicksCount: 0,
      clicksLog: [],
      isProtected: !!payload.passcode,
      passcode: payload.passcode || undefined,
      status: 'active',
      isFavorite: false,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
      userId: user?.id
    };

    // If Supabase active, insert into Database
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        const dbRow = mapLinkToRow(newLink, session.user.id);
        const { data, error } = await supabase
          .from('links')
          .insert([dbRow])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error.message);
          addToast(`Supabase Error: ${error.message}`, 'error', 5000);
          return null;
        } else if (data) {
          const saved = mapRowToLink(data);
          setLinks(prev => [saved, ...prev]);
          addToast(`Short link created & saved to Supabase! Code: ${code}`, 'success');
          
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          } catch {}
          return saved;
        }
      }
    }

    // Fallback local insertion
    setLinks(prev => [newLink, ...prev]);
    addToast(`Short link created! Code: ${code}`, 'success');

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}

    return newLink;
  };

  const updateLink = async (id: string, updates: Partial<ShortLink>) => {
    const target = links.find(l => l.id === id);
    if (!target) return;

    const updated = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setLinks(prev => prev.map(l => l.id === id ? updated : l));

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && !id.startsWith('link-')) {
        const dbRow = mapLinkToRow(updated, session.user.id);
        const { error } = await supabase
          .from('links')
          .update(dbRow)
          .eq('id', id);

        if (error) {
          console.error('Error updating link in Supabase:', error.message);
        }
      }
    }

    addToast('Link updated successfully', 'success');
  };

  const deleteLink = async (id: string) => {
    const target = links.find(l => l.id === id);
    setLinks(prev => prev.filter(l => l.id !== id));

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && !id.startsWith('link-')) {
        const { error } = await supabase
          .from('links')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting link in Supabase:', error.message);
        }
      }
    }

    addToast(`Deleted short link "${target?.shortCode || ''}"`, 'info');
  };

  const toggleFavorite = (id: string) => {
    const target = links.find(l => l.id === id);
    if (target) {
      updateLink(id, { isFavorite: !target.isFavorite });
    }
  };

  const toggleStatus = (id: string) => {
    const target = links.find(l => l.id === id);
    if (target) {
      const nextStatus = target.status === 'disabled' ? 'active' : 'disabled';
      updateLink(id, { status: nextStatus });
    }
  };

  const recordClick = (shortCode: string): ShortLink | null => {
    const cleanCode = shortCode.toLowerCase();
    const target = links.find(l => l.shortCode.toLowerCase() === cleanCode);
    const clickData = createClickLog();

    if (target) {
      const currentStatus = evaluateStatus(target);
      if (currentStatus !== 'active') return target;

      const updatedLink: ShortLink = {
        ...target,
        clicksCount: target.clicksCount + 1,
        clicksLog: [clickData, ...target.clicksLog]
      };

      setLinks(prev => prev.map(l => l.id === target.id ? updatedLink : l));

      if (isSupabaseConfigured && supabase) {
        supabase.rpc('increment_link_click', { target_code: cleanCode, click_log: clickData }).then(({ error }) => {
          if (error && !target.id.startsWith('link-')) {
            supabase!
              .from('links')
              .update({
                clicks_count: updatedLink.clicksCount,
                clicks_log: updatedLink.clicksLog
              })
              .eq('id', target.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error('Error updating click log in Supabase:', updateErr.message);
              });
          }
        });
      }

      return updatedLink;
    } else if (isSupabaseConfigured && supabase) {
      supabase.rpc('increment_link_click', { target_code: cleanCode, click_log: clickData }).then(({ error }) => {
        if (error) {
          supabase!
            .from('links')
            .select('*')
            .ilike('short_code', cleanCode)
            .maybeSingle()
            .then(({ data, error: selectErr }) => {
              if (!selectErr && data) {
                const remoteLink = mapRowToLink(data);
                if (evaluateStatus(remoteLink) === 'active') {
                  const updatedCount = remoteLink.clicksCount + 1;
                  const updatedLogs = [clickData, ...(remoteLink.clicksLog || [])];
                  supabase!
                    .from('links')
                    .update({
                      clicks_count: updatedCount,
                      clicks_log: updatedLogs
                    })
                    .eq('id', remoteLink.id)
                    .then(({ error: updateErr }) => {
                      if (updateErr) console.error('Error updating remote click in Supabase:', updateErr.message);
                    });
                }
              }
            });
        }
      });
    }

    return null;
  };

  // ==========================================
  // BIO TREE METHODS
  // ==========================================
  const createBioTree = async (payload: CreateBioTreePayload): Promise<BioTree | null> => {
    const cleanSlug = payload.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug) {
      addToast('Please enter a valid URL slug for your Bio Tree', 'error');
      return null;
    }

    // Check slug uniqueness
    const existsLocally = bioTrees.some(t => t.slug.toLowerCase() === cleanSlug);
    if (existsLocally) {
      addToast(`Bio Tree slug "${cleanSlug}" is already taken locally.`, 'error');
      return null;
    }

    if (isSupabaseConfigured && supabase) {
      const { data: dbExist } = await supabase
        .from('bio_trees')
        .select('id')
        .ilike('slug', cleanSlug)
        .maybeSingle();

      if (dbExist) {
        addToast(`Bio Tree slug "${cleanSlug}" is already taken. Please choose another.`, 'error');
        return null;
      }
    }

    const newTree: BioTree = {
      id: `tree-${Date.now()}`,
      slug: cleanSlug,
      title: payload.title.trim() || 'My Link Tree',
      bio: payload.bio?.trim() || '',
      avatarUrl: payload.avatarUrl?.trim() || '',
      theme: payload.theme || 'indigo',
      items: payload.items || [
        { id: `bti-${Date.now()}-1`, title: 'My Main Website', url: 'https://example.com', icon: 'globe', clicksCount: 0, isEnabled: true },
        { id: `bti-${Date.now()}-2`, title: 'Follow on Twitter', url: 'https://twitter.com', icon: 'twitter', clicksCount: 0, isEnabled: true }
      ],
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id
    };

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const dbRow = mapBioTreeToRow(newTree, session.user.id);
        const { data, error } = await supabase
          .from('bio_trees')
          .insert([dbRow])
          .select()
          .single();

        if (error) {
          console.error('Supabase Bio Tree insert error:', error.message);
          addToast(`Supabase Error: ${error.message}`, 'error');
          return null;
        } else if (data) {
          const savedTree = mapRowToBioTree(data);
          setBioTrees(prev => [savedTree, ...prev]);
          addToast(`Bio Tree /#/tree/${cleanSlug} created & saved!`, 'success');
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
          } catch {}
          return savedTree;
        }
      }
    }

    setBioTrees(prev => [newTree, ...prev]);
    addToast(`Bio Tree /#/tree/${cleanSlug} created!`, 'success');
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}
    return newTree;
  };

  const updateBioTree = async (id: string, updates: Partial<BioTree>) => {
    const target = bioTrees.find(t => t.id === id);
    if (!target) return;

    const updated: BioTree = {
      ...target,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setBioTrees(prev => prev.map(t => t.id === id ? updated : t));

    if (isSupabaseConfigured && supabase && !id.startsWith('tree-')) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const dbRow = mapBioTreeToRow(updated, session.user.id);
        const { error } = await supabase
          .from('bio_trees')
          .update(dbRow)
          .eq('id', id);

        if (error) {
          console.error('Error updating Bio Tree in Supabase:', error.message);
        }
      }
    }

    addToast('Bio Tree updated successfully', 'success');
  };

  const deleteBioTree = async (id: string) => {
    const target = bioTrees.find(t => t.id === id);
    setBioTrees(prev => prev.filter(t => t.id !== id));

    if (isSupabaseConfigured && supabase && !id.startsWith('tree-')) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { error } = await supabase
          .from('bio_trees')
          .delete()
          .eq('id', id);

        if (error) console.error('Error deleting Bio Tree in Supabase:', error.message);
      }
    }

    addToast(`Deleted Bio Tree "${target?.slug || ''}"`, 'info');
  };

  const recordBioTreePageVisit = (slug: string) => {
    const cleanSlug = slug.toLowerCase();
    const target = bioTrees.find(t => t.slug.toLowerCase() === cleanSlug);

    if (target) {
      const updated = {
        ...target,
        viewsCount: target.viewsCount + 1
      };

      setBioTrees(prev => prev.map(t => t.id === target.id ? updated : t));

      if (isSupabaseConfigured && supabase) {
        supabase.rpc('increment_bio_tree_view', { tree_slug: cleanSlug }).then(({ error }) => {
          if (error && !target.id.startsWith('tree-')) {
            supabase!
              .from('bio_trees')
              .update({ views_count: updated.viewsCount })
              .eq('id', target.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error('Error updating Bio Tree views in Supabase:', updateErr.message);
              });
          }
        });
      }
    } else if (isSupabaseConfigured && supabase) {
      supabase.rpc('increment_bio_tree_view', { tree_slug: cleanSlug }).then(({ error }) => {
        if (error) {
          supabase!
            .from('bio_trees')
            .select('id, views_count')
            .ilike('slug', cleanSlug)
            .maybeSingle()
            .then(({ data, error: selectErr }) => {
              if (!selectErr && data) {
                const newViews = (data.views_count || 0) + 1;
                supabase!
                  .from('bio_trees')
                  .update({ views_count: newViews })
                  .eq('id', data.id)
                  .then(({ error: updateErr }) => {
                    if (updateErr) console.error('Error updating remote Bio Tree views:', updateErr.message);
                  });
              }
            });
        }
      });
    }
  };

  const recordBioTreeLinkClick = (slug: string, itemId: string) => {
    const cleanSlug = slug.toLowerCase();
    const target = bioTrees.find(t => t.slug.toLowerCase() === cleanSlug);

    const matchesItem = (item: BioTreeItem) => {
      if (item.id && item.id === itemId) return true;
      if (item.url && item.url === itemId) return true;
      return false;
    };

    if (target) {
      const updatedItems = target.items.map(item =>
        matchesItem(item) ? { ...item, clicksCount: (item.clicksCount || 0) + 1 } : item
      );

      const updated = {
        ...target,
        items: updatedItems
      };

      setBioTrees(prev => prev.map(t => t.id === target.id ? updated : t));

      if (isSupabaseConfigured && supabase) {
        supabase.rpc('increment_bio_tree_link_click', {
          tree_slug: cleanSlug,
          target_item_id: itemId
        }).then(({ error }) => {
          if (error && !target.id.startsWith('tree-')) {
            supabase!
              .from('bio_trees')
              .update({ items: updatedItems })
              .eq('id', target.id)
              .then(({ error: updateErr }) => {
                if (updateErr) console.error('Error updating Bio Tree click count in Supabase:', updateErr.message);
              });
          }
        });
      }
    } else if (isSupabaseConfigured && supabase) {
      supabase.rpc('increment_bio_tree_link_click', {
        tree_slug: cleanSlug,
        target_item_id: itemId
      }).then(({ error }) => {
        if (error) {
          supabase!
            .from('bio_trees')
            .select('id, items')
            .ilike('slug', cleanSlug)
            .maybeSingle()
            .then(({ data, error: selectErr }) => {
              if (!selectErr && data && Array.isArray(data.items)) {
                const updatedItems = data.items.map((item: any) =>
                  (item.id === itemId || item.url === itemId)
                    ? { ...item, clicksCount: (item.clicksCount || 0) + 1 }
                    : item
                );
                supabase!
                  .from('bio_trees')
                  .update({ items: updatedItems })
                  .eq('id', data.id)
                  .then(({ error: updateErr }) => {
                    if (updateErr) console.error('Error updating remote Bio Tree click:', updateErr.message);
                  });
              }
            });
        }
      });
    }
  };

  const openQrModal = (link: ShortLink) => {
    setActiveQrModalLink(link);
  };
  const closeQrModal = () => setActiveQrModalLink(null);

  const openAnalyticsModal = (link: ShortLink) => {
    setActiveAnalyticsModalLink(link);
  };
  const closeAnalyticsModal = () => setActiveAnalyticsModalLink(null);

  const exportData = () => {
    const backupObj = {
      links,
      bioTrees
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `urlsnip_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Exported URLSnip backup as JSON file', 'success');
  };

  const importData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        setLinks(parsed);
        addToast(`Successfully imported ${parsed.length} links`, 'success');
        return true;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.links)) setLinks(parsed.links);
        if (Array.isArray(parsed.bioTrees)) setBioTrees(parsed.bioTrees);
        addToast('Successfully imported backup data', 'success');
        return true;
      }
      throw new Error('Invalid format');
    } catch {
      addToast('Failed to import file. Make sure it is valid JSON.', 'error');
      return false;
    }
  };

  const clearAllLinks = () => {
    setLinks([]);
    addToast('Cleared all shortened links', 'info');
  };

  // Filtered & Sorted links calculation
  const filteredLinks = links.filter(link => {
    const currentStatus = evaluateStatus(link);

    // Status filter
    if (statusFilter === 'active' && currentStatus !== 'active') return false;
    if (statusFilter === 'expired' && currentStatus !== 'expired') return false;
    if (statusFilter === 'disabled' && currentStatus !== 'disabled') return false;
    if (statusFilter === 'favorites' && !link.isFavorite) return false;

    // Tag filter
    if (selectedTag && (!link.tags || !link.tags.includes(selectedTag))) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = link.shortCode.toLowerCase().includes(q);
      const matchTitle = (link.title || '').toLowerCase().includes(q);
      const matchUrl = link.originalUrl.toLowerCase().includes(q);
      const matchDesc = (link.description || '').toLowerCase().includes(q);
      const matchTags = link.tags?.some(t => t.toLowerCase().includes(q));
      return matchCode || matchTitle || matchUrl || matchDesc || matchTags;
    }

    return true;
  }).sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
    }
    if (sortField === 'clicksCount') {
      return (a.clicksCount - b.clicksCount) * factor;
    }
    if (sortField === 'title') {
      return (a.title || a.shortCode).localeCompare(b.title || b.shortCode) * factor;
    }
    return 0;
  });

  return (
    <LinkContext.Provider
      value={{
        links,
        filteredLinks,
        bioTrees,
        theme,
        toasts,
        searchQuery,
        statusFilter,
        sortField,
        sortOrder,
        selectedTag,
        activeTab,
        activeQrModalLink,
        activeAnalyticsModalLink,
        setActiveTab,
        setSearchQuery,
        setStatusFilter,
        setSortField,
        setSortOrder,
        setSelectedTag,
        toggleTheme,
        addToast,
        removeToast,
        createLink,
        updateLink,
        deleteLink,
        toggleFavorite,
        toggleStatus,
        recordClick,
        createBioTree,
        updateBioTree,
        deleteBioTree,
        recordBioTreePageVisit,
        recordBioTreeLinkClick,
        openQrModal,
        closeQrModal,
        openAnalyticsModal,
        closeAnalyticsModal,
        exportData,
        importData,
        clearAllLinks
      }}
    >
      {children}
    </LinkContext.Provider>
  );
};

export const useLinks = () => {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error('useLinks must be used within a LinkProvider');
  }
  return context;
};
