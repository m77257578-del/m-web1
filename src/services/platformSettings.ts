import { useState, useEffect } from 'react';
import { syncCatalogDocToFirestore, subscribeToSettingsDoc } from './firebase';
import { syncSectionToDataJson } from './dataJsonService';
import {
  PaymentGatewaySettings,
  DEFAULT_PAYMENT_GATEWAY_SETTINGS,
  normalizePaymentGatewaySettings,
} from './paymentGatewayConfig';

export interface PlatformSettings extends PaymentGatewaySettings {
  brandNameAr: string;
  brandNameEn: string;
  logoMain: string;
  logoHighlight: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  whatsappPhone: string;
  heroTitle: string;
  email: string;
  websiteUrl: string;
  addressText: string;
  addressTextEn: string;
  aiBotEnabled: boolean;
  aiBotNameAr: string;
  aiBotNameEn: string;
  liveChatEnabled: boolean;
}

const STORAGE_KEY = 'mweb_platform_settings';
const COLLECTION_NAME = 'settings';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  brandNameAr: 'إم ويب',
  brandNameEn: 'M Web',
  logoMain: 'M',
  logoHighlight: 'Web',
  tagline: 'وكالة هندسة المنصات والحلول الرقمية والتطبيقات',
  taglineEn: 'Digital Platforms & Software Engineering Agency',
  description:
    'شركة برمجية متخصصة في تطوير وتصميم مواقع الويب، الأنظمة الإدارية، والمنصات الرقمية المتكاملة والمخصصة بأعلى معايير السرعة والأمان.',
  descriptionEn:
    'A specialized software engineering company building high-performance web platforms, cloud ERP systems, e-learning academies, and custom digital solutions with top-tier security and speed.',
  whatsappPhone: '201000000000',
  heroTitle: 'ام ويب M Web لتطوير البرمجيات وحلول الويب',
  email: 'contact@mweb.dev',
  websiteUrl: 'https://mweb.dev',
  addressText: 'خدمات برمجية وهندسة منصات رقمية للشركات ورواد الأعمال',
  addressTextEn:
    'Enterprise Software Engineering & Digital Platforms for Businesses & Entrepreneurs',
  aiBotEnabled: true,
  aiBotNameAr: 'الروبوت البرمجي الذكي',
  aiBotNameEn: 'Smart Cyber Robot',
  liveChatEnabled: true,
  ...DEFAULT_PAYMENT_GATEWAY_SETTINGS,
};

function mergeWithDefaults(rawObj?: Partial<PlatformSettings> | null): PlatformSettings {
  const gateway = normalizePaymentGatewaySettings(rawObj);
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...(rawObj || {}),
    taglineEn: rawObj?.taglineEn || DEFAULT_PLATFORM_SETTINGS.taglineEn,
    descriptionEn: rawObj?.descriptionEn || DEFAULT_PLATFORM_SETTINGS.descriptionEn,
    addressTextEn: rawObj?.addressTextEn || DEFAULT_PLATFORM_SETTINGS.addressTextEn,
    aiBotEnabled:
      typeof rawObj?.aiBotEnabled === 'boolean'
        ? rawObj.aiBotEnabled
        : DEFAULT_PLATFORM_SETTINGS.aiBotEnabled,
    aiBotNameAr: rawObj?.aiBotNameAr || DEFAULT_PLATFORM_SETTINGS.aiBotNameAr,
    aiBotNameEn: rawObj?.aiBotNameEn || DEFAULT_PLATFORM_SETTINGS.aiBotNameEn,
    liveChatEnabled:
      typeof rawObj?.liveChatEnabled === 'boolean'
        ? rawObj.liveChatEnabled
        : DEFAULT_PLATFORM_SETTINGS.liveChatEnabled,
    ...gateway,
  };
}

if (typeof window !== 'undefined') {
  subscribeToSettingsDoc<PlatformSettings>(
    'main',
    (mainSettings) => {
      if (mainSettings && typeof mainSettings.brandNameAr === 'string') {
        const merged = mergeWithDefaults(mainSettings);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          window.dispatchEvent(new CustomEvent('platform_settings_changed', { detail: merged }));
        } catch (e) {
          console.warn('Could not sync cloud settings locally:', e);
        }
      }
    },
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = mergeWithDefaults(JSON.parse(raw));
          syncCatalogDocToFirestore(COLLECTION_NAME, 'main', parsed).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  );
}

export function getPlatformSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeWithDefaults(parsed);
    }
  } catch (e) {
    console.warn('Could not load platform settings:', e);
  }
  return DEFAULT_PLATFORM_SETTINGS;
}

export function savePlatformSettings(settings: Partial<PlatformSettings>): PlatformSettings {
  const current = getPlatformSettings();
  const updated = mergeWithDefaults({
    ...current,
    ...settings,
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const currentLang = localStorage.getItem('mweb_preferred_language') || 'ar';
    if (updated.brandNameEn || updated.brandNameAr) {
      document.title =
        currentLang === 'en'
          ? `${updated.brandNameEn} | Software Engineering & Web Solutions`
          : `${updated.brandNameEn} | ${updated.brandNameAr} لتطوير البرمجيات وحلول الويب`;
    }
    window.dispatchEvent(new CustomEvent('platform_settings_changed', { detail: updated }));
    syncCatalogDocToFirestore(COLLECTION_NAME, 'main', updated).catch((e) =>
      console.warn('Firestore settings sync notice:', e)
    );
    syncSectionToDataJson('platformSettings', updated).catch(() => {});
  } catch (e) {
    console.warn('Could not save platform settings:', e);
  }
  return updated;
}

export function resetPlatformSettings(): PlatformSettings {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
    document.title = `${DEFAULT_PLATFORM_SETTINGS.brandNameEn} | ${DEFAULT_PLATFORM_SETTINGS.brandNameAr} لتطوير البرمجيات وحلول الويب`;
    window.dispatchEvent(
      new CustomEvent('platform_settings_changed', { detail: DEFAULT_PLATFORM_SETTINGS })
    );
    syncCatalogDocToFirestore(COLLECTION_NAME, 'main', DEFAULT_PLATFORM_SETTINGS).catch(() => {});
    syncSectionToDataJson('platformSettings', DEFAULT_PLATFORM_SETTINGS).catch(() => {});
  } catch (e) {
    console.warn('Could not reset platform settings:', e);
  }
  return DEFAULT_PLATFORM_SETTINGS;
}

export function usePlatformSettings(): PlatformSettings {
  const [settings, setSettings] = useState<PlatformSettings>(getPlatformSettings);

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const customEvt = e as CustomEvent<PlatformSettings>;
      if (customEvt.detail) {
        setSettings(mergeWithDefaults(customEvt.detail));
      } else {
        setSettings(getPlatformSettings());
      }
    };

    window.addEventListener('platform_settings_changed', handleSettingsChanged);
    window.addEventListener('storage', handleSettingsChanged);
    return () => {
      window.removeEventListener('platform_settings_changed', handleSettingsChanged);
      window.removeEventListener('storage', handleSettingsChanged);
    };
  }, []);

  return settings;
}
