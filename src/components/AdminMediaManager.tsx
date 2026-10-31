import React, { useState, useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Upload,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  SiteMediaItem,
  MediaPlacementLocation,
  MEDIA_PLACEMENT_OPTIONS,
  getSiteMediaItems,
  addSiteMediaItem,
  toggleSiteMediaItem,
  deleteSiteMediaItem,
  updateSiteMediaItem,
  SITE_MEDIA_UPDATED_EVENT,
} from '../services/siteMedia';
import { ProtectedVideoPlayer } from './ProtectedVideoPlayer';

export const AdminMediaManager: React.FC = () => {
  const [items, setItems] = useState<SiteMediaItem[]>(getSiteMediaItems);
  const [showAddForm, setShowAddForm] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Form states
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'direct' | 'upload'>('youtube');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('فيديو');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [footerNote, setFooterNote] = useState('لا يوجد اختبار مرفق بهذا المحتوى');
  const [selectedPlacements, setSelectedPlacements] = useState<MediaPlacementLocation[]>([
    'hero-top',
    'payment-methods',
  ]);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(getSiteMediaItems());
    window.addEventListener(SITE_MEDIA_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(SITE_MEDIA_UPDATED_EVENT, refresh);
  }, []);

  const showNoticeMsg = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onResult: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onResult(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePlacementSelection = (loc: MediaPlacementLocation) => {
    setSelectedPlacements((prev) =>
      prev.includes(loc) ? prev.filter((p) => p !== loc) : [...prev, loc]
    );
  };

  const selectAllPlacements = () => {
    if (selectedPlacements.length === MEDIA_PLACEMENT_OPTIONS.length) {
      setSelectedPlacements(['hero-top']);
    } else {
      setSelectedPlacements(MEDIA_PLACEMENT_OPTIONS.map((o) => o.id));
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      showNoticeMsg('يرجى إدخال رابط الفيديو/الصورة أو رفع ملف من جهازك أولاً.');
      return;
    }
    if (selectedPlacements.length === 0) {
      showNoticeMsg('يرجى تحديد مكان واحد على الأقل لنشر الوسائط في الموقع.');
      return;
    }

    const created = addSiteMediaItem({
      mediaType,
      videoSourceType: mediaType === 'video' ? videoSourceType : undefined,
      url: url.trim(),
      title:
        title.trim() ||
        (mediaType === 'video' ? 'كورس أساسيات البرمجة | المحاضر' : 'صورة توضيحية من المنصة'),
      subtitle: subtitle.trim() || 'إم ويب لتطوير البرمجيات',
      badgeLabel: badgeLabel.trim() || (mediaType === 'video' ? 'فيديو' : 'صورة'),
      avatarUrl: avatarUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      footerNote: footerNote.trim(),
      placements: selectedPlacements,
    });

    setItems(getSiteMediaItems());
    setPreviewItemId(created.id);
    setUrl('');
    setTitle('');
    setThumbnailUrl('');
    showNoticeMsg(
      mediaType === 'video'
        ? 'تم نشر الفيديو بنجاح مع تفعيل حماية وإخفاء روابط مشاركة يوتيوب!'
        : 'تم نشر الصورة بنجاح في الأقسام المحددة!'
    );
  };

  const handleToggleItemPlacement = (item: SiteMediaItem, loc: MediaPlacementLocation) => {
    const exists = item.placements.includes(loc);
    const nextPlacements = exists
      ? item.placements.filter((p) => p !== loc)
      : [...item.placements, loc];
    if (nextPlacements.length === 0) return;
    updateSiteMediaItem(item.id, { placements: nextPlacements });
    setItems(getSiteMediaItems());
    showNoticeMsg('تم تحديث أماكن ظهور الوسائط بنجاح');
  };

  return (
    <div className="space-y-6" data-testid="admin-media-manager">
      {notice && (
        <div
          data-testid="admin-media-notice"
          className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-950 to-cyan-950/60 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm sm:text-base font-black text-white">
              نشر الصور والفيديوهات في جميع أقسام الموقع (مع إخفاء روابط مشاركة يوتيوب)
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            حدد القسم الذي تريد النشر فيه (أول الرئيسية، قسم الدفع، المعاينة، الخدمات، أو جميع الأقسام معاً) مع مشغل الفيديو المحمي المطابق للتصميم المطلوب.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إخفاء نموذج الإضافة' : 'إضافة فيديو أو صورة جديدة'}</span>
        </button>
      </div>

      {/* Add Media Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddMedia}
          className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>إعداد ونشر فيديو أو صورة في أقسام الموقع:</span>
            </span>

            {/* Media Type Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                data-testid="select-media-type-video"
                onClick={() => {
                  setMediaType('video');
                  setBadgeLabel('فيديو');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>نشر فيديو محمي</span>
              </button>

              <button
                type="button"
                data-testid="select-media-type-image"
                onClick={() => {
                  setMediaType('image');
                  setBadgeLabel('صورة');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mediaType === 'image'
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>نشر صورة</span>
              </button>
            </div>
          </div>

          {/* 1. Target Placement Locations Selector */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>1. حدد أماكن النشر في الموقع (يمكنك اختيار مكان واحد أو عدة أماكن معاً):</span>
              </label>

              <button
                type="button"
                data-testid="select-all-placements-btn"
                onClick={selectAllPlacements}
                className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold cursor-pointer"
              >
                {selectedPlacements.length === MEDIA_PLACEMENT_OPTIONS.length
                  ? 'إلغاء تحديد الكل'
                  : 'تحديد جميع الأماكن والأقسام'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MEDIA_PLACEMENT_OPTIONS.map((opt) => {
                const isSelected = selectedPlacements.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`placement-option-${opt.id}`}
                    onClick={() => togglePlacementSelection(opt.id)}
                    className={`p-2.5 rounded-xl border text-right text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{opt.labelAr}</span>
                    <span
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-cyan-400 border-cyan-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Source URL or File Upload */}
          {mediaType === 'video' ? (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>2. مصدر الفيديو (يتم إخفاء روابط مشاركة يوتيوب تلقائياً):</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('youtube')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      videoSourceType === 'youtube'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    رابط يوتيوب (محمي)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('direct')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      videoSourceType === 'direct'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    رابط مباشر MP4
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('upload')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      videoSourceType === 'upload'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    رفع من الجهاز
                  </button>
                </div>
              </div>

              {videoSourceType === 'upload' ? (
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-950 border border-dashed border-cyan-500/50 hover:bg-slate-900 text-cyan-300 text-xs font-bold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>اختر ملف فيديو من جهازك (MP4 / WebM)</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (base64) => setUrl(base64))}
                  />
                </label>
              ) : (
                <input
                  type="text"
                  data-testid="media-url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  dir="ltr"
                  placeholder={
                    videoSourceType === 'youtube'
                      ? 'https://www.youtube.com/watch?v=... أو https://youtu.be/...'
                      : 'https://example.com/video.mp4'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رابط الصورة المباشر (URL):
                </label>
                <input
                  type="text"
                  data-testid="media-url-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  أو رفع صورة من جهازك:
                </label>
                <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-dashed border-cyan-500/50 hover:bg-slate-900 text-cyan-300 text-xs font-bold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>اختر صورة من الهاتف أو الكمبيوتر</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (base64) => setUrl(base64))}
                  />
                </label>
              </div>
            </div>
          )}

          {/* 3. Title, Subtitle (Instructor/Brand), Badge & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عنوان الفيديو / الصورة (يظهر أعلى المشغل)
              </label>
              <input
                type="text"
                data-testid="media-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: كورس أساسيات البرمجة | المحاضر"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الاسم الفرعي / المحاضر / القسم
              </label>
              <input
                type="text"
                data-testid="media-subtitle-input"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="مثال: مهندس عبدالرحمن عيد"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عنوان البطاقة (يمين أعلى الإطار)
              </label>
              <input
                type="text"
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                placeholder="فيديو"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الصورة الدائرية بأعلى يمين الفيديو (اختياري)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="رابط الصورة الدائرية أو ارفعها..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
                <label className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (base64) => setAvatarUrl(base64))}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                صورة غلاف مخصصة للفيديو (اختياري)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="يُجلب تلقائياً من يوتيوب..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
                <label className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, (base64) => setThumbnailUrl(base64))}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                نص الشريط السفلي (أسفل المشغل)
              </label>
              <input
                type="text"
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                placeholder="لا يوجد اختبار مرفق بهذا المحتوى"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="publish-site-media-btn"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              نشر {mediaType === 'video' ? 'الفيديو المحمي' : 'الصورة'} في الأقسام المحددة ({selectedPlacements.length} قسم)
            </span>
          </button>
        </form>
      )}

      {/* Published Media List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs sm:text-sm font-black text-white">
            الوسائط المنشورة حالياً في أقسام الموقع ({items.length}):
          </h5>
        </div>

        {items.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
            <Video className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              لم تقم بنشر فيديوهات أو صور مخصصة في الأقسام بعد. استخدم النموذج أعلاه للنشر الفوري.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                      {item.mediaType === 'video' ? (
                        <Video className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h6 className="text-sm font-black text-white">{item.title}</h6>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.enabled
                              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {item.enabled ? 'ظاهر في الموقع' : 'مخفي مؤقتاً'}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewItemId(previewItemId === item.id ? null : item.id)
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      {previewItemId === item.id ? 'إغلاق المعاينة' : 'معاينة الشكل'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const next = toggleSiteMediaItem(item.id);
                        setItems(getSiteMediaItems());
                        showNoticeMsg(next ? 'تم إظهار الوسائط في الموقع' : 'تم إخفاء الوسائط');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                        item.enabled
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-700/50'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                      }`}
                    >
                      {item.enabled ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>إخفاء</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>إظهار</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        deleteSiteMediaItem(item.id);
                        setItems(getSiteMediaItems());
                        showNoticeMsg('تم حذف العنصر بنجاح');
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Placement Pills (Click to toggle any section on the fly) */}
                <div className="pt-3 border-t border-slate-900">
                  <span className="block text-[11px] font-bold text-slate-400 mb-2">
                    الأقسام المعروض فيها حالياً (اضغط على أي قسم لتفعيله أو إلغائه):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {MEDIA_PLACEMENT_OPTIONS.map((opt) => {
                      const active = item.placements.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleToggleItemPlacement(item, opt.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                            active
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {opt.badgeAr}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview inside Admin */}
                {previewItemId === item.id && (
                  <div className="pt-3 border-t border-slate-800">
                    {item.mediaType === 'video' ? (
                      <ProtectedVideoPlayer
                        url={item.url}
                        title={item.title}
                        subtitle={item.subtitle}
                        badgeLabel={item.badgeLabel || 'فيديو'}
                        avatarUrl={item.avatarUrl}
                        thumbnailUrl={item.thumbnailUrl}
                        footerNote={item.footerNote}
                        showSectionFrame={true}
                      />
                    ) : (
                      <div className="rounded-2xl overflow-hidden border border-slate-800 max-w-xl mx-auto">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
