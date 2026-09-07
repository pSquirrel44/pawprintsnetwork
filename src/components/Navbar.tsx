import React, { useState } from 'react';
import { Cat, Dog, Volume2, VolumeX, Search, Bell, Sparkles, ChevronDown, PlusSquare, MessageSquare, ShieldCheck, ShoppingBag, UserCheck, Plus, Repeat } from 'lucide-react';
import { CatProfile } from '../types';
import { getAudioMuted, setAudioMuted, playMeowSound, playWoofSound } from '../utils/audio';

interface NavbarProps {
  activeProfile: CatProfile;
  profiles: CatProfile[];
  speciesMode: 'cat' | 'dog';
  onToggleSpeciesMode: () => void;
  onSelectProfile: (profile: CatProfile) => void;
  onOpenCreateModal: () => void;
  onOpenCreateProfileModal: () => void;
  onOpenTranslatorModal: () => void;
  onOpenAnalyzerModal: () => void;
  onOpenAffiliateModal: () => void;
  onOpenSocialAuthModal: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfile,
  profiles,
  speciesMode,
  onToggleSpeciesMode,
  onSelectProfile,
  onOpenCreateModal,
  onOpenCreateProfileModal,
  onOpenTranslatorModal,
  onOpenAnalyzerModal,
  onOpenAffiliateModal,
  onOpenSocialAuthModal,
  onOpenNotifications,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  const [isMuted, setIsMuted] = useState(getAudioMuted());
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setAudioMuted(nextMuted);
    if (!nextMuted) {
      if (speciesMode === 'cat') isDog ? playWoofSound(1.2) : playMeowSound(1.2);
      else playWoofSound(1.2);
    }
  };

  const isDog = speciesMode === 'dog';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Sister Platform Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" onClick={() => onTabChange('feed')}>
            <img
              src={isDog ? '/icons/instawoof-icon.png' : '/icons/instameow-icon.png'}
              alt={isDog ? 'instawoof' : 'instameow'}
              className="w-10 h-10 rounded-2xl shadow-md hover:scale-105 transition-transform object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold brand-text tracking-tight">
                {isDog ? 'instawoof' : 'instameow'}
              </h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium -mt-1">
                {isDog ? 'The Dog Park • Woof-sonal Social' : 'The Catwalk • Purr-sonal Social'}
              </p>
            </div>
          </div>

          {/* Sister Platform Switcher Button */}
          <button
            onClick={() => {
              if (speciesMode === 'cat') playWoofSound(1.3);
              else isDog ? playWoofSound(1.3) : playMeowSound(1.3);
              onToggleSpeciesMode();
            }}
            title={isDog ? 'Switch to The Catwalk (Cats)' : 'Switch to The Dog Park (Dogs)'}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full transition-all border shadow-2xs hover:scale-105 ${
              isDog 
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700' 
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
            }`}
          >
            <Repeat className="w-3 h-3 animate-spin-slow" />
            <span>{isDog ? '🐶 The Dog Park' : '🐱 The Catwalk'}</span>
            <span className="text-[10px] font-normal opacity-80 underline">Switch</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-sm mx-1 sm:mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={isDog ? 'Search dogs, #zoomies, or stick parks...' : 'Search cats, #hashtags, or napping spots...'}
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeTab !== 'explore' && e.target.value.trim().length > 0) {
                  onTabChange('explore');
                }
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-800/80 border border-transparent brand-focus rounded-full outline-none transition-all text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Affiliate Market Quick Button */}
          <button
            onClick={() => {
              isDog ? playWoofSound(1.1) : playMeowSound(1.1);
              onOpenAffiliateModal();
            }}
            title="Affiliate Deals & Store"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-full transition-colors border border-emerald-200 dark:border-emerald-800/50 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xl:inline">Affiliate Deals</span>
          </button>

          {/* Social Auth Login Quick Button */}
          <button
            onClick={() => {
              isDog ? playWoofSound(1.0) : playMeowSound(1.0);
              onOpenSocialAuthModal();
            }}
            title="Social Media Login"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-full transition-colors border border-amber-200 dark:border-amber-800/50 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden xl:inline">Social Login</span>
          </button>

          {/* AI Translator Quick Button */}
          <button
            onClick={() => {
              if (isDog) playWoofSound(1.1);
              else isDog ? playWoofSound(1.1) : playMeowSound(1.1);
              onOpenTranslatorModal();
            }}
            title={isDog ? 'AI Woof & Bark Translator' : 'AI Meow Translator'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-full transition-colors border border-purple-200 dark:border-purple-800/50 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
            <span className="hidden md:inline">{isDog ? 'Bark Translator' : 'Meow Translator'}</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Cat SFX' : 'Mute Cat SFX'}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-zinc-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-amber-500 animate-pulse" />
            )}
          </button>

          {/* Create Post Button */}
          <button
            onClick={() => {
              isDog ? playWoofSound(1.3) : playMeowSound(1.3);
              onOpenCreateModal();
            }}
            className="p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title={isDog ? 'Create Bark Post' : 'Create Purr Post'}
          >
            <PlusSquare className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile Switcher Dropdown */}
          <div className="relative ml-0.5">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-1 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700"
            >
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[var(--brand-ring)]/30"
              />
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-70 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <p className="text-xs text-zinc-400 font-medium">Switch Active Cat Account</p>
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenCreateProfileModal();
                    }}
                    className="text-[11px] font-bold brand-tag hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Profile</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        onSelectProfile(profile);
                        setShowProfileDropdown(false);
                        isDog ? playWoofSound(1.2) : playMeowSound(1.2);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${
                        profile.id === activeProfile.id ? 'brand-muted-bg opacity-50' : ''
                      }`}
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {profile.name}
                          </span>
                          {profile.isVerified && (
                            <ShieldCheck className="w-3 h-3 brand-color shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">
                          @{profile.handle} {profile.age ? `• ${profile.age}` : ''}
                        </p>
                      </div>
                      {profile.id === activeProfile.id && (
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Add Cat Profile Option */}
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenCreateProfileModal();
                    }}
                    className="w-full py-2 brand-muted-bg brand-muted-text hover:opacity-80 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isDog ? 'Add Another Dog Profile' : 'Add Another Cat Profile'}</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
