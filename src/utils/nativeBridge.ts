// ═══════════════════════════════════════════════════════════════════════════
// PAWPRINT NETWORK — nativeBridge.ts
// ───────────────────────────────────────────────────────────────────────────
// The iOS/Android apps are thin native shells (Capacitor) that load this
// same web app from https://instameow.app in a WebView — see
// capacitor.config.ts for the full explanation. Because of that, this file
// (part of the regular web bundle) is what actually runs inside the native
// apps too, so it's the right place to wire up native-only behavior.
//
// Everything here is a no-op when the site is opened in a normal browser —
// `Capacitor.isNativePlatform()` is false there, so none of this code runs.
// ═══════════════════════════════════════════════════════════════════════════
import { Capacitor } from '@capacitor/core';

export async function initNativeBridge() {
  if (!Capacitor.isNativePlatform()) return;

  const [{ SplashScreen }, { StatusBar, Style }, { App }] = await Promise.all([
    import('@capacitor/splash-screen'),
    import('@capacitor/status-bar'),
    import('@capacitor/app'),
  ]);

  // Match the app's dark theme (see index.css) so the status bar text/icons
  // stay readable instead of defaulting to black-on-black.
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0f0f12' });
    }
  } catch {
    // StatusBar plugin isn't available on all platforms/OS versions — safe to ignore.
  }

  // Hide the native splash screen once React has mounted, instead of
  // leaving it up for the full launchShowDuration regardless of load time.
  SplashScreen.hide().catch(() => {});

  // Android hardware back button: go back in the WebView's history if
  // possible, otherwise let the app exit (default OS behavior) rather than
  // getting stuck on a page with no back button of its own.
  if (Capacitor.getPlatform() === 'android') {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  }
}
