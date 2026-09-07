import { Pool } from 'pg';

export const speciesValues = ['cat', 'dog'] as const;
export type Species = typeof speciesValues[number];

export const stateCollectionValues = [
  'profiles',
  'posts',
  'stories',
  'notifications',
  'active-profile',
] as const;
export type StateCollection = typeof stateCollectionValues[number];

export type UserState = Record<StateCollection, unknown | null>;

interface QueryResult {
  rows: Array<{ collection: StateCollection; payload: unknown }>;
}

interface QueryClient {
  query(sql: string, values?: unknown[]): Promise<QueryResult>;
}

export class StateRepository {
  constructor(private readonly client: QueryClient) {}

  async migrate(): Promise<void> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS user_app_state (
        user_id TEXT NOT NULL,
        species TEXT NOT NULL CHECK (species IN ('cat', 'dog')),
        collection TEXT NOT NULL CHECK (
          collection IN ('profiles', 'posts', 'stories', 'notifications', 'active-profile')
        ),
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, species, collection)
      );
      REVOKE ALL ON TABLE user_app_state FROM PUBLIC
    `);
  }

  async getUserState(userId: string, species: Species): Promise<UserState> {
    const result = await this.client.query(
      `SELECT collection, payload
       FROM user_app_state
       WHERE user_id = $1 AND species = $2`,
      [userId, species],
    );

    const state: UserState = {
      profiles: null,
      posts: null,
      stories: null,
      notifications: null,
      'active-profile': null,
    };

    for (const row of result.rows) {
      if (stateCollectionValues.includes(row.collection)) {
        state[row.collection] = row.payload;
      }
    }

    return state;
  }

  async saveCollection(
    userId: string,
    species: Species,
    collection: StateCollection,
    payload: unknown,
  ): Promise<void> {
    await this.client.query(
      `INSERT INTO user_app_state (user_id, species, collection, payload)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (user_id, species, collection)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [userId, species, collection, JSON.stringify(payload)],
    );
  }
}

export class MemoryStateRepository {
  private readonly state = new Map<string, Map<Species, Map<StateCollection, unknown>>>();

  async migrate(): Promise<void> {
    return;
  }

  async getUserState(userId: string, species: Species): Promise<UserState> {
    const speciesState = this.state.get(userId)?.get(species) ?? new Map<StateCollection, unknown>();
    const state: UserState = {
      profiles: null,
      posts: null,
      stories: null,
      notifications: null,
      'active-profile': null,
    };

    for (const collection of stateCollectionValues) {
      state[collection] = speciesState.get(collection) ?? null;
    }

    return state;
  }

  async saveCollection(
    userId: string,
    species: Species,
    collection: StateCollection,
    payload: unknown,
  ): Promise<void> {
    const userState = this.state.get(userId) ?? new Map<Species, Map<StateCollection, unknown>>();
    const speciesState = userState.get(species) ?? new Map<StateCollection, unknown>();
    speciesState.set(collection, payload);
    userState.set(species, speciesState);
    this.state.set(userId, userState);
  }
}

export function createStateRepository(databaseUrl: string) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return {
    pool,
    repository: new StateRepository({
      query: async (sql, values) => pool.query(sql, values),
    }),
  };
}

export function createMemoryStateRepository() {
  return {
    pool: null,
    repository: new MemoryStateRepository(),
  };
}
