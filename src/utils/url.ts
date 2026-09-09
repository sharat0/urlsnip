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
 * Simulates referrer, device, and location breakdown for clicks log
 */
export function createClickLog(): ClickData {
  const referrers = ['Direct', 'Twitter / X', 'LinkedIn', 'Google Search', 'GitHub', 'Reddit', 'Email Campaign'];
  const devices: ('Desktop' | 'Mobile' | 'Tablet')[] = ['Desktop', 'Mobile', 'Tablet'];
  const locations = ['United States', 'Germany', 'United Kingdom', 'Japan', 'Canada', 'France', 'India', 'Brazil', 'Australia'];
  
  const randomReferrer = referrers[Math.floor(Math.random() * referrers.length)];
  const randomDevice = devices[Math.floor(Math.random() * devices.length)];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];

  return {
    id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    referrer: randomReferrer,
    device: randomDevice,
    location: randomLocation,
    userAgent: navigator.userAgent
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
