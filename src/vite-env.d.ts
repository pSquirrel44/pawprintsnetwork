/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_CLERK_PRIMARY_DOMAIN?: string;
  readonly VITE_CLERK_SATELLITE_DOMAINS?: string;
  readonly VITE_CLERK_SIGN_IN_URL?: string;
  readonly VITE_CLERK_SIGN_UP_URL?: string;
  readonly VITE_ALLOW_CLERK_TEST_KEYS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
