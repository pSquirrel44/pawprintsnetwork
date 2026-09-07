import React, { useState } from 'react';
import { Search, Hash, Flame, Sparkles, MessageCircle, Heart, MapPin } from 'lucide-react';
import { Post } from '../types';
import { playMeowSound, playTreatSound, playWoofSound } from '../utils/audio';

interface ExploreViewProps {
  isDog?: boolean;
  posts: Post[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onTreatPost: (postId: string) => void;
  onSelectTag: (tag: string) => void;
}

const CAT_TRENDING_TAGS = [
  '#catloaf',
  '#3amzoomies',
  '#wifiwarrior',
  '#boxlife',
  '#voidcat',
  '#orangebraincell',
  '#sunbeammonarch',
  '#toebeans',
];
const DOG_TRENDING_TAGS = [
  '#zoomies',
  '#goodboy',
  '#fetchlife',
  '#barklife',
  '#stickcollector',
  '#squirrelwatch',
  '#bellyrubs',
  '#walktime',
  '#thedogpark',
  '#pawprintnetwork',
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  isDog = false,
  posts,
  searchQuery,
  onSearchChange,
  onTreatPost,
  onSelectTag,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const CATEGORIES = isDog
    ? ['All', 'Puppies', 'Chonky Dogs', 'Costumes', 'Nap Champs', 'Zoomies', 'Fetch']
    : ['All', 'Kittens', 'Chonkers', 'Cosplay', 'Nap Champs', 'Loafing', 'Zoomies'];

  // Filter posts based on search query or category
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      post.authorName.toLowerCase().includes(q) ||
      post.authorHandle.toLowerCase().includes(q) ||
      post.caption.toLowerCase().includes(q) ||
      post.location.toLowerCase().includes(q) ||
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(q)));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-500/15 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-amber-200" />
            <span>{isDog ? 'Discover Canine Trends' : 'Discover Feline Trends'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {            isDog ? 'Explore the Woof-verse 🐾' : 'Explore the Purr-verse 🐾'}
          </h2>
          <p className="text-xs sm:text-sm text-white/90">
            {isDog ? 'Discover trending zoomies, stick finds, good boy moments, and squirrel alerts from dogs worldwide.' : 'Discover trending cat loaves, midnight zoomies, and regal sunbeam champions from cats worldwide.'}
          </p>
        </div>
      </div>

      {/* Trending Hashtags Bar */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5 brand-color 500" />
          <span>Trending Cat Hashtags</span>
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(isDog ? DOG_TRENDING_TAGS : CAT_TRENDING_TAGS).map((tag) => (
            <button
              key={tag}
              onClick={() => {
                isDog ? playWoofSound(1.0) : playMeowSound(1.0);
                onSelectTag(tag);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? 'brand-bg-solid text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-rose-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              isDog ? playWoofSound(0.9) : playMeowSound(0.9);
              setSelectedCategory(cat);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Masonry/Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
          <p className="text-4xl">🐱❓</p>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No cats found matching "{searchQuery}"</h3>
          <p className="text-xs text-zinc-400">{isDog ? "Try searching for #zoomies, #goodboy, or clearing your filter." : "Try searching for #catloaf, #sunbeam, or clearing your filter."}</p>
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 brand-bg-solid text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden cursor-pointer shadow-xs border border-zinc-200/50 dark:border-zinc-800/50"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="truncate max-w-[100px]">@{post.authorHandle}</span>
                  <span className="brand-bg-solid/80 px-2 py-0.5 rounded-full text-[10px]">
                    {post.category}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1">
                    <span>🐟</span>
                    <span>{post.treatsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>

                <p className="text-[10px] text-white/80 line-clamp-2 italic">
                  "{post.caption}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
