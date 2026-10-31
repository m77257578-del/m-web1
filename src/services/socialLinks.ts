export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'x' | 'tiktok' | 'youtube' | 'telegram' | 'instagram' | 'facebook' | 'whatsapp' | 'other';
  name: string;
  url: string;
  enabled: boolean;
}

const STORAGE_KEY = 'webrex_social_links';

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'soc-1',
    platform: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/webrex-dev',
    enabled: true
  },
  {
    id: 'soc-2',
    platform: 'x',
    name: 'X (Twitter)',
    url: 'https://x.com/webrex_dev',
    enabled: true
  },
  {
    id: 'soc-3',
    platform: 'tiktok',
    name: 'TikTok',
    url: 'https://tiktok.com/@webrex_dev',
    enabled: true
  },
  {
    id: 'soc-4',
    platform: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com/@webrex_dev',
    enabled: true
  },
  {
    id: 'soc-5',
    platform: 'telegram',
    name: 'Telegram',
    url: 'https://t.me/webrex_agency',
    enabled: true
  },
  {
    id: 'soc-6',
    platform: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/webrex.dev',
    enabled: true
  },
  {
    id: 'soc-7',
    platform: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com/webrex.agency',
    enabled: true
  },
  {
    id: 'soc-8',
    platform: 'whatsapp',
    name: 'WhatsApp',
    url: 'https://wa.me/201000000000',
    enabled: true
  }
];

export function getSocialLinks(): SocialLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading social links:', e);
  }
  return DEFAULT_SOCIAL_LINKS;
}

export function saveSocialLinks(links: SocialLink[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    window.dispatchEvent(new Event('webrex_social_links_updated'));
  } catch (e) {
    console.warn('Error saving social links:', e);
  }
}

export function addSocialLink(link: {
  platform: SocialLink['platform'];
  name: string;
  url: string;
}): void {
  const current = getSocialLinks();
  const newLink: SocialLink = {
    id: 'soc-' + Date.now(),
    platform: link.platform,
    name: link.name || link.platform,
    url: link.url,
    enabled: true
  };
  saveSocialLinks([...current, newLink]);
}

export function updateSocialLink(id: string, updated: Partial<SocialLink>): void {
  const current = getSocialLinks();
  const next = current.map((item) => (item.id === id ? { ...item, ...updated } : item));
  saveSocialLinks(next);
}

export function deleteSocialLink(id: string): void {
  const current = getSocialLinks();
  const next = current.filter((item) => item.id !== id);
  saveSocialLinks(next);
}

export function resetSocialLinks(): void {
  saveSocialLinks(DEFAULT_SOCIAL_LINKS);
}
