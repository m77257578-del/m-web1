import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowRight,
} from 'lucide-react';
import {
  isYouTubeUrl,
  buildProtectedYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from '../services/siteMedia';
import { usePlatformSettings } from '../services/platformSettings';

export interface ProtectedVideoPlayerProps {
  url: string;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  footerNote?: string;
  showSectionFrame?: boolean;
  backButtonLabel?: string;
  onCloseModal?: () => void;
}

export const ProtectedVideoPlayer: React.FC<ProtectedVideoPlayerProps> = ({
  url,
  title,
  subtitle,
  badgeLabel = 'فيديو',
  avatarUrl,
  thumbnailUrl,
  footerNote,
  showSectionFrame = true,
  backButtonLabel,
  onCloseModal,
}) => {
  const settings = usePlatformSettings();
  const isYT = isYouTubeUrl(url);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [cinemaModalOpen, setCinemaModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);

  const resolvedThumbnail =
    thumbnailUrl?.trim() ||
    (isYT ? getYouTubeThumbnailUrl(url) : '') ||
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80';

  const resolvedSubtitle = subtitle?.trim() || settings.brandNameAr || 'إم ويب';

  // Track approximate playback time for YouTube postMessage seekTo (+/- 10s)
  useEffect(() => {
    if (!isYT || !isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isYT, isPlaying]);

  const scheduleControlsHide = () => {
    if (hideControlsTimerRef.current) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2800);
    } else {
      setControlsVisible(true);
    }
  };

  useEffect(() => {
    scheduleControlsHide();
    return () => {
      if (hideControlsTimerRef.current) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [isPlaying]);

  const sendYouTubeCommand = (func: string, args: any[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    } catch (e) {
      console.warn('Could not send command to video frame:', e);
    }
  };

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setControlsVisible(true);

    if (!hasStarted) {
      setHasStarted(true);
      setIsPlaying(true);
      return;
    }

    if (isYT) {
      if (isPlaying) {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        sendYouTubeCommand('playVideo');
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (deltaSeconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setControlsVisible(true);

    if (!hasStarted) {
      setHasStarted(true);
      setIsPlaying(true);
      return;
    }

    if (isYT) {
      const nextTime = Math.max(0, currentTime + deltaSeconds);
      setCurrentTime(nextTime);
      sendYouTubeCommand('seekTo', [nextTime, true]);
      if (!isPlaying) {
        sendYouTubeCommand('playVideo');
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      const nextTime = Math.max(
        0,
        Math.min(videoRef.current.duration || 3600, videoRef.current.currentTime + deltaSeconds)
      );
      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
    scheduleControlsHide();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (isYT) {
      sendYouTubeCommand(nextMuted ? 'mute' : 'unMute');
    } else if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {
          setCinemaModalOpen(true);
        });
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else {
      setCinemaModalOpen(!cinemaModalOpen);
    }
  };

  const renderPlayerCore = () => (
    <div
      ref={containerRef}
      data-testid="protected-video-player"
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => {
        setControlsVisible(true);
        scheduleControlsHide();
      }}
      onMouseMove={() => {
        if (!controlsVisible) setControlsVisible(true);
        scheduleControlsHide();
      }}
      className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.75)] select-none group cursor-pointer"
    >
      {/* Underlying Media Layer (Iframe with pointer-events-none so YouTube share links can NEVER be clicked) */}
      {hasStarted ? (
        isYT ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <iframe
              ref={iframeRef}
              src={buildProtectedYouTubeEmbedUrl(url, true)}
              title={title}
              className="w-full h-full border-0 pointer-events-none select-none scale-[1.04]"
              allow="accelerometer; autoplay; encrypted-media; gyroscope"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={url}
            playsInline
            autoPlay
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        )
      ) : null}

      {/* Poster / Thumbnail Mask when not started or when paused on YouTube (blocks YouTube pause suggestions & share links) */}
      {(!hasStarted || (isYT && !isPlaying)) && (
        <div className="absolute inset-0 z-10 overflow-hidden">
          <img
            src={resolvedThumbnail}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/25 to-slate-950/75" />
        </div>
      )}

      {/* Subtle gradient vignette when playing so custom overlay text remains crisp */}
      <div
        className={`absolute inset-0 z-10 bg-gradient-to-b from-black/65 via-transparent to-black/60 transition-opacity duration-300 pointer-events-none ${
          !isPlaying || controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* TOP OVERLAY BAR: Matches screenshot (Right circular avatar + Title & Subtitle, masking YouTube top bar/share button) */}
      <div
        dir="ltr"
        className={`absolute top-0 inset-x-0 z-20 p-3.5 sm:p-5 flex items-center justify-end gap-3 sm:gap-4 transition-opacity duration-300 ${
          !isPlaying || controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-right min-w-0 flex-1">
          <h4 className="text-sm sm:text-xl md:text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] truncate">
            {title}
          </h4>
          {resolvedSubtitle && (
            <p className="text-xs sm:text-sm font-bold text-slate-200/95 drop-shadow-[0_2px_5px_rgba(0,0,0,0.95)] truncate mt-0.5">
              {resolvedSubtitle}
            </p>
          )}
        </div>

        {/* Circular Presenter / Brand Avatar on Top-Right */}
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-400/50 bg-slate-900 shadow-xl shrink-0 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={resolvedSubtitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm sm:text-lg">
              {settings.logoMain || 'M'}
            </div>
          )}
        </div>
      </div>

      {/* CENTER 3-BUTTON TRANSPORT CONTROLS: Matches screenshot (|◁ on left, large ▷ in center, ▷| on right) */}
      <div
        dir="ltr"
        className={`absolute inset-0 z-20 flex items-center justify-center gap-6 sm:gap-10 transition-opacity duration-300 ${
          !isPlaying || controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left Button: Skip Backward (-10s) |◁ */}
        <button
          type="button"
          data-testid="video-skip-back-btn"
          aria-label="إرجاع 10 ثوانٍ"
          onClick={(e) => handleSeek(-10, e)}
          className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-neutral-700/65 hover:bg-neutral-600/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <SkipBack className="w-5 h-5 sm:w-7 sm:h-7 fill-white text-white" />
        </button>

        {/* Center Button: Large Play / Pause ▷ */}
        <button
          type="button"
          data-testid="video-play-toggle-btn"
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الفيديو'}
          onClick={handleTogglePlay}
          className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-neutral-700/65 hover:bg-neutral-600/85 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 sm:w-11 sm:h-11 fill-white text-white" />
          ) : (
            <Play className="w-8 h-8 sm:w-11 sm:h-11 fill-white text-white ml-1" />
          )}
        </button>

        {/* Right Button: Skip Forward (+10s) ▷| */}
        <button
          type="button"
          data-testid="video-skip-forward-btn"
          aria-label="تقديم 10 ثوانٍ"
          onClick={(e) => handleSeek(10, e)}
          className="w-12 h-12 sm:w-15 sm:h-15 rounded-full bg-neutral-700/65 hover:bg-neutral-600/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <SkipForward className="w-5 h-5 sm:w-7 sm:h-7 fill-white text-white" />
        </button>
      </div>

      {/* BOTTOM BAR: Masks YouTube watermark & provides Mute / Cinema Fullscreen controls */}
      <div
        dir="ltr"
        className={`absolute bottom-0 inset-x-0 z-20 px-4 py-3 flex items-center justify-between transition-opacity duration-300 ${
          !isPlaying || controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-900/75 hover:bg-slate-800 border border-white/15 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>

          <button
            type="button"
            aria-label="تكبير العرض"
            onClick={handleFullscreen}
            className="p-2 rounded-xl bg-slate-900/75 hover:bg-slate-800 border border-white/15 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-slate-200" />
          </button>
        </div>

        {/* Right side protected badge */}
        <div className="px-3 py-1 rounded-xl bg-slate-900/80 border border-white/15 backdrop-blur-md text-[11px] font-bold text-slate-200">
          {badgeLabel || 'فيديو'}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showSectionFrame ? (
        <div className="w-full rounded-3xl bg-gradient-to-b from-[#1a0d2e]/95 via-[#0e1324] to-[#0a0f1d] border border-slate-800/80 overflow-hidden shadow-2xl">
          {/* Top Navigation / Header Bar matching screenshot */}
          <div
            dir="rtl"
            className="px-4 sm:px-6 py-3.5 bg-[#121829] border-b border-slate-800/90 flex items-center justify-between gap-4"
          >
            {onCloseModal ? (
              <button
                type="button"
                onClick={onCloseModal}
                className="px-5 py-2.5 rounded-2xl bg-[#1e2638] hover:bg-slate-800 border border-slate-600/60 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{backButtonLabel || 'رجوع للمنصة'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCinemaModalOpen(true)}
                className="px-4 sm:px-5 py-2 rounded-2xl bg-[#1e2638] hover:bg-slate-800 border border-slate-600/60 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow"
              >
                <ArrowRight className="w-4 h-4" />
                <span>{backButtonLabel || 'عرض الفيديو بالوضع الكامل'}</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-white font-black text-base sm:text-xl">
              <span>{badgeLabel || 'فيديو'}</span>
              <span>🎬</span>
            </div>
          </div>

          {/* Main Video Section Body with Right-Aligned "فيديو" Heading */}
          <div className="p-4 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-right w-full">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {badgeLabel || 'فيديو'}
                </h3>
              </div>
            </div>

            {renderPlayerCore()}
          </div>

          {/* Bottom Attached Content / Note Bar (Matches screenshot bottom bar) */}
          {footerNote !== undefined && footerNote !== '' && (
            <div className="px-6 py-5 bg-[#121829]/90 border-t border-slate-800/80 text-right">
              <p className="text-xs sm:text-base font-medium text-slate-400">{footerNote}</p>
            </div>
          )}
        </div>
      ) : (
        renderPlayerCore()
      )}

      {/* Cinema / Course Full-View Modal */}
      {cinemaModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#080b14]/95 backdrop-blur-xl flex flex-col overflow-y-auto">
          <div
            dir="rtl"
            className="px-4 sm:px-8 py-4 bg-[#121829] border-b border-slate-800 flex items-center justify-between shrink-0"
          >
            <button
              type="button"
              onClick={() => setCinemaModalOpen(false)}
              className="px-5 py-2.5 rounded-2xl bg-[#1e2638] hover:bg-slate-800 border border-slate-600/60 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>{backButtonLabel || 'رجوع للمنصة'}</span>
            </button>

            <div className="flex items-center gap-2 text-white font-black text-lg sm:text-xl">
              <span>🎬</span>
              <span>{badgeLabel || 'فيديو'}</span>
            </div>
          </div>

          <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center space-y-5">
            <h3 className="text-2xl font-black text-white text-right">{badgeLabel || 'فيديو'}</h3>
            {renderPlayerCore()}
          </div>

          <div className="px-6 py-5 bg-[#121829] border-t border-slate-800 text-right max-w-5xl w-full mx-auto rounded-t-2xl">
            <p className="text-sm text-slate-400">
              {footerNote || title}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
