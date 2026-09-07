import type { CapacitorConfig } from '@capacitor/cli';

// ═══════════════════════════════════════════════════════════════════════════
// PAWPRINT NETWORK — capacitor.config.ts
// ───────────────────────────────────────────────────────────────────────────
// This turns the existing web app into native iOS/Android app shells.
// Rather than re-bundling the frontend (which would need its own copy of the
// Clerk auth flow and a rewrite of every relative `/api/...` fetch call),
// the native apps simply open the already-deployed production site in a
// native WebView. That's what `server.url` below does — it's the standard,
// low-risk way to get a web app into the App Store / Play Store.
//
// appId: reverse-domain identifier tied to the instameow.app domain.
// You can change this any time before your FIRST store submission — after
// that, both Apple and Google treat it as permanent for that app listing.
// ═══════════════════════════════════════════════════════════════════════════
const config: CapacitorConfig = {
  appId: 'app.instameow.catwalk',
  appName: 'The Catwalk',
  webDir: 'www',
  server: {
    url: 'https://instameow.app',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['instameow.app', '*.instameow.app', '*.clerk.accounts.dev', '*.clerk.com'],
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#0f0f12',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
