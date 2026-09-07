import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Send, Heart } from 'lucide-react';
import { Story } from '../types';
import { playMeowSound, playTreatSound, playPurrSound, playWoofSound } from '../utils/audio';

interface StoryViewerModalProps {
  isDog?: boolean;
  story: Story | null;
  onClose: () => void;
  onNextStory?: () => void;
  onPrevStory?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isDog = false,
  story,
  onClose,
  onNextStory,
  onPrevStory,
}) => {
  if (!story) return null;

  const playSound = isDog ? playWoofSound : playMeowSound;

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);

  useEffect(() => {
    setProgress(0);
  }, [story]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onNextStory) onNextStory();
          else onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused, story, onNextStory, onClose]);

  const handleSendReaction = (emoji: string) => {
    playTreatSound();
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.floor(Math.random() * 60) + 20, // 20% to 80%
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 1500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    playSound(1.3);
    handleSendReaction('🐾');
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="relative w-full max-w-sm sm:max-w-md h-full sm:h-[90vh] sm:rounded-3xl bg-zinc-900 overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Top Progress Bar & Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Progress Indicator */}
          <div className="w-full h-1 bg-white/30 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={story.authorAvatar}
                alt={story.authorName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500"
              />
              <div>
                <p className="text-xs font-bold leading-tight">{story.authorName}</p>
                <p className="text-[10px] text-zinc-300">@{story.authorHandle} • {story.timestamp}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Media */}
        <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src={story.mediaUrl}
            alt={story.caption}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Touch Area Navigation */}
          <div className="absolute inset-0 flex z-10">
            <div
              className="w-1/3 h-full cursor-pointer"
              onClick={() => {
                playSound(0.9);
                if (onPrevStory) onPrevStory();
              }}
            />
            <div
              className="w-2/3 h-full cursor-pointer"
              onClick={() => {
                playSound(1.1);
                if (onNextStory) onNextStory();
              }}
            />
          </div>

          {/* Floating Emoji Particles */}
          {floatingEmojis.map((item) => (
            <div
              key={item.id}
              className="absolute bottom-20 text-3xl animate-bounce z-20 pointer-events-none transition-all duration-1000"
              style={{ left: `${item.x}%`, transform: 'translateY(-100px)' }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Caption Overlay */}
          <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
            <p className="text-sm font-medium text-white drop-shadow-md">
              {story.caption}
            </p>
          </div>
        </div>

        {/* Reaction Bar & Quick Reply */}
        <div className="p-4 bg-black/80 z-20 space-y-3">
          {/* Reaction Emoji Buttons */}
          <div className="flex items-center justify-around gap-2 text-2xl">
            {['🐾', '🐟', '💖', '🧶', '📦'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="hover:scale-125 active:scale-95 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Quick Reply Input */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={isDog ? 'Send woof reply...' : 'Send meow reply...'}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs rounded-full px-4 py-2 outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
