import React, { useCallback, useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';
import { CatProfile, Post, Story, NotificationItem } from './types';
import {
  getStoredProfiles,
  saveProfiles,
  getStoredPosts,
  savePosts,
  getStoredStories,
  saveStories,
  getStoredNotifications,
  saveNotifications,
  getActiveProfileId,
  setActiveProfileId,
} from './utils/storage';
import { INITIAL_DOG_PROFILES, INITIAL_DOG_POSTS, INITIAL_DOG_STORIES, INITIAL_DOG_NOTIFICATIONS } from './data/mockData';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { StoriesBar } from './components/StoriesBar';
import { StoryViewerModal } from './components/StoryViewerModal';
import { PostCard } from './components/PostCard';
import { PostLightbox } from './components/PostLightbox';
import { CreatePostModal } from './components/CreatePostModal';
import { CreateCatProfileModal } from './components/CreateCatProfileModal';
import { ExploreView } from './components/ExploreView';
import { MeowTranslatorModal } from './components/MeowTranslatorModal';
import { CatAnalyzerModal } from './components/CatAnalyzerModal';
import { ProfileView } from './components/ProfileView';
import { NotificationsModal } from './components/NotificationsModal';
import { AffiliateMarketplaceModal } from './components/AffiliateMarketplaceModal';
import { SocialAuthModal } from './components/SocialAuthModal';
import { SocialShareModal } from './components/SocialShareModal';
import { DeploymentRoadmapModal } from './components/DeploymentRoadmapModal';
import { SoundboardModal } from './components/SoundboardModal';
import { LiveFilterCamera } from './components/LiveFilterCamera';
import { ClerkAuthGate } from './components/ClerkAuthGate';
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedApi } from './auth/useAuthenticatedApi';
import {
  RemoteUserState,
  resolveSpeciesState,
  Species,
  StateCollection,
} from './utils/stateSync';

// Determine which brand (cat/dog) to open the app in. Reads the `?app=`
// param set by the Pawprint Network landing page (public/pawprint_landing.html)
// so "Join The Catwalk" / "Join The Dog Park" actually land in the right
// experience, instead of always defaulting to cat. Falls back to hostname
// (instawoof.app → dog) for direct /app visits with no param.
function getInitialSpeciesMode(): 'cat' | 'dog' {
  if (typeof window === 'undefined') return 'cat';

  const params = new URLSearchParams(window.location.search);
  const appParam = params.get('app');
  if (appParam === 'cat' || appParam === 'dog') return appParam;

  const host = window.location.hostname.toLowerCase();
  if (host.includes('instawoof')) return 'dog';

  return 'cat';
}

export default function App() {
  const { user } = useUser();
  const apiRequest = useAuthenticatedApi();
  const storageOwnerId = user?.id;
  const [loadedOwnerId, setLoadedOwnerId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState(false);
  const [speciesMode, setSpeciesMode] = useState<'cat' | 'dog'>(getInitialSpeciesMode);

  const [profiles, setProfiles] = useState<CatProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string>('cat_1');

  // Species cache states
  const [catProfiles, setCatProfiles] = useState<CatProfile[]>([]);
  const [catPosts, setCatPosts] = useState<Post[]>([]);
  const [catStories, setCatStories] = useState<Story[]>([]);
  const [catNotifs, setCatNotifs] = useState<NotificationItem[]>([]);

  const [dogProfiles, setDogProfiles] = useState<CatProfile[]>([]);
  const [dogPosts, setDogPosts] = useState<Post[]>([]);
  const [dogStories, setDogStories] = useState<Story[]>([]);
  const [dogNotifs, setDogNotifs] = useState<NotificationItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = useState<boolean>(false);
  const [isTranslatorModalOpen, setIsTranslatorModalOpen] = useState<boolean>(false);
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);
  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState<boolean>(false);
  const [isSocialAuthModalOpen, setIsSocialAuthModalOpen] = useState<boolean>(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [sharePostTarget, setSharePostTarget] = useState<Post | null>(null);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraCapturedImage, setCameraCapturedImage] = useState<string | undefined>(undefined);

  const saveRemoteCollection = useCallback((
    species: Species,
    collection: StateCollection,
    data: unknown,
  ) => apiRequest<void>(`/api/state/${species}/${collection}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    }), [apiRequest]);

  const persistRemoteCollection = useCallback((
    species: Species,
    collection: StateCollection,
    data: unknown,
  ) => {
    void saveRemoteCollection(species, collection, data)
      .then(() => setSyncError(false))
      .catch(() => setSyncError(true));
  }, [saveRemoteCollection]);

  const persistProfiles = (value: CatProfile[], species: Species) => {
    if (!storageOwnerId) return;
    saveProfiles(storageOwnerId, value, species);
    persistRemoteCollection(species, 'profiles', value);
  };

  const persistPosts = (value: Post[], species: Species) => {
    if (!storageOwnerId) return;
    savePosts(storageOwnerId, value, species);
    persistRemoteCollection(species, 'posts', value);
  };

  const persistStories = (value: Story[], species: Species) => {
    if (!storageOwnerId) return;
    saveStories(storageOwnerId, value, species);
    persistRemoteCollection(species, 'stories', value);
  };

  const persistNotifications = (value: NotificationItem[], species: Species) => {
    if (!storageOwnerId) return;
    saveNotifications(storageOwnerId, value, species);
    persistRemoteCollection(species, 'notifications', value);
  };

  const persistActiveProfile = (value: string, species: Species) => {
    if (!storageOwnerId) return;
    setActiveProfileId(storageOwnerId, value, species);
    persistRemoteCollection(species, 'active-profile', value);
  };

  // Load only the PostgreSQL state owned by the verified Clerk account. The
  // scoped browser copy is a cache and seeds a new database record once.
  useEffect(() => {
    let cancelled = false;

    if (!storageOwnerId) {
      setLoadedOwnerId(null);
      setSyncError(false);
      setProfiles([]);
      setPosts([]);
      setStories([]);
      setNotifications([]);
      return () => { cancelled = true; };
    }

    const loadedCatProfiles = getStoredProfiles(storageOwnerId, 'cat');
    const loadedCatPosts = getStoredPosts(storageOwnerId, 'cat');
    const loadedCatStories = getStoredStories(storageOwnerId, 'cat');
    const loadedCatNotifs = getStoredNotifications(storageOwnerId, 'cat');
    const loadedCatActiveId = getActiveProfileId(storageOwnerId, 'cat');

    const loadedDogProfiles = getStoredProfiles(storageOwnerId, 'dog');
    const loadedDogPosts = getStoredPosts(storageOwnerId, 'dog');
    const loadedDogStories = getStoredStories(storageOwnerId, 'dog');
    const loadedDogNotifs = getStoredNotifications(storageOwnerId, 'dog');

    const localCat = {
      profiles: loadedCatProfiles,
      posts: loadedCatPosts,
      stories: loadedCatStories,
      notifications: loadedCatNotifs,
      activeProfileId: loadedCatActiveId,
    };
    const localDog = {
      profiles: loadedDogProfiles.length ? loadedDogProfiles : INITIAL_DOG_PROFILES,
      posts: loadedDogPosts.length ? loadedDogPosts : INITIAL_DOG_POSTS,
      stories: loadedDogStories.length ? loadedDogStories : INITIAL_DOG_STORIES,
      notifications: loadedDogNotifs.length ? loadedDogNotifs : INITIAL_DOG_NOTIFICATIONS,
      activeProfileId: getActiveProfileId(storageOwnerId, 'dog') || 'dog_1',
    };

    // Clean the ?app= param from the address bar now that it's been read.
    if (window.location.search.includes('app=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('app');
      window.history.replaceState({}, '', url.toString());
    }

    const load = async () => {
      try {
        const [catResponse, dogResponse] = await Promise.all([
          apiRequest<{ state: RemoteUserState }>('/api/state/cat'),
          apiRequest<{ state: RemoteUserState }>('/api/state/dog'),
        ]);
        const cat = resolveSpeciesState(catResponse.state, localCat);
        const dog = resolveSpeciesState(dogResponse.state, localDog);

        if (cancelled) return;
        // Refresh the device cache from the authoritative database so it is a
        // useful fallback during a later temporary outage.
        saveProfiles(storageOwnerId, cat.state.profiles, 'cat');
        savePosts(storageOwnerId, cat.state.posts, 'cat');
        saveStories(storageOwnerId, cat.state.stories, 'cat');
        saveNotifications(storageOwnerId, cat.state.notifications, 'cat');
        setActiveProfileId(storageOwnerId, cat.state.activeProfileId, 'cat');
        saveProfiles(storageOwnerId, dog.state.profiles, 'dog');
        savePosts(storageOwnerId, dog.state.posts, 'dog');
        saveStories(storageOwnerId, dog.state.stories, 'dog');
        saveNotifications(storageOwnerId, dog.state.notifications, 'dog');
        setActiveProfileId(storageOwnerId, dog.state.activeProfileId, 'dog');

        setCatProfiles(cat.state.profiles);
        setCatPosts(cat.state.posts);
        setCatStories(cat.state.stories);
        setCatNotifs(cat.state.notifications);
        setDogProfiles(dog.state.profiles);
        setDogPosts(dog.state.posts);
        setDogStories(dog.state.stories);
        setDogNotifs(dog.state.notifications);

        const selected = speciesMode === 'dog' ? dog.state : cat.state;
        setProfiles(selected.profiles);
        setPosts(selected.posts);
        setStories(selected.stories);
        setNotifications(selected.notifications);
        setActiveProfileIdState(selected.activeProfileId);
        setSyncError(false);
        setLoadedOwnerId(storageOwnerId);

        const seeds = [
          ...cat.collectionsToSeed.map((item) => ({ species: 'cat' as const, ...item })),
          ...dog.collectionsToSeed.map((item) => ({ species: 'dog' as const, ...item })),
        ];
        if (seeds.length > 0) {
          try {
            await Promise.all(seeds.map((item) => (
              saveRemoteCollection(item.species, item.collection, item.data)
            )));
          } catch {
            if (!cancelled) setSyncError(true);
          }
        }
      } catch {
        if (cancelled) return;
        setCatProfiles(localCat.profiles);
        setCatPosts(localCat.posts);
        setCatStories(localCat.stories);
        setCatNotifs(localCat.notifications);
        setDogProfiles(localDog.profiles);
        setDogPosts(localDog.posts);
        setDogStories(localDog.stories);
        setDogNotifs(localDog.notifications);
        const selected = speciesMode === 'dog' ? localDog : localCat;
        setProfiles(selected.profiles);
        setPosts(selected.posts);
        setStories(selected.stories);
        setNotifications(selected.notifications);
        setActiveProfileIdState(selected.activeProfileId);
        setSyncError(true);
        setLoadedOwnerId(storageOwnerId);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [apiRequest, saveRemoteCollection, storageOwnerId]);

  // Toggle brand theme on <html> element whenever platform switches
  useEffect(() => {
    const root = document.documentElement;
    if (speciesMode === 'dog') {
      root.classList.add('theme-dog');
    } else {
      root.classList.remove('theme-dog');
    }
  }, [speciesMode]);

  // Keep lightbox post in sync when treat/save state changes
  useEffect(() => {
    if (lightboxPost) {
      const updated = [...catPosts, ...dogPosts].find(p => p.id === lightboxPost.id);
      if (updated) setLightboxPost(updated);
    }
  }, [catPosts, dogPosts]);

  const handleToggleSpeciesMode = () => {
    if (!storageOwnerId) return;

    if (speciesMode === 'cat') {
      // Save Cat state before switching
      persistProfiles(profiles, 'cat');
      persistPosts(posts, 'cat');
      persistStories(stories, 'cat');
      persistNotifications(notifications, 'cat');
      persistActiveProfile(activeProfileId, 'cat');

      setCatProfiles(profiles);
      setCatPosts(posts);
      setCatStories(stories);
      setCatNotifs(notifications);

      setSpeciesMode('dog');
      setProfiles(dogProfiles.length ? dogProfiles : INITIAL_DOG_PROFILES);
      setPosts(dogPosts.length ? dogPosts : INITIAL_DOG_POSTS);
      setStories(dogStories.length ? dogStories : INITIAL_DOG_STORIES);
      setNotifications(dogNotifs.length ? dogNotifs : INITIAL_DOG_NOTIFICATIONS);
      const activeDogId = getActiveProfileId(storageOwnerId, 'dog');
      setActiveProfileIdState(activeDogId || 'dog_1');
    } else {
      // Save Dog state before switching
      persistProfiles(profiles, 'dog');
      persistPosts(posts, 'dog');
      persistStories(stories, 'dog');
      persistNotifications(notifications, 'dog');
      persistActiveProfile(activeProfileId, 'dog');

      setDogProfiles(profiles);
      setDogPosts(posts);
      setDogStories(stories);
      setDogNotifs(notifications);

      setSpeciesMode('cat');
      setProfiles(catProfiles);
      setPosts(catPosts);
      setStories(catStories);
      setNotifications(catNotifs);
      const activeCatId = getActiveProfileId(storageOwnerId, 'cat');
      setActiveProfileIdState(activeCatId || 'cat_1');
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || {
    id: 'cat_1',
    handle: 'LordWhiskers',
    name: 'Sir Whiskers III',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    bio: 'Professional Sunbeam Snatcher',
    breed: 'British Shorthair',
    age: '3 years',
    location: 'The Living Room Couch',
    favoriteSpot: 'Top of Bookshelf',
    boxPreference: 'Medium Chewy Box',
    followersCount: 14200,
    followingCount: 38,
    treatsReceived: 89300,
    badges: [],
  };

  const handleSelectProfile = (profile: CatProfile) => {
    if (!storageOwnerId) return;
    setActiveProfileIdState(profile.id);
    persistActiveProfile(profile.id, speciesMode);
  };

  const handleCreateProfile = (profileData: Omit<CatProfile, 'id' | 'followersCount' | 'followingCount' | 'treatsReceived' | 'badges'>) => {
    const newProfile: CatProfile = {
      ...profileData,
      id: `${speciesMode}_${Date.now()}`,
      followersCount: 1,
      followingCount: 12,
      treatsReceived: 25,
      badges: [
        {
          id: 'b_welcome',
          title: speciesMode === 'dog' ? 'The Dog Park Debut' : 'The Catwalk Debut',
          description: speciesMode === 'dog' ? 'Official dog profile submitted to The Dog Park by Pawprint Network!' : 'Official cat profile submitted to The Catwalk by Pawprint Network!',
          icon: '👑',
          unlockedAt: 'Just now',
        },
      ],
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    persistProfiles(updatedProfiles, speciesMode);

    // Auto-switch to newly created profile
    setActiveProfileIdState(newProfile.id);
    persistActiveProfile(newProfile.id, speciesMode);

    // Add notification
    const newNotif: NotificationItem = {
      id: `n_${Date.now()}`,
      actorHandle: newProfile.handle,
      actorName: newProfile.name,
      actorAvatar: newProfile.avatar,
      type: 'follow',
      text: `Welcome @${newProfile.handle} to ${speciesMode === 'dog' ? 'The Dog Park' : 'The Catwalk'}! Your profile is live.`,
      timestamp: 'Just now',
      isRead: false,
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    persistNotifications(updatedNotifs, speciesMode);
  };

  const handleUpdateSocialLinked = (platform: string) => {
    const updatedProfiles = profiles.map((p) => {
      if (p.id === activeProfile.id) {
        return {
          ...p,
          socialLinked: platform,
          isVerified: true,
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    persistProfiles(updatedProfiles, speciesMode);
  };

  const handleTreatPost = (postId: string) => {
    const updatedPosts = posts.map((p) => {
      if (p.id === postId) {
        const nextTreating = !p.isTreating;
        return {
          ...p,
          isTreating: nextTreating,
          treatsCount: nextTreating ? p.treatsCount + 1 : Math.max(0, p.treatsCount - 1),
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    persistPosts(updatedPosts, speciesMode);
  };

  const handleSavePost = (postId: string) => {
    const updatedPosts = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          isSaved: !p.isSaved,
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    persistPosts(updatedPosts, speciesMode);
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      postId,
      authorHandle: activeProfile.handle,
      authorName: activeProfile.name,
      authorAvatar: activeProfile.avatar,
      text,
      timestamp: 'Just now',
      treatsCount: 0,
    };

    const updatedPosts = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [newComment, ...p.comments],
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    persistPosts(updatedPosts, speciesMode);
  };

  const handleCreatePost = (newPostData: Omit<Post, 'id' | 'timestamp' | 'treatsCount' | 'commentsCount' | 'comments'>) => {
    const newPost: Post = {
      ...newPostData,
      id: `post_${Date.now()}`,
      timestamp: 'Just now',
      treatsCount: 1,
      commentsCount: 0,
      comments: [],
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    persistPosts(updatedPosts, speciesMode);

    // Increment user treats received count
    const updatedProfiles = profiles.map((prof) => {
      if (prof.id === activeProfile.id) {
        return {
          ...prof,
          treatsReceived: prof.treatsReceived + 1,
        };
      }
      return prof;
    });
    setProfiles(updatedProfiles);
    persistProfiles(updatedProfiles, speciesMode);
  };

  const handleTreatProfile = (profileId: string) => {
    const updatedProfiles = profiles.map((p) => {
      if (p.id === profileId) {
        return {
          ...p,
          treatsReceived: p.treatsReceived + 1,
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    persistProfiles(updatedProfiles, speciesMode);
  };

  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab('explore');
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    persistNotifications(updated, speciesMode);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const savedPostsList = posts.filter((p) => p.isSaved);

  // A newly signed-in account must finish loading its own namespace before
  // any feed from the previous in-memory account can render.
  if (!storageOwnerId || loadedOwnerId !== storageOwnerId) {
    return (
      <ClerkAuthGate isDog={speciesMode === 'dog'}>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
          Loading your Pawprint data…
        </div>
      </ClerkAuthGate>
    );
  }

  return (
    <ClerkAuthGate isDog={speciesMode === 'dog'}>
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors">
      {syncError && (
        <div role="status" className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-xs font-semibold text-amber-950">
          Database sync is temporarily unavailable. Changes remain cached on this device and will retry when you make another change.
        </div>
      )}
      
      {/* Top Network Selector Header */}
      <div className="bg-zinc-900 text-white text-xs border-b border-zinc-800 py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-[10px] bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Pawprint Network
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 hidden md:inline">2 Independent Live Social Apps</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {/* The Catwalk Tab */}
            <button
              onClick={() => {
                if (speciesMode !== 'cat') handleToggleSpeciesMode();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                speciesMode === 'cat'
                  ? 'bg-rose-500 text-white shadow-xs scale-105'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              <span>🐱 The Catwalk</span>
              <span className="text-[9px] opacity-75 font-mono">instameow.app</span>
            </button>

            {/* The Dog Park Tab */}
            <button
              onClick={() => {
                if (speciesMode !== 'dog') handleToggleSpeciesMode();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                speciesMode === 'dog'
                  ? 'bg-amber-500 text-white shadow-xs scale-105'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              <span>🐶 The Dog Park</span>
              <span className="text-[9px] opacity-75 font-mono">instawoof.app</span>
            </button>

            {/* Deployment Roadmap Modal Button */}
            <button
              onClick={() => setIsRoadmapModalOpen(true)}
              className="ml-2 flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 rounded-full border border-amber-400/30 transition-all shrink-0"
            >
              <Rocket className="w-3 h-3 text-amber-400" />
              <span>Joint Deployment Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <Navbar
        activeProfile={activeProfile}
        profiles={profiles}
        speciesMode={speciesMode}
        onToggleSpeciesMode={handleToggleSpeciesMode}
        onSelectProfile={handleSelectProfile}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenCreateProfileModal={() => setIsCreateProfileModalOpen(true)}
        onOpenTranslatorModal={() => setIsTranslatorModalOpen(true)}
        onOpenAnalyzerModal={() => setIsAnalyzerModalOpen(true)}
        onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
        onOpenSocialAuthModal={() => setIsSocialAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotifsCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto flex pt-4 px-4 sm:px-6 lg:px-8">
        
        {/* Left Desktop Sidebar */}
        <Sidebar
        isDog={speciesMode === 'dog'}
                  activeTab={activeTab}
          onTabChange={setActiveTab}
          activeProfile={activeProfile}
          speciesMode={speciesMode}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenCreateProfileModal={() => setIsCreateProfileModalOpen(true)}
          onOpenTranslatorModal={() => setIsTranslatorModalOpen(true)}
          onOpenAnalyzerModal={() => setIsAnalyzerModalOpen(true)}
          onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
          onOpenSocialAuthModal={() => setIsSocialAuthModalOpen(true)}
          onOpenSoundboard={() => setIsSoundboardOpen(true)}
          onOpenCamera={() => setIsCameraOpen(true)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 lg:ml-64 lg:mr-80 max-w-2xl mx-auto w-full">
          
          {/* Feed Tab View */}
          {activeTab === 'feed' && (
            <div className="space-y-6 pb-12">
              {/* Instagram-style Stories Header Bar */}
              <StoriesBar
isDog={speciesMode === 'dog'}
                                stories={stories}
                activeProfile={activeProfile}
                onSelectStory={(s) => setSelectedStory(s)}
                onOpenCreateStoryModal={() => setIsCreateModalOpen(true)}
              />

              {/* Feed Post List */}
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  activeHandle={activeProfile.handle}
                  onTreatPost={handleTreatPost}
                  onSavePost={handleSavePost}
                  onAddComment={handleAddComment}
                  onSelectTag={handleSelectTag}
                  isDog={speciesMode === 'dog'}
                  onOpenLightbox={(p) => setLightboxPost(p)}
                  onOpenShareModal={(p) => setSharePostTarget(p)}
                />
              ))}
            </div>
          )}

          {/* Explore Tab View */}
          {activeTab === 'explore' && (
            <ExploreView
isDog={speciesMode === 'dog'}
                              posts={posts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onTreatPost={handleTreatPost}
              onSelectTag={handleSelectTag}
            />
          )}

          {/* Saved Treats Tab View */}
          {activeTab === 'saved' && (
            <div className="space-y-6 pb-12">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Bookmark Saved Treats</span>
                  <span className="text-sm font-normal text-zinc-400">({savedPostsList.length})</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  isDog cat/dog posts you've saved to your private stash.
                </p>
              </div>

              {savedPostsList.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-2">
                  <p className="text-4xl">🔖</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No saved treats yet.</p>
                  <p className="text-xs text-zinc-400">Click the bookmark icon on any post to save it here.</p>
                </div>
              ) : (
                savedPostsList.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    activeHandle={activeProfile.handle}
                    onTreatPost={handleTreatPost}
                    onSavePost={handleSavePost}
                    onAddComment={handleAddComment}
                    onSelectTag={handleSelectTag}
                    isDog={speciesMode === 'dog'}
                  onOpenLightbox={(p) => setLightboxPost(p)}
                  onOpenShareModal={(p) => setSharePostTarget(p)}
                  />
                ))
              )}
            </div>
          )}

          {/* Profile Tab View */}
          {activeTab === 'profile' && (
            <ProfileView
        isDog={speciesMode === 'dog'}
                      profile={activeProfile}
              posts={posts}
              savedPosts={savedPostsList}
              isCurrentActiveProfile={true}
              onTreatProfile={handleTreatProfile}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenCreateProfileModal={() => setIsCreateProfileModalOpen(true)}
              onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
              onOpenSocialAuthModal={() => setIsSocialAuthModalOpen(true)}
            />
          )}

        </main>

        {/* Right Desktop Suggestions Widget Sidebar */}
        <aside className="hidden xl:block w-72 fixed right-4 top-20 bottom-0 overflow-y-auto space-y-6 p-2">
          
          {/* Active Cat Account Switcher Card */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={activeProfile.avatar}
                alt={activeProfile.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500/30"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {activeProfile.name}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">@{activeProfile.handle}</p>
                <p className="text-[10px] text-rose-500 font-semibold mt-0.5 truncate">
                  📍 {activeProfile.location}
                </p>
              </div>
            </div>
          </div>

          {/* Popular Cat Profiles to Follow */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Suggested Cats
              </span>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                See All
              </button>
            </div>

            <div className="space-y-3">
              {profiles
                .filter((p) => p.id !== activeProfile.id)
                .slice(0, 3)
                .map((prof) => (
                  <div key={prof.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {prof.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">@{prof.handle}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTreatProfile(prof.id)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-xl shrink-0 transition-colors"
                      title={speciesMode === 'dog' ? 'Give Bone' : 'Give Fish Treat'}
                    >
                      🐟 Treat
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-2 text-[11px] text-zinc-400 space-y-1">
            <p>© 2026 Pawprint Network • Powered by Gemini AI</p>
            <p>Made with 🐾 for cat lovers worldwide.</p>
          </div>

        </aside>

      </div>

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        isDog={speciesMode === 'dog'}
                activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenTranslatorModal={() => setIsTranslatorModalOpen(true)}
      />

      {/* MODALS */}
      <CreatePostModal
        isDog={speciesMode === 'dog'}
                isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCameraCapturedImage(undefined);
        }}
        activeProfile={activeProfile}
        onCreatePost={handleCreatePost}
        initialImageUrl={cameraCapturedImage}
      />

      <CreateCatProfileModal
        isOpen={isCreateProfileModalOpen}
        onClose={() => setIsCreateProfileModalOpen(false)}
        onCreateProfile={handleCreateProfile}
        speciesMode={speciesMode}
      />

      <AffiliateMarketplaceModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        activeProfile={activeProfile}
        speciesMode={speciesMode}
      />

      <SocialAuthModal
        isOpen={isSocialAuthModalOpen}
        onClose={() => setIsSocialAuthModalOpen(false)}
        activeProfile={activeProfile}
        onUpdateSocialLinked={handleUpdateSocialLinked}
      />

      <SocialShareModal
isDog={speciesMode === 'dog'}
                        post={sharePostTarget}
        isOpen={sharePostTarget !== null}
        onClose={() => setSharePostTarget(null)}
      />

      <MeowTranslatorModal
        isOpen={isTranslatorModalOpen}
        onClose={() => setIsTranslatorModalOpen(false)}
        isDog={speciesMode === 'dog'}
      />

      <CatAnalyzerModal
        isOpen={isAnalyzerModalOpen}
        onClose={() => setIsAnalyzerModalOpen(false)}
        isDog={speciesMode === 'dog'}
      />

      <NotificationsModal
        isDog={speciesMode === 'dog'}
                isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      <StoryViewerModal
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />

      <DeploymentRoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => setIsRoadmapModalOpen(false)}
      />

    </div>
      {/* Post lightbox */}
      {lightboxPost && (() => {
        const allPosts = [...catPosts, ...dogPosts];
        const idx = allPosts.findIndex(p => p.id === lightboxPost.id);
        return (
          <PostLightbox
            post={lightboxPost}
            isDog={speciesMode === 'dog'}
            onClose={() => setLightboxPost(null)}
            onTreat={() => handleTreatPost(lightboxPost.id)}
            onSave={() => handleSavePost(lightboxPost.id)}
            onShare={() => { setSharePostTarget(lightboxPost); setLightboxPost(null); }}
            hasPrev={idx > 0}
            hasNext={idx < allPosts.length - 1}
            onPrev={() => idx > 0 && setLightboxPost(allPosts[idx - 1])}
            onNext={() => idx < allPosts.length - 1 && setLightboxPost(allPosts[idx + 1])}
          />
        );
      })()}

      {/* Sound Library */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        isDog={speciesMode === 'dog'}
      />

      {/* Live Filter Camera */}
      {isCameraOpen && (
        <LiveFilterCamera
          isDog={speciesMode === 'dog'}
          onCapture={(dataUrl) => {
            setCameraCapturedImage(dataUrl);
            setIsCameraOpen(false);
            setIsCreateModalOpen(true);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </ClerkAuthGate>
  );
}
