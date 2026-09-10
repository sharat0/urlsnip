import { createClient } from '@supabase/supabase-js';
import { ShortLink, BioTree } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Maps database row (snake_case) to ShortLink model (camelCase)
 */
export function mapRowToLink(row: any): ShortLink {
  return {
    id: row.id,
    originalUrl: row.original_url,
    shortCode: row.short_code,
    title: row.title || row.short_code,
    description: row.description || '',
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at || null,
    clicksCount: row.clicks_count || 0,
    clicksLog: row.clicks_log || [],
    isProtected: row.is_protected || false,
    passcode: row.passcode || undefined,
    status: row.status || 'active',
    isFavorite: row.is_favorite || false,
    utmSource: row.utm_source || undefined,
    utmMedium: row.utm_medium || undefined,
    utmCampaign: row.utm_campaign || undefined,
    userId: row.user_id
  };
}

/**
 * Maps ShortLink model (camelCase) to database row (snake_case)
 */
export function mapLinkToRow(link: ShortLink, userId: string): any {
  const row: any = {
    user_id: userId,
    original_url: link.originalUrl,
    short_code: link.shortCode,
    title: link.title || link.shortCode,
    description: link.description || '',
    tags: link.tags || [],
    created_at: link.createdAt,
    updated_at: link.updatedAt,
    expires_at: link.expiresAt || null,
    clicks_count: link.clicksCount || 0,
    clicks_log: link.clicksLog || [],
    is_protected: link.isProtected || false,
    passcode: link.passcode || null,
    status: link.status || 'active',
    is_favorite: link.isFavorite || false,
    utm_source: link.utmSource || null,
    utm_medium: link.utmMedium || null,
    utm_campaign: link.utmCampaign || null
  };

  if (link.id && !link.id.startsWith('link-') && link.id.length > 20) {
    row.id = link.id;
  }

  return row;
}

/**
 * Maps database row to BioTree model
 */
export function mapRowToBioTree(row: any): BioTree {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    bio: row.bio || '',
    avatarUrl: row.avatar_url || '',
    theme: row.theme || 'indigo',
    items: row.items || [],
    viewsCount: row.views_count || 0,
    clicksLog: row.clicks_log || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id
  };
}

/**
 * Maps BioTree model to database row
 */
export function mapBioTreeToRow(tree: BioTree, userId: string): any {
  const row: any = {
    user_id: userId,
    slug: tree.slug,
    title: tree.title,
    bio: tree.bio || '',
    avatar_url: tree.avatarUrl || '',
    theme: tree.theme || 'indigo',
    items: tree.items || [],
    views_count: tree.viewsCount || 0,
    clicks_log: tree.clicksLog || [],
    created_at: tree.createdAt,
    updated_at: tree.updatedAt
  };

  if (tree.id && !tree.id.startsWith('tree-') && tree.id.length > 20) {
    row.id = tree.id;
  }

  return row;
}
