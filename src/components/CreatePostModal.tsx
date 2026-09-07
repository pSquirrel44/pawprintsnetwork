import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Image as ImageIcon, MapPin, Tag, Cat, RefreshCw } from 'lucide-react';
import { CatProfile, Post } from '../types';
import { playMeowSound, playPurrSound, playWoofSound } from '../utils/audio';
import { useAuthenticatedApi } from '../auth/useAuthenticatedApi';

interface CreatePostModalProps {
  isDog?: boolean;
  isOpen: boolean;
  onClose: () => void;
  activeProfile: CatProfile;
  onCreatePost: (newPost: Omit<Post, 'id' | 'timestamp' | 'treatsCount' | 'commentsCount' | 'comments'>) => void;
  // Pre-fills the photo when opened right after a Live Filter Camera capture.
  initialImageUrl?: string;
}

const SAMPLE_IMAGES = [
  { label: 'Majestic White Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Sleepy Orange Tabby', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Void Black Kitten', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Fluffy Persian', url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Curious Bengal', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1000&q=80' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isDog = false,
  isOpen,
  onClose,
  activeProfile,
  onCreatePost,
  initialImageUrl,
}) => {
  const playSound = isDog ? playWoofSound : playMeowSound;
  const apiRequest = useAuthenticatedApi();

  const FILTERS = [
    { id: 'none', label: 'Normal' },
    { id: 'vintage-whiskers', label: isDog ? 'Vintage Rover' : 'Vintage Whiskers' },
    { id: 'warm-glow', label: isDog ? 'Golden Hour' : 'Warm Loaf' },
    { id: 'cyber-cool', label: 'Cyber Kitten' },
    { id: 'sepia-purr', label: isDog ? 'Sepia Snoot' : 'Sepia Purr' },
    { id: 'black-white-paws', label: 'B&W Paws' },
  ];

  const LOCATIONS = [
    isDog ? 'The Backyard Grass' : 'The Sunbeam on Carpet',
    'Top of the Wi-Fi Router',
    'Cardboard Box #4',
    'Kitchen Island Counter',
    'Human\'s Fresh Laundry',
    'Shadow Realm (Under Bed)',
    'On Top of Keyboard',
  ];

  const MOODS = isDog
    ? ['Maximum Zoomies', 'Good Boy Mode', 'Squirrel Alert', 'Nap Champion', 'Treat Obsessed']
    : ['Sassy Overlord', 'Sleepy Loaf', '3AM Zoomies Chaos', 'Philosophical Cat', 'Demanding Wet Food'];

  const [imageUrl, setImageUrl] = useState(initialImageUrl || SAMPLE_IMAGES[0].url);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [caption, setCaption] = useState('');
  const [humanTranslation, setHumanTranslation] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [category, setCategory] = useState<Post['category']>('Nap Champs');
  const [tagsInput, setTagsInput] = useState(isDog ? '#doglife, #thedogpark' : '#catlife, #thecatwalk');
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // The modal stays mounted while closed, so a fresh camera capture needs to
  // land in the preview each time the modal re-opens, not just on first mount.
  useEffect(() => {
    if (isOpen && initialImageUrl) {
      setImageUrl(initialImageUrl);
      setSelectedFilter('none'); // the camera already baked its filter into the photo
    }
  }, [isOpen, initialImageUrl]);

  if (!isOpen) return null;

  // File Upload Reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          playSound(1.1);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Gemini AI Caption Generator Call
  const handleGenerateAICaption = async () => {
    setIsGeneratingCaption(true);
    playPurrSound();
    try {
      const data = await apiRequest<{
        caption?: string;
        humanTranslation?: string;
        tags?: string[];
      }>('/api/gemini/cat-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          breed: activeProfile.breed,
          location,
          topic: `A photo of ${activeProfile.name} doing cat things in ${location}`,
          isDog,
        }),
      });
      if (data.caption) {
        setCaption(data.caption);
      }
      if (data.humanTranslation) {
        setHumanTranslation(data.humanTranslation);
      }
      if (data.tags && Array.isArray(data.tags)) {
        setTagsInput(data.tags.join(', '));
      }
      playSound(1.3);
    } catch (err) {
      console.error('Caption generation error:', err);
      setCaption(isDog ? 'I found the BIGGEST stick in the park and now it belongs to me. 🦴 #StickChampion' : 'I sat in the warm sunbeam and decided this household belongs to me. 😼 #SunbeamMonarch');
      setHumanTranslation('Translation: "I demand treat adoration immediately."');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    playSound(1.2);
    onCreatePost({
      authorId: activeProfile.id,
      authorHandle: activeProfile.handle,
      authorName: activeProfile.name,
      authorAvatar: activeProfile.avatar,
      imageUrl,
      filterStyle: selectedFilter,
      caption,
      humanTranslation,
      location,
      category,
      tags: tagsArray,
      isTreating: false,
      isSaved: false,
    });

    onClose();
  };

  const getFilterStyleClass = (style: string) => {
    switch (style) {
      case 'vintage-whiskers':
        return 'sepia-[0.35] contrast-125 brightness-90 saturate-150';
      case 'warm-glow':
        return 'sepia-[0.25] hue-rotate-[-10deg] contrast-110 saturate-125';
      case 'cyber-cool':
        return 'hue-rotate-[180deg] contrast-125 saturate-150';
      case 'sepia-purr':
        return 'sepia-[0.7] contrast-105';
      case 'black-white-paws':
        return 'grayscale contrast-150';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">

        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cat className="w-5 h-5 brand-color 500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {isDog ? 'Create Bark Post' : 'Create Purr Post'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Image Upload & Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Image Box */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {isDog ? '1. Select / Upload Dog Photo' : '1. Select / Upload Cat Photo'}
              </label>

              <div className="relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group">
                <img
                  src={imageUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover ${getFilterStyleClass(selectedFilter)}`}
                />

                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                  <Upload className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold">Upload Custom Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Snaps Picker */}
              <div>
                <p className="text-[11px] text-zinc-400 mb-1.5 font-medium">{isDog ? "Or pick a sample dog photo:" : "Or pick a sample cat photo:"}</p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {SAMPLE_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(sample.url)}
                      className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 transition-all ${
                        imageUrl === sample.url ? 'ring-rose-500 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls Box */}
            <div className="space-y-4">

              {/* Filters */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  2. Apply Cat Filter
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                        selectedFilter === filter.id
                          ? 'brand-bg-solid text-white border-rose-500 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 outline-none"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      📍 {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Post['category'])}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 outline-none"
                >
                  {(isDog ? ['Puppies', 'Chonky Dogs', 'Costumes', 'Nap Champs', 'Zoomies', 'Fetch'] : ['Kittens', 'Chonkers', 'Cosplay', 'Nap Champs', 'Loafing', 'Zoomies']).map((cat) => (
                    <option key={cat} value={cat}>
                      🏷️ {cat}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Gemini AI Caption Writer Assistant */}
          <div className="p-4 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
                <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
                <span className="text-xs font-bold">Gemini AI Cat Caption Writer</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="text-[11px] bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700 rounded-lg px-2 py-1 text-purple-900 dark:text-purple-200"
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleGenerateAICaption}
                  disabled={isGeneratingCaption}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isGeneratingCaption ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto Caption</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {humanTranslation && (
              <p className="text-[11px] text-purple-800 dark:text-purple-300 italic bg-purple-100/50 dark:bg-purple-900/40 p-2 rounded-xl">
                {humanTranslation}
              </p>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Caption
            </label>
            <textarea
              rows={3}
              placeholder={isDog ? 'Write a pawsome bark caption...' : 'Write a purr-fect meow caption...'}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 outline-none brand-focus 400"
            />
          </div>

          {/* Hashtags Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Hashtags (separated by comma)
            </label>
            <input
              type="text"
              placeholder={isDog ? "#doglife, #zoomies, #goodboy" : "#catlife, #3amzoomies, #sunbeam"}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-[var(--brand-3)] 600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/20 hover:opacity-95 transition-opacity"
          >
            {isDog ? 'Post to The Dog Park 🦴' : 'Post to The Catwalk 🐾'}
          </button>

        </form>

      </div>
    </div>
  );
};
