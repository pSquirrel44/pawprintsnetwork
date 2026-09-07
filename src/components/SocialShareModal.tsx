import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { Post } from '../types';
import { playMeowSound, playTreatSound, playWoofSound } from '../utils/audio';

interface SocialShareModalProps {
  isDog?: boolean;
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isDog = false,
  post,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !post) return null;

  const playSound = isDog ? playWoofSound : playMeowSound;

  const [copiedLink, setCopiedLink] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const shareText = isDog
    ? `Check out this dog post by @${post.authorHandle}: "${post.caption}" 🦴 #TheDogPark #PawprintNetwork #GoodBoy`
    : `Check out this cat post by @${post.authorHandle}: "${post.caption}" 🐾 #TheCatwalk #PawprintNetwork #CatLoaf`;
  const shareUrl = `${window.location.origin}/#post-${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(`${shareText} ${shareUrl}`);
    setCopiedLink(true);
    playTreatSound();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSocialShare = (platform: string, targetUrl: string) => {
    playSound(1.2);
    setShareToast(`Opening ${platform} share window for @${post.authorHandle}'s post...`);
    window.open(targetUrl, '_blank');
    setTimeout(() => setShareToast(null), 3000);
  };

  const shareLinks = [
    {
      name: 'Instagram Stories',
      icon: '📸',
      color: 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white',
      url: `https://www.instagram.com/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'X (Twitter)',
      icon: '🐦',
      color: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Facebook',
      icon: '🔵',
      color: 'bg-blue-600 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-emerald-600 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'TikTok',
      icon: '🎵',
      color: 'bg-black text-white dark:bg-zinc-800',
      url: `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Pinterest',
      icon: '📌',
      color: 'bg-rose-600 text-white',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(post.imageUrl)}&description=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-rose-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h2 className="text-base font-bold">{isDog ? 'Share Dog Post to Socials' : 'Share Cat Post to Socials'}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Post Snippet Preview */}
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <img
              src={post.imageUrl}
              alt={post.caption}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">@{post.authorHandle}</p>
              <p className="text-zinc-500 dark:text-zinc-400 line-clamp-2 italic text-[11px]">"{post.caption}"</p>
            </div>
          </div>

          {shareToast && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300 text-center animate-in fade-in duration-150">
              {shareToast}
            </div>
          )}

          {/* Share Buttons Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {shareLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleSocialShare(link.name, link.url)}
                className={`py-3 px-3 rounded-2xl font-bold text-xs shadow-xs border border-transparent flex items-center justify-center gap-2 transition-transform hover:scale-102 ${link.color}`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="truncate">{link.name}</span>
              </button>
            ))}
          </div>

          {/* {isDog ? 'Copy Direct Bark Link' : 'Copy Direct Meow Link'} */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              {isDog ? 'Copy Direct Bark Link' : 'Copy Direct Meow Link'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 outline-none select-all font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
