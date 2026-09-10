import { ShortLink, ClickData } from '../types';

/**
 * Validates if string is a syntactically valid URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  let formatted = url.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = 'https://' + formatted;
  }
  
  try {
    const parsed = new URL(formatted);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Ensures URL starts with http:// or https://
 */
export function formatUrl(url: string): string {
  let trimmed = url.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Generates an alphanumeric random code (e.g. "aX9kL2")
 */
export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Extracts domain name from full URL for preview
 */
export function getDomain(url: string): string {
  try {
    const parsed = new URL(formatUrl(url));
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Evaluates current link status based on manual disabled toggle and expiration date
 */
export function evaluateStatus(link: Pick<ShortLink, 'status' | 'expiresAt'>): 'active' | 'expired' | 'disabled' {
  if (link.status === 'disabled') return 'disabled';
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return 'expired';
  }
  return 'active';
}

/**
 * Formats full shortened URL based on window origin & hash router format
 */
export function getShortUrl(shortCode: string): string {
  const origin = window.location.origin + window.location.pathname;
  // Standard hash routing format for client side link redirection
  return `${origin.replace(/\/$/, '')}/#/r/${shortCode}`;
}

/**
 * Detects real traffic referrer source
 */
export function detectReferrer(overrideReferrer?: string): string {
  if (overrideReferrer && overrideReferrer.trim()) return overrideReferrer.trim();

  const ref = typeof document !== 'undefined' && document.referrer ? document.referrer.toLowerCase() : '';
  if (!ref) return 'Direct Visit';
  if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('github.com')) return 'GitHub';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'Facebook';
  if (ref.includes('reddit.com')) return 'Reddit';
  if (ref.includes('youtube.com')) return 'YouTube';
  if (ref.includes('google.')) return 'Google Search';
  if (ref.includes('bing.com') || ref.includes('duckduckgo.com') || ref.includes('yahoo.com')) return 'Search Engine';
  
  try {
    const url = new URL(document.referrer);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'External Referral';
  }
}

/**
 * Detects real user device type
 */
export function detectDevice(): 'Desktop' | 'Mobile' | 'Tablet' {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Detects visitor location/country from browser locale & timezone
 */
export function detectLocation(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta')) return 'India';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('Denver') || tz.includes('Phoenix')) return 'United States';
    if (tz.includes('London')) return 'United Kingdom';
    if (tz.includes('Berlin') || tz.includes('Frankfurt')) return 'Germany';
    if (tz.includes('Tokyo')) return 'Japan';
    if (tz.includes('Paris')) return 'France';
    if (tz.includes('Toronto') || tz.includes('Vancouver')) return 'Canada';
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return 'Australia';
    if (tz.includes('Sao_Paulo')) return 'Brazil';
    
    if (tz.startsWith('America/')) return 'Americas';
    if (tz.startsWith('Europe/')) return 'Europe';
    if (tz.startsWith('Asia/')) return 'Asia-Pacific';
    if (tz.startsWith('Africa/')) return 'Africa';
    if (tz.startsWith('Australia/')) return 'Australia';
  } catch {}

  const lang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  if (lang.includes('IN')) return 'India';
  if (lang.includes('US')) return 'United States';
  if (lang.includes('GB')) return 'United Kingdom';
  if (lang.includes('DE')) return 'Germany';
  if (lang.includes('JP')) return 'Japan';
  if (lang.includes('FR')) return 'France';
  if (lang.includes('BR')) return 'Brazil';
  return 'Global Visitor';
}

/**
 * Creates accurate ClickData log using real browser & visitor metrics
 */
export function createClickLog(customReferrer?: string): ClickData {
  return {
    id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    referrer: detectReferrer(customReferrer),
    device: detectDevice(),
    location: detectLocation(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  };
}

/**
 * Pretty formats human readable relative time or date
 */
export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Calculates human readable expiry text (e.g., "Expires in 3 hours")
 */
export function getExpiryText(expiresAt?: string | null): string {
  if (!expiresAt) return 'Never expires';
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `Expires in ${days}d ${hours % 24}h`;
  if (hours > 0) return `Expires in ${hours}h ${minutes % 60}m`;
  return `Expires in ${minutes}m`;
}
