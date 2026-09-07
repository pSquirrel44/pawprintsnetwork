import React from 'react';
import { Home, Compass, PlusSquare, Bookmark, User, MessageSquare } from 'lucide-react';
import { playMeowSound, playWoofSound } from '../utils/audio';

interface BottomNavProps {
  isDog?: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateModal: () => void;
  onOpenTranslatorModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  isDog = false,
  activeTab,
  onTabChange,
  onOpenCreateModal,
  onOpenTranslatorModal,
}) => {
  const playSound = isDog ? playWoofSound : playMeowSound;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 py-2 px-4 flex items-center justify-around">
      <button
        onClick={() => {
          playSound(1.0);
          onTabChange('feed');
        }}
        className={`flex flex-col items-center gap-1 text-xs font-medium ${
          activeTab === 'feed' ? 'brand-color font-bold' : 'text-zinc-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Feed</span>
      </button>

      <button
        onClick={() => {
          playSound(1.0);
          onTabChange('explore');
        }}
        className={`flex flex-col items-center gap-1 text-xs font-medium ${
          activeTab === 'explore' ? 'brand-color font-bold' : 'text-zinc-500'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span>Explore</span>
      </button>

      <button
        onClick={() => {
          playSound(1.3);
          onOpenCreateModal();
        }}
        className="w-10 h-10 -mt-4 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-transform"
      >
        <PlusSquare className="w-5 h-5" />
      </button>

      <button
        onClick={() => {
          playSound(1.1);
          onOpenTranslatorModal();
        }}
        className="flex flex-col items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400"
      >
        <MessageSquare className="w-5 h-5" />
        <span>Translate</span>
      </button>

      <button
        onClick={() => {
          playSound(1.0);
          onTabChange('profile');
        }}
        className={`flex flex-col items-center gap-1 text-xs font-medium ${
          activeTab === 'profile' ? 'brand-color font-bold' : 'text-zinc-500'
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </button>
    </div>
  );
};
