import { CatProfile, NotificationItem, Post, Story } from '../types';

export type Species = 'cat' | 'dog';
export type StateCollection =
  | 'profiles'
  | 'posts'
  | 'stories'
  | 'notifications'
  | 'active-profile';

export interface RemoteUserState {
  profiles: unknown | null;
  posts: unknown | null;
  stories: unknown | null;
  notifications: unknown | null;
  'active-profile': unknown | null;
}

export interface SpeciesState {
  profiles: CatProfile[];
  posts: Post[];
  stories: Story[];
  notifications: NotificationItem[];
  activeProfileId: string;
}

export interface ResolvedSpeciesState {
  state: SpeciesState;
  collectionsToSeed: Array<{ collection: StateCollection; data: unknown }>;
}

function resolveArray<T>(
  collection: Exclude<StateCollection, 'active-profile'>,
  remote: unknown | null,
  local: T[],
  collectionsToSeed: ResolvedSpeciesState['collectionsToSeed'],
): T[] {
  if (Array.isArray(remote)) return remote as T[];
  collectionsToSeed.push({ collection, data: local });
  return local;
}

export function resolveSpeciesState(
  remote: RemoteUserState,
  local: SpeciesState,
): ResolvedSpeciesState {
  const collectionsToSeed: ResolvedSpeciesState['collectionsToSeed'] = [];
  const activeProfileId = typeof remote['active-profile'] === 'string'
    && remote['active-profile'].length > 0
    && remote['active-profile'].length <= 200
    ? remote['active-profile']
    : local.activeProfileId;

  if (activeProfileId === local.activeProfileId && remote['active-profile'] !== local.activeProfileId) {
    collectionsToSeed.push({ collection: 'active-profile', data: local.activeProfileId });
  }

  return {
    state: {
      profiles: resolveArray('profiles', remote.profiles, local.profiles, collectionsToSeed),
      posts: resolveArray('posts', remote.posts, local.posts, collectionsToSeed),
      stories: resolveArray('stories', remote.stories, local.stories, collectionsToSeed),
      notifications: resolveArray(
        'notifications',
        remote.notifications,
        local.notifications,
        collectionsToSeed,
      ),
      activeProfileId,
    },
    collectionsToSeed,
  };
}
