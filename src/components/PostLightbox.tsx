import React, { useEffect, useCallback } from 'react';
import { X, Heart, MessageCircle, Share2, Bookmark, MapPin, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '../types';

interface PostLightboxProps {
  post: Post;
  isDog?: boolean;
  onClose: () => void;
  onTreat: () => void;
  onSave: () => void;
  onShare: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const FILTER_CLASSES: Record<string, string> = {
  'vintage-whiskers': 'sepia-[0.35] contrast-125 brightness-90 saturate-150',
  'warm-glow':        'sepia-[0.25] hue-rotate-[-10deg] contrast-110 saturate-125',
  'cyber-cool':       'hue-rotate-[180deg] contrast-125 saturate-150',
  'sepia-purr':       'sepia-[0.7] contrast-105',
  'black-white-paws': 'grayscale contrast-150',
};

export const PostLightbox: React.FC<PostLightboxProps> = ({
  post, isDog = false, onClose, onTreat, onSave, onShare,
  onPrev, onNext, hasPrev = false, hasNext = false,
}) => {
  const treatEmoji  = isDog ? '🦴' : '🐟';
  const commentWord = isDog ? 'Woofs' : 'Meows';

  // Close on Escape, arrow keys for prev/next
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft'  && hasPrev && onPrev) onPrev();
    if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const filterClass = FILTER_CLASSES[post.filterStyle ?? ''] ?? '';

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); onPrev?.(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); onNext?.(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content panel */}
      <div
        className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[95vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl mx-4 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Image side */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-0">
          <img
            src={post.imageUrl}
            alt={post.caption}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain max-h-[60vh] md:max-h-[85vh] ${filterClass}`}
          />
        </div>

        {/* Info side */}
        <div className="w-full md:w-80 flex flex-col border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto">

          {/* Author header */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--brand-ring)]/30"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{post.authorName}</span>
                <ShieldCheck className="w-3.5 h-3.5 brand-icon flex-shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{post.location}</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 flex-shrink-0">{post.timestamp}</span>
          </div>

          {/* Caption */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex-1">
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              <span className="font-bold mr-1">@{post.authorHandle}</span>
              {post.caption}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.map(tag => (
                  <span key={tag} className="text-xs brand-tag font-semibold">{tag}</span>
                ))}
              </div>
            )}
            {post.humanTranslation && (
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 italic border-t border-zinc-100 dark:border-zinc-800 pt-3">
                💬 {post.humanTranslation}
              </p>
            )}
          </div>

          {/* Comments preview */}
          {post.comments.length > 0 && (
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-2.5 max-h-48 overflow-y-auto">
              {post.comments.slice(0, 5).map(c => (
                <div key={c.id} className="flex gap-2 text-xs">
                  <img src={c.authorAvatar} alt={c.authorName} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-1">@{c.authorHandle}</span>
                    {c.text}
                  </p>
                </div>
              ))}
              {post.comments.length > 5 && (
                <p className="text-xs text-zinc-400">+{post.comments.length - 5} more {commentWord}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onTreat}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  post.isTreating
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 hover:text-amber-600'
                }`}
              >
                <span>{treatEmoji}</span>
                <span>{post.treatsCount.toLocaleString()}</span>
              </button>
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{post.comments.length} {commentWord}</span>
              </button>
            </div>
            <button
              onClick={onSave}
              className={`p-2 rounded-full transition-colors ${
                post.isSaved
                  ? 'brand-color brand-muted-bg'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
