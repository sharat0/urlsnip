export type LinkStatus = 'active' | 'expired' | 'disabled';

export interface ClickData {
  id: string;
  timestamp: string; // ISO string
  referrer: string;  // e.g. 'Direct', 'Twitter', 'Google', 'LinkedIn'
  device: 'Desktop' | 'Mobile' | 'Tablet';
  location: string;  // e.g. 'United States', 'Germany', 'Japan'
  userAgent?: string;
}

export interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  title?: string;
  description?: string;
  tags?: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  expiresAt?: string | null; // ISO string or null for never
  clicksCount: number;
  clicksLog: ClickData[];
  isProtected?: boolean;
  passcode?: string;
  status: LinkStatus;
  isFavorite?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userId?: string;
}

export interface BioTreeItem {
  id: string;
  title: string;
  url: string;
  icon?: string; // e.g. 'globe', 'github', 'twitter', 'instagram', 'youtube', 'linkedin', 'mail'
  clicksCount: number;
  isEnabled: boolean;
}

export type BioTreeTheme = string;

export interface BioTree {
  id: string;
  slug: string; // custom alias for bio link e.g. 'sharat' -> /#/tree/sharat
  title: string;
  bio?: string;
  avatarUrl?: string;
  theme: BioTreeTheme;
  items: BioTreeItem[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type FilterStatus = 'all' | 'active' | 'expired' | 'disabled' | 'favorites';

export type SortField = 'createdAt' | 'clicksCount' | 'title';
export type SortOrder = 'asc' | 'desc';

export type NavTab = 'home' | 'links' | 'qr' | 'analytics' | 'bio' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  apiKey?: string;
  defaultExpiration?: string;
}
