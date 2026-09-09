import { ShortLink, BioTree } from '../types';

const STORAGE_KEY = 'urlsnip_links_v2';
const BIO_TREES_KEY = 'urlsnip_bio_trees_v1';
const THEME_KEY = 'urlsnip_theme_preference';

export function getStoredLinks(): ShortLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading links from localStorage:', err);
    return [];
  }
}

export function saveStoredLinks(links: ShortLink[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (err) {
    console.error('Error saving links to localStorage:', err);
  }
}

export function getStoredBioTrees(): BioTree[] {
  try {
    const raw = localStorage.getItem(BIO_TREES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading bio trees from localStorage:', err);
    return [];
  }
}

export function saveStoredBioTrees(trees: BioTree[]): void {
  try {
    localStorage.setItem(BIO_TREES_KEY, JSON.stringify(trees));
  } catch (err) {
    console.error('Error saving bio trees to localStorage:', err);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Error saving theme to localStorage:', err);
  }
}
