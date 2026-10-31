import React, { useState, useEffect } from 'react';
import { getSocialLinks, SocialLink } from '../services/socialLinks';

interface SocialIconsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SocialIcons: React.FC<SocialIconsProps> = ({ className = '', size = 'md' }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    setLinks(getSocialLinks().filter((l) => l.enabled));

    const handleUpdate = () => {
      setLinks(getSocialLinks().filter((l) => l.enabled));
    };

    window.addEventListener('webrex_social_links_updated', handleUpdate);
    return () => window.removeEventListener('webrex_social_links_updated', handleUpdate);
  }, []);

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7'
  }[size];

  const renderIcon = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'linkedin':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#0A66C2" />
            <path
              d="M7.05 19H4.25V9.45H7.05V19ZM5.65 8.15C4.75 8.15 4 7.4 4 6.5C4 5.6 4.75 4.85 5.65 4.85C6.55 4.85 7.3 5.6 7.3 6.5C7.3 7.4 6.55 8.15 5.65 8.15ZM19.75 19H16.95V14.45C16.95 13.35 16.9 11.95 15.35 11.95C13.8 11.95 13.55 13.15 13.55 14.35V19H10.75V9.45H13.45V10.75H13.5C13.85 10.05 14.8 9.25 16.2 9.25C19.2 9.25 19.75 11.25 19.75 13.85V19Z"
              fill="white"
            />
          </svg>
        );

      case 'x':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );

      case 'tiktok':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24">
            <path
              d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.895 2.895 0 0 1 2.316-4.629c.314 0 .619.051.904.144V9.422a6.33 6.33 0 0 0-.904-.065 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.718a8.175 8.175 0 0 0 4.77 1.52v-3.445a4.838 4.838 0 0 1-1-.107Z"
              fill="#25F4EE"
            />
          </svg>
        );

      case 'youtube':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="5" fill="#FF0000" />
            <polygon points="10,8 16,12 10,16" fill="white" />
          </svg>
        );

      case 'telegram':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#29B6F6" />
            <path
              d="M17.5 7.5L6.5 11.5L9.5 13.5L14.5 10L10.5 14.5L15.5 17L17.5 7.5Z"
              fill="white"
            />
          </svg>
        );

      case 'instagram':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="instaGrad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FED373" />
                <stop offset="30%" stopColor="#F15245" />
                <stop offset="60%" stopColor="#D92E7F" />
                <stop offset="100%" stopColor="#9B36B7" />
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="6" fill="url(#instaGrad)" />
            <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="white" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.8" />
            <circle cx="15.8" cy="8.2" r="0.9" fill="white" />
          </svg>
        );

      case 'facebook':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#1877F2" />
            <path
              d="M13.5 19V12.5H15.5L16 10H13.5V8.5C13.5 7.8 13.8 7.2 14.8 7.2H16V5.2C15.8 5.2 15 5 14 5C12 5 10.7 6.2 10.7 8.3V10H8.5V12.5H10.7V19H13.5Z"
              fill="white"
            />
          </svg>
        );

      case 'whatsapp':
        return (
          <svg className={iconSizes} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#25D366" />
            <path
              d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 13.06 6.8 14.05 7.33 14.9L6.5 17.5L9.2 16.7C10.02 17.2 10.98 17.5 12 17.5C15.04 17.5 17.5 15.04 17.5 12C17.5 8.96 15.04 6.5 12 6.5ZM14.7 14.2C14.58 14.53 14.12 14.81 13.78 14.89C13.55 14.94 13.25 14.98 12.24 14.56C10.95 14.02 10.11 12.72 9.04 11.33C8.42 10.5 8.42 9.38 9.04 8.76C9.21 8.59 9.42 8.5 9.63 8.5C9.74 8.5 9.85 8.51 9.94 8.52C10.16 8.53 10.27 8.55 10.42 8.91C10.6 9.36 11.04 10.44 11.1 10.55C11.15 10.67 11.21 10.82 11.13 10.97C11.05 11.13 10.99 11.2 10.88 11.33C10.77 11.46 10.66 11.55 10.54 11.69C10.42 11.82 10.29 11.96 10.44 12.22C10.59 12.48 11.1 13.31 11.86 13.99C12.84 14.86 13.65 15.13 13.92 15.24C14.18 15.35 14.34 15.33 14.49 15.16C14.65 14.98 15.16 14.39 15.33 14.14C15.5 13.89 15.67 13.92 15.91 14.01C16.15 14.1 17.44 14.74 17.7 14.87C17.96 15 18.13 15.06 18.19 15.17C18.25 15.28 18.25 15.75 18.05 16.03L14.7 14.2Z"
              fill="white"
            />
          </svg>
        );

      default:
        return (
          <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs">
            W
          </div>
        );
    }
  };

  const getHoverGlow = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'linkedin':
        return 'hover:shadow-blue-500/25 hover:border-blue-500/50';
      case 'x':
        return 'hover:shadow-slate-400/20 hover:border-slate-500/60';
      case 'tiktok':
        return 'hover:shadow-cyan-400/25 hover:border-cyan-400/60';
      case 'youtube':
        return 'hover:shadow-red-500/25 hover:border-red-500/60';
      case 'telegram':
        return 'hover:shadow-sky-400/25 hover:border-sky-400/60';
      case 'instagram':
        return 'hover:shadow-pink-500/25 hover:border-pink-500/60';
      case 'facebook':
        return 'hover:shadow-blue-600/25 hover:border-blue-600/60';
      case 'whatsapp':
        return 'hover:shadow-emerald-500/25 hover:border-emerald-500/60';
      default:
        return 'hover:shadow-cyan-500/25 hover:border-cyan-500/50';
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 ${className}`}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`group relative flex items-center justify-center ${sizeClasses} bg-slate-900/90 border border-slate-800/90 hover:bg-slate-850 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg ${getHoverGlow(
            link.platform
          )}`}
        >
          {renderIcon(link.platform)}
          <span className="sr-only">{link.name}</span>
        </a>
      ))}
    </div>
  );
};
