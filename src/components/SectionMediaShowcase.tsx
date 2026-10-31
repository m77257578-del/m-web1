import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Maximize2, X } from 'lucide-react';
import {
  MediaPlacementLocation,
  SiteMediaItem,
  useSiteMedia,
} from '../services/siteMedia';
import { ProtectedVideoPlayer } from './ProtectedVideoPlayer';
import { usePlatformSettings } from '../services/platformSettings';

interface SectionMediaShowcaseProps {
  placement: MediaPlacementLocation;
  className?: string;
}

export const SectionMediaShowcase: React.FC<SectionMediaShowcaseProps> = ({
  placement,
  className = '',
}) => {
  const items = useSiteMedia(placement);
  const settings = usePlatformSettings();
  const [zoomedImageItem, setZoomedImageItem] = useState<SiteMediaItem | null>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      data-testid={`section-media-${placement}`}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}
    >
      <div className={`grid grid-cols-1 ${items.length > 1 ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'} gap-8`}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            data-testid={`published-media-card-${item.mediaType}`}
          >
            {item.mediaType === 'video' ? (
              <ProtectedVideoPlayer
                url={item.url}
                title={item.title}
                subtitle={item.subtitle || settings.brandNameAr}
                badgeLabel={item.badgeLabel || 'فيديو'}
                avatarUrl={item.avatarUrl}
                thumbnailUrl={item.thumbnailUrl}
                footerNote={item.footerNote}
                showSectionFrame={true}
              />
            ) : (
              /* Image Showcase Card */
              <div className="w-full rounded-3xl bg-gradient-to-b from-[#1a0d2e]/95 via-[#0e1324] to-[#0a0f1d] border border-slate-800/80 overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-right w-full flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{item.badgeLabel || 'صورة'}</span>
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {item.badgeLabel || 'صورة'}
                      </h3>
                    </div>
                  </div>

                  <div
                    onClick={() => setZoomedImageItem(item)}
                    className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-2xl group cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65" />

                    {/* Top Right Overlay with Title & Avatar */}
                    <div
                      dir="ltr"
                      className="absolute top-0 inset-x-0 p-3.5 sm:p-5 flex items-center justify-end gap-3 sm:gap-4"
                    >
                      <div className="text-right min-w-0 flex-1">
                        <h4 className="text-sm sm:text-xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] truncate">
                          {item.title}
                        </h4>
                        {(item.subtitle || settings.brandNameAr) && (
                          <p className="text-xs sm:text-sm font-bold text-slate-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate mt-0.5">
                            {item.subtitle || settings.brandNameAr}
                          </p>
                        )}
                      </div>

                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-cyan-400/50 bg-slate-900 shadow-xl shrink-0 flex items-center justify-center">
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm sm:text-lg">
                            {settings.logoMain || 'M'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Zoom button on bottom left */}
                    <div className="absolute bottom-3 left-3">
                      <span className="p-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white flex items-center gap-1.5 text-xs font-bold backdrop-blur-md">
                        <Maximize2 className="w-4 h-4 text-cyan-400" />
                        <span>تكبير الصورة</span>
                      </span>
                    </div>
                  </div>
                </div>

                {item.footerNote && (
                  <div className="px-6 py-4 bg-[#121829]/90 border-t border-slate-800/80 text-right">
                    <p className="text-xs sm:text-sm font-medium text-slate-400">{item.footerNote}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {zoomedImageItem && (
          <div
            onClick={() => setZoomedImageItem(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-base font-black text-white">{zoomedImageItem.title}</h4>
                <button
                  type="button"
                  onClick={() => setZoomedImageItem(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[80vh]">
                <img
                  src={zoomedImageItem.url}
                  alt={zoomedImageItem.title}
                  className="max-h-[75vh] max-w-full object-contain rounded-2xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
