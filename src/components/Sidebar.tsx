import React from 'react';
import { Home, Compass, PlusSquare, Bookmark, User, MessageSquare, Sparkles, Cat, ShoppingBag, UserCheck, Plus, Camera, Volume2 } from 'lucide-react';
import { CatProfile } from '../types';
import { playMeowSound, playWoofSound } from '../utils/audio';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeProfile: CatProfile;
  speciesMode?: 'cat' | 'dog';
  onOpenCreateModal: () => void;
  onOpenCreateProfileModal: () => void;
  onOpenTranslatorModal: () => void;
  onOpenAnalyzerModal: () => void;
  onOpenAffiliateModal: () => void;
  onOpenSocialAuthModal: () => void;
  onOpenSoundboard: () => void;
  onOpenCamera: () => void;
  isDog?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeProfile,
  speciesMode = 'cat',
  onOpenCreateModal,
  onOpenCreateProfileModal,
  onOpenTranslatorModal,
  onOpenAnalyzerModal,
  onOpenAffiliateModal,
  onOpenSocialAuthModal,
  onOpenSoundboard,
  onOpenCamera,
  isDog = false,
}) => {
  const playSound = isDog ? playWoofSound : playMeowSound;
  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'saved', label: isDog ? 'Saved Bones' : 'Saved Treats', icon: Bookmark },
    { id: 'profile', label: isDog ? 'Bark Profile' : 'Purr Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-[88px] bottom-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 justify-between z-30 overflow-y-auto">
      <div className="space-y-5">
        
        {/* Main Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playSound(1.0);
                  onTabChange(item.id);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'brand-sidebar-active border brand-muted-border shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'brand-color' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                playSound(1.2);
                onOpenCreateModal();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl ${
                isDog 
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-sky-600'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600'
              } text-white font-bold text-xs shadow-md hover:opacity-95 transition-all`}
            >
              <PlusSquare className="w-4 h-4" />
              <span>{isDog ? 'New Bark Post' : 'New Purr Post'}</span>
            </button>

            <button
              onClick={() => {
                playSound(1.1);
                onOpenCreateProfileModal();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>{isDog ? 'Submit Dog Profile' : 'Submit Cat Profile'}</span>
            </button>
          </div>
        </nav>

        {/* Monetization & Social Integration Modules */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <p className="px-2 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            Monetization & Auth
          </p>

          <button
            onClick={() => {
              playSound(1.1);
              onOpenAffiliateModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-bold truncate">Affiliate Deals & Store</div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
                {isDog ? 'BarkBox, Amazon, KONG' : 'Amazon, Chewy, Litter-Robot'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playSound(1.0);
              onOpenSocialAuthModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/50 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-bold truncate">Social Media Login</div>
              <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 truncate">Amazon, Google, IG, TikTok</div>
            </div>
          </button>
        </div>

        {/* AI Features Section */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <p className="px-2 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            {isDog ? 'Gemini AI Dog Tools' : 'Gemini AI Cat Tools'}
          </p>

          <button
            onClick={() => {
              playSound(1.1);
              onOpenTranslatorModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/40 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-bold truncate">{isDog ? 'Bark Translator' : 'Meow Translator'}</div>
              <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70 truncate">
                {isDog ? 'Human ⇄ Dog Speak' : 'Human ⇄ Cat Speak'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playSound(1.0);
              onOpenAnalyzerModal();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/40 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-bold truncate">{isDog ? 'Good Boy Meter' : 'AI Judgement Meter'}</div>
              <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70 truncate">
                {isDog ? 'Rate Zoomies & Goodness' : 'Rate Loaf & Judgement'}
              </div>
            </div>
          </button>
        </div>

        {/* Media Tools Section */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          <p className="px-2 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
            Media Tools
          </p>

          <button
            onClick={() => {
              playSound(1.1);
              onOpenCamera();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/40 transition-colors"
          >
            <Camera className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-bold truncate">Live Filter Camera</div>
              <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 truncate">
                {isDog ? 'Snap a photo with Dog Park filters' : 'Snap a photo with Catwalk filters'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              playSound(1.0);
              onOpenSoundboard();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100/80 dark:hover:bg-sky-900/50 border border-sky-200/60 dark:border-sky-800/40 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="text-left min-w-0">
              <div className="font-bold truncate">{isDog ? 'Bark Sound Library' : 'Meow Sound Library'}</div>
              <div className="text-[10px] text-sky-600/70 dark:text-sky-400/70 truncate">
                Play real {isDog ? 'dog' : 'cat'} vocalizations
              </div>
            </div>
          </button>
        </div>

      </div>

      {/* Profile Card Footer */}
      <div
        onClick={() => {
          playSound(1.0);
          onTabChange('profile');
        }}
        className="flex items-center gap-3 p-3 mt-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <img
          src={activeProfile.avatar}
          alt={activeProfile.name}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/30"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {activeProfile.name}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            @{activeProfile.handle}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
          <span>{isDog ? '🍖' : '🐟'}</span>
          <span>{activeProfile.treatsReceived > 999 ? `${(activeProfile.treatsReceived / 1000).toFixed(1)}k` : activeProfile.treatsReceived}</span>
        </div>
      </div>

    </aside>
  );
};
