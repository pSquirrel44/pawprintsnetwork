import { CatProfile, Post, Story, NotificationItem } from '../types';
import { 
  INITIAL_PROFILES, INITIAL_POSTS, INITIAL_STORIES, INITIAL_NOTIFICATIONS,
  INITIAL_DOG_PROFILES, INITIAL_DOG_POSTS, INITIAL_DOG_STORIES, INITIAL_DOG_NOTIFICATIONS
} from '../data/mockData';

type Species = 'cat' | 'dog';
type Collection = 'profiles' | 'posts' | 'stories' | 'notifications' | 'active-profile';

export function getStorageKey(ownerId: string, species: Species, collection: Collection): string {
  if (!ownerId.trim()) {
    throw new Error('A Clerk user ID is required for user-owned storage.');
  }

  return `pawprints:${ownerId}:${species}:${collection}:v2`;
}

export function getStoredProfiles(ownerId: string, species: Species = 'cat'): CatProfile[] {
  if (typeof window === 'undefined') return species === 'dog' ? INITIAL_DOG_PROFILES : INITIAL_PROFILES;
  try {
    const key = getStorageKey(ownerId, species, 'profiles');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : (species === 'dog' ? INITIAL_DOG_PROFILES : INITIAL_PROFILES);
  } catch (e) {
    console.error(`Failed to load ${species} profiles:`, e);
    return species === 'dog' ? INITIAL_DOG_PROFILES : INITIAL_PROFILES;
  }
}

export function saveProfiles(ownerId: string, profiles: CatProfile[], species: Species = 'cat') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(ownerId, species, 'profiles'), JSON.stringify(profiles));
  } catch (e) {
    console.error(`Failed to save ${species} profiles:`, e);
  }
}

export function getStoredPosts(ownerId: string, species: Species = 'cat'): Post[] {
  if (typeof window === 'undefined') return species === 'dog' ? INITIAL_DOG_POSTS : INITIAL_POSTS;
  try {
    const key = getStorageKey(ownerId, species, 'posts');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : (species === 'dog' ? INITIAL_DOG_POSTS : INITIAL_POSTS);
  } catch (e) {
    console.error(`Failed to load ${species} posts:`, e);
    return species === 'dog' ? INITIAL_DOG_POSTS : INITIAL_POSTS;
  }
}

export function savePosts(ownerId: string, posts: Post[], species: Species = 'cat') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(ownerId, species, 'posts'), JSON.stringify(posts));
  } catch (e) {
    console.error(`Failed to save ${species} posts:`, e);
  }
}

export function getStoredStories(ownerId: string, species: Species = 'cat'): Story[] {
  if (typeof window === 'undefined') return species === 'dog' ? INITIAL_DOG_STORIES : INITIAL_STORIES;
  try {
    const key = getStorageKey(ownerId, species, 'stories');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : (species === 'dog' ? INITIAL_DOG_STORIES : INITIAL_STORIES);
  } catch (e) {
    console.error(`Failed to load ${species} stories:`, e);
    return species === 'dog' ? INITIAL_DOG_STORIES : INITIAL_STORIES;
  }
}

export function saveStories(ownerId: string, stories: Story[], species: Species = 'cat') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(ownerId, species, 'stories'), JSON.stringify(stories));
  } catch (e) {
    console.error(`Failed to save ${species} stories:`, e);
  }
}

export function getStoredNotifications(ownerId: string, species: Species = 'cat'): NotificationItem[] {
  if (typeof window === 'undefined') return species === 'dog' ? INITIAL_DOG_NOTIFICATIONS : INITIAL_NOTIFICATIONS;
  try {
    const key = getStorageKey(ownerId, species, 'notifications');
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : (species === 'dog' ? INITIAL_DOG_NOTIFICATIONS : INITIAL_NOTIFICATIONS);
  } catch (e) {
    console.error(`Failed to load ${species} notifications:`, e);
    return species === 'dog' ? INITIAL_DOG_NOTIFICATIONS : INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(ownerId: string, notifications: NotificationItem[], species: Species = 'cat') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(ownerId, species, 'notifications'), JSON.stringify(notifications));
  } catch (e) {
    console.error(`Failed to save ${species} notifications:`, e);
  }
}

export function getActiveProfileId(ownerId: string, species: Species = 'cat'): string {
  const defaultId = species === 'dog' ? 'dog_1' : 'cat_1';
  if (typeof window === 'undefined') return defaultId;
  try {
    return localStorage.getItem(getStorageKey(ownerId, species, 'active-profile')) || defaultId;
  } catch (e) {
    return defaultId;
  }
}

export function setActiveProfileId(ownerId: string, id: string, species: Species = 'cat') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(ownerId, species, 'active-profile'), id);
  } catch (e) {
    console.error(`Failed to set active ${species} profile:`, e);
  }
}
