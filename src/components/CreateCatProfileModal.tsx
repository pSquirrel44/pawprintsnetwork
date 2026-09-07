import React, { useState } from 'react';
import { X, Upload, Sparkles, Cat, Dog, Camera, Check, Heart, ShieldCheck } from 'lucide-react';
import { CatProfile } from '../types';
import { playMeowSound, playWoofSound, playPurrSound } from '../utils/audio';

interface CreateCatProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: (profile: Omit<CatProfile, 'id' | 'followersCount' | 'followingCount' | 'treatsReceived' | 'badges'>) => void;
  speciesMode?: 'cat' | 'dog';
}

const CAT_BREEDS = [
  'British Shorthair',
  'Maine Coon',
  'Ragdoll',
  'Siamese',
  'Persian',
  'Domestic Short Hair (DSH)',
  'Domestic Long Hair (DLH)',
  'Orange Tabby',
  'Bombay / Void Cat',
  'Calico / Tortoiseshell',
  'Scottish Fold',
  'Sphynx',
  'Bengal',
  'Russian Blue',
];

const DOG_BREEDS = [
  'Golden Retriever',
  'French Bulldog',
  'Pembroke Welsh Corgi',
  'German Shepherd',
  'Labrador Retriever',
  'Shiba Inu',
  'Poodle (Standard / Toy)',
  'Dachshund',
  'Siberian Husky',
  'Australian Shepherd',
  'Beagle',
  'Border Collie',
];

const PRESET_CAT_AVATARS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80',
];

const PRESET_DOG_AVATARS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
];

export const CreateCatProfileModal: React.FC<CreateCatProfileModalProps> = ({
  isOpen,
  onClose,
  onCreateProfile,
  speciesMode = 'cat',
}) => {
  const isDog = speciesMode === 'dog';
  const breedsList = isDog ? DOG_BREEDS : CAT_BREEDS;
  const avatarsList = isDog ? PRESET_DOG_AVATARS : PRESET_CAT_AVATARS;

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [breed, setBreed] = useState(breedsList[0]);
  const [age, setAge] = useState('2 years');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState(isDog ? 'Backyard Grass' : 'Living Room Sunbeam');
  const [favoriteSpot, setFavoriteSpot] = useState(isDog ? 'Doggy Park Bench' : 'Top of the Refrigerator');
  const [boxPreference, setBoxPreference] = useState(isDog ? 'Fluffy Orthopedic Bed' : 'Medium Cardboard Box');
  const [avatar, setAvatar] = useState(avatarsList[0]);
  const [bannerUrl, setBannerUrl] = useState(isDog ? 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80' : 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=1200&q=80');

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          setAvatar(res);
          setAvatarPreview(res);
          playMeowSound(1.2);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playPurrSound();
    playMeowSound(1.3);

    const generatedHandle = handle.trim()
      ? handle.trim().replace(/^@/, '')
      : name.toLowerCase().replace(/[^a-z0-9]/g, '');

    onCreateProfile({
      name: name.trim(),
      handle: generatedHandle || `${isDog ? 'dog' : 'cat'}_${Date.now().toString().slice(-4)}`,
      breed,
      age: age.trim() || (isDog ? 'Puppy at heart' : 'Kitten at heart'),
      bio: bio.trim() || (isDog ? 'Living my best zoomie life on The Dog Park! 🦴' : 'Living my best 9 lives on The Catwalk! 🐾'),
      location: location.trim() || (isDog ? 'The Backyard' : 'The Living Room Couch'),
      favoriteSpot: favoriteSpot.trim() || 'Warm Sunbeam',
      boxPreference: boxPreference.trim() || 'Any Cardboard Box',
      avatar,
      bannerUrl,
      isVerified: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className={`p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between ${
          isDog 
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-sky-600' 
            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600'
        } text-white`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
              {isDog ? <Dog className="w-5 h-5 text-white" /> : <Cat className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-1.5">
                <span>{isDog ? 'Create New Dog Profile' : 'Create New Cat Profile'}</span>
                <Sparkles className="w-4 h-4 text-amber-200" />
              </h2>
              <p className="text-[11px] text-white/90">
                {isDog ? 'Submit your pooch sovereign to The Dog Park' : 'Submit your feline sovereign to The Catwalk'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Avatar Picture Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              1. {isDog ? 'Dog' : 'Cat'} Profile Picture Upload
            </label>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-rose-300 dark:border-rose-700/60 overflow-hidden shrink-0 group flex items-center justify-center">
                <img
                  src={avatarPreview || avatar}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-center p-1">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <p className="text-[11px] text-zinc-400">
                  Or select a preset avatar below:
                </p>

                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {avatarsList.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setAvatarPreview(null);
                        if (isDog) playWoofSound(1.0);
                        else playMeowSound(1.0);
                      }}
                      className={`w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        avatar === url && !avatarPreview ? 'border-rose-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {isDog ? "Dog's Name" : "Cat's Name"} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={isDog ? "e.g. Barnaby, Sir Barks-a-Lot" : "e.g. Sir Whiskers, Princess Mittens"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Username Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">@</span>
                <input
                  type="text"
                  placeholder={isDog ? "BarnabyPooch" : "LordWhiskers"}
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Breed & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Breed
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
              >
                {breedsList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Age
              </label>
              <input
                type="text"
                placeholder="e.g. 3 years, 8 months"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Short Bio / Personality
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Master of 3 AM corridor zoomies and sunbeam snatcher..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
            />
          </div>

          {/* Extra Preferences (Location, Fav Spot, Box) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="The Living Room"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Favorite Napping Spot
              </label>
              <input
                type="text"
                placeholder="Top of Bookshelf"
                value={favoriteSpot}
                onChange={(e) => setFavoriteSpot(e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                Box Preference
              </label>
              <input
                type="text"
                placeholder="Chewy Medium Box"
                value={boxPreference}
                onChange={(e) => setBoxPreference(e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-rose-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            {isDog ? <Dog className="w-4 h-4" /> : <Cat className="w-4 h-4" />}
            <span>{isDog ? 'Create Profile & Switch Active Dog' : 'Create Profile & Switch Active Cat'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
