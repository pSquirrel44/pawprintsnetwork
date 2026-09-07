import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, MapPin, Send, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { Post, Comment } from '../types';
import { playMeowSound, playTreatSound, playPurrSound, playWoofSound } from '../utils/audio';

interface PostCardProps {
  post: Post;
  activeHandle: string;
  isDog?: boolean;
  onTreatPost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onSelectTag: (tag: string) => void;
  onOpenShareModal: (post: Post) => void;
  onOpenLightbox?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  activeHandle,
  isDog = false,
  onTreatPost,
  onSavePost,
  onAddComment,
  onSelectTag,
  onOpenShareModal,
  onOpenLightbox,
}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Species-specific copy
  const treatEmoji        = isDog ? '🦴' : '🐟';
  const treatLabel        = isDog ? 'Bone' : 'Fish Treat';
  const treatsLabel       = isDog ? 'Bones Collected' : 'Fish Treats Collected';
  const commentWord       = isDog ? 'Woofs' : 'Meows';
  const commentPlaceholder = isDog ? 'Add a woof comment...' : 'Add a meow comment...';
  const noCommentsText    = isDog ? 'No woofs yet. Be the first dog to comment!' : 'No meows yet. Be the first cat to comment!';
  const translateLabel    = isDog ? '🤖 Translate Bark to Human' : '🤖 Translate Meow to Human';
  const doubleTapAnim     = isDog ? '🦴' : '🐟';
  const playSound         = isDog ? playWoofSound : playMeowSound;

  const handleDoubleTapImage = () => {
    playTreatSound();
    setShowHeartAnim(true);
    if (!post.isTreating) onTreatPost(post.id);
    setTimeout(() => setShowHeartAnim(false), 900);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    playSound(1.2);
    onAddComment(post.id, newCommentText);
    setNewCommentText('');
  };

  const getFilterStyleClass = (style?: string) => {
    switch (style) {
      case 'vintage-whiskers': return 'sepia-[0.35] contrast-125 brightness-90 saturate-150';
      case 'warm-glow':        return 'sepia-[0.25] hue-rotate-[-10deg] contrast-110 saturate-125';
      case 'cyber-cool':       return 'hue-rotate-[180deg] contrast-125 saturate-150';
      case 'sepia-purr':       return 'sepia-[0.7] contrast-105';
      case 'black-white-paws': return 'grayscale contrast-150';
      default:                 return '';
    }
  };

  return (
    <article className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow mb-6">

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--brand-ring)]/20"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{post.authorName}</span>
              <ShieldCheck className="w-4 h-4 brand-verified" />
              <span className="text-xs text-zinc-400 font-normal">@{post.authorHandle}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 brand-icon" />
                {post.location}
              </span>
              <span className="text-[10px] text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-[11px] text-zinc-400">{post.timestamp}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:brand-icon bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-full">
            {post.category}
          </span>
          <button
            onClick={() => onOpenShareModal(post)}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full"
            title="Share Post"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Image */}
      <div
        className="relative w-full aspect-square bg-zinc-950 overflow-hidden cursor-pointer select-none group"
        onClick={() => onOpenLightbox?.(post)}
        onDoubleClick={handleDoubleTapImage}
      >
        <img
          src={post.imageUrl}
          alt={post.caption}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01] ${getFilterStyleClass(post.filterStyle)}`}
        />
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-in zoom-in-50 duration-200">
            <div className="bg-white/90 dark:bg-zinc-900/90 p-5 rounded-full shadow-2xl backdrop-blur-md animate-bounce">
              <span className="text-6xl">{doubleTapAnim}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions & Stats */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Treat Button */}
            <button
              onClick={() => { playTreatSound(); onTreatPost(post.id); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                post.isTreating
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-600'
              }`}
            >
              <span className="text-sm">{treatEmoji}</span>
              <span>{post.isTreating ? 'Treated!' : `Give ${treatLabel}`}</span>
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => { playSound(1.0); setShowComments(!showComments); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 brand-color" />
              <span>{post.comments.length} {commentWord}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => { playPurrSound(); onOpenShareModal(post); }}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark */}
          <button
            onClick={() => { playSound(1.1); onSavePost(post.id); }}
            className={`p-2 rounded-full transition-colors ${
              post.isSaved
                ? 'brand-color brand-muted-bg'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
            title={post.isSaved ? 'Saved' : 'Save Post'}
          >
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'brand-color' : ''}`} />
          </button>
        </div>

        {/* Treats Count */}
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
          <span className="text-amber-500">{treatEmoji}</span>
          <span>{post.treatsCount.toLocaleString()} {treatsLabel}</span>
        </div>

        {/* Caption */}
        <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-2">@{post.authorHandle}</span>
          {post.caption}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => { playSound(1.0); onSelectTag(tag); }}
                className="text-[11px] font-semibold brand-color dark:brand-icon hover:underline"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* AI Translation Toggle */}
        {post.humanTranslation && (
          <div className="pt-2">
            <button
              onClick={() => { playSound(1.1); setShowTranslation(!showTranslation); }}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{showTranslation ? 'Hide AI Translation' : translateLabel}</span>
            </button>
            {showTranslation && (
              <div className="mt-2 p-3 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-200 font-medium italic animate-in fade-in duration-150">
                {post.humanTranslation}
              </div>
            )}
          </div>
        )}

        {/* Comments Drawer */}
        {showComments && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {commentWord} ({post.comments.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
              {post.comments.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">{noCommentsText}</p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-2xl">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">@{comment.authorHandle}</span>
                        <span className="text-[10px] text-zinc-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={commentPlaceholder}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-xs px-3.5 py-2 rounded-full border border-transparent brand-focus outline-none text-zinc-900 dark:text-zinc-100"
              />
              <button type="submit" className="p-2 brand-send-btn text-white rounded-full transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
