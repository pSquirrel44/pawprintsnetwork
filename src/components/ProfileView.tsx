import React, { useState } from 'react';
import { ShieldCheck, MapPin, Award, Bookmark, Grid, Plus, ShoppingBag, UserCheck, Check, Sparkles } from 'lucide-react';
import { CatProfile, Post } from '../types';
import { playMeowSound, playTreatSound, playWoofSound } from '../utils/audio';

interface ProfileViewProps {
  isDog?: boolean;
  profile: CatProfile;
  posts: Post[];
  savedPosts: Post[];
  isCurrentActiveProfile: boolean;
  onTreatProfile: (profileId: string) => void;
  onOpenCreateModal: () => void;
  onOpenCreateProfileModal: () => void;
  onOpenAffiliateModal: () => void;
  onOpenSocialAuthModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  isDog = false,
  profile,
  posts,
  savedPosts,
  isCurrentActiveProfile,
  onTreatProfile,
  onOpenCreateModal,
  onOpenCreateProfileModal,
  onOpenAffiliateModal,
  onOpenSocialAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'badges'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const profilePosts = posts.filter((p) => p.authorId === profile.id || p.authorHandle === profile.handle);

  const playSound = isDog ? playWoofSound : playMeowSound;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Cover & Avatar Header */}
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-44 sm:h-52 w-full bg-zinc-800 relative overflow-hidden">
          <img
            src={profile.bannerUrl || 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=1200&q=80'}
            alt="Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="p-6 relative pt-0">
          
          {/* Avatar & Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl"
              />
              {profile.isVerified && (
                <div className="absolute bottom-1 right-1 brand-bg-solid text-white p-1 rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-md" title="Verified Sovereign Cat">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {!isCurrentActiveProfile ? (
                <>
                  <button
                    onClick={() => {
                      playTreatSound();
                      onTreatProfile(profile.id);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-500/20 transition-all"
                  >
                    <span>🐟</span>
                    <span>Serve Treat</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound(1.2);
                      setIsFollowing(!isFollowing);
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 font-bold text-xs rounded-2xl transition-all ${
                      isFollowing
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                        : 'brand-bg-solid hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                    }`}
                  >
                    {isFollowing ? 'Serving Master' : '+ Serve Cat'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      playSound(1.2);
                      onOpenCreateModal();
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound(1.1);
                      onOpenCreateProfileModal();
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 brand-color" />
                    <span>{isDog ? 'Submit Dog Profile' : 'Submit Cat Profile'}</span>
                  </button>

                  <button
                    onClick={() => {
                      playSound(1.1);
                      onOpenAffiliateModal();
                    }}
                    className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    title="Affiliate Deals & Monetization"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Cat Info */}
          <div className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {profile.name}
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-full border border-rose-200 dark:border-rose-800/40">
                  {profile.breed}
                </span>
                {profile.age && (
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 rounded-full border border-purple-200 dark:border-purple-800/40">
                    Age: {profile.age}
                  </span>
                )}
                {profile.socialLinked && (
                  <span
                    onClick={onOpenSocialAuthModal}
                    className="px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-full border border-amber-200 dark:border-amber-800/40 cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3 text-amber-500" />
                    <span>{profile.socialLinked} Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">@{profile.handle}</p>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            {/* Location & Box Preference Tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 brand-color" />
                {profile.location}
              </span>
              <span>•</span>
              <span>☀️ Fav Spot: {profile.favoriteSpot}</span>
              <span>•</span>
              <span>📦 Box Pref: {profile.boxPreference}</span>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div>
                <strong className="block text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {profilePosts.length}
                </strong>
                <span className="text-zinc-400">{isDog ? 'Bark Posts' : 'Purr Posts'}</span>
              </div>

              <div>
                <strong className="block text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {profile.followersCount.toLocaleString()}
                </strong>
                <span className="text-zinc-400">Humans Serving</span>
              </div>

              <div>
                <strong className="block text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {profile.followingCount}
                </strong>
                <span className="text-zinc-400">Cats Followed</span>
              </div>

              <div>
                <strong className="block text-base font-extrabold text-amber-500">
                  🐟 {profile.treatsReceived.toLocaleString()}
                </strong>
                <span className="text-zinc-400">Treats Earned</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold">
        <button
          onClick={() => {
            playSound(1.0);
            setActiveTab('posts');
          }}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-rose-500 brand-color'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({profilePosts.length})</span>
        </button>

        <button
          onClick={() => {
            playSound(1.0);
            setActiveTab('saved');
          }}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-rose-500 brand-color'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Treats ({savedPosts.length})</span>
        </button>

        <button
          onClick={() => {
            playSound(1.0);
            setActiveTab('badges');
          }}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-all ${
            activeTab === 'badges'
              ? 'border-rose-500 brand-color'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Cat Badges ({profile.badges.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {profilePosts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-400">
              <p className="text-3xl mb-2">🐾</p>
              <p className="text-xs font-bold">No posts created yet.</p>
            </div>
          ) : (
            profilePosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden group shadow-xs"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-3">
                  <span>🐟 {post.treatsCount}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedPosts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-400">
              <p className="text-3xl mb-2">🔖</p>
              <p className="text-xs font-bold">No saved posts yet.</p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden group shadow-xs"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-3">
                  <span>🐟 {post.treatsCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3.5 shadow-xs"
            >
              <span className="text-3xl p-2 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/40">
                {badge.icon}
              </span>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {badge.description}
                </p>
                <span className="text-[10px] brand-color font-semibold block mt-1">
                  Unlocked {badge.unlockedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
