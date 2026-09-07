import React from 'react';
import { Plus } from 'lucide-react';
import { Story, CatProfile } from '../types';
import { playMeowSound, playWoofSound } from '../utils/audio';

interface StoriesBarProps {
  isDog?: boolean;
  stories: Story[];
  activeProfile: CatProfile;
  onSelectStory: (story: Story) => void;
  onOpenCreateStoryModal: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  isDog = false,
  stories,
  activeProfile,
  onSelectStory,
  onOpenCreateStoryModal,
}) => {
  const playSound = isDog ? playWoofSound : playMeowSound;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 min-w-max">
        
        {/* Your Story Button */}
        <div
          onClick={() => {
            playSound(1.2);
            onOpenCreateStoryModal();
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer group"
        >
          <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-rose-400/60 dark:border-rose-500/60 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src={activeProfile.avatar}
              alt={activeProfile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-rose-500 text-white rounded-full p-1 ring-2 ring-white dark:ring-zinc-900 shadow-md">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Your Story
          </span>
        </div>

        {/* Other Cats' Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => {
              playSound(1.1);
              onSelectStory(story);
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div
              className={`w-16 h-16 rounded-full p-[2.5px] ${
                story.isSeen
                  ? 'bg-zinc-300 dark:bg-zinc-700'
                  : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-[var(--brand-3)] 600 animate-pulse'
              } flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs`}
            >
              <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full p-0.5">
                <img
                  src={story.authorAvatar}
                  alt={story.authorName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[70px] truncate text-center">
              {story.authorName.split(' ')[0]}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
};
