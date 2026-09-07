# Turning The Catwalk into iOS & Android apps

## What I did, in plain terms

Your web app (React + Vite + Express, deployed at instameow.app) now has a
native iOS project (`ios/`) and a native Android project (`android/`) sitting
alongside it, built with a tool called **Capacitor**. Capacitor wraps a
website in a real native app shell so it can be listed on the App Store and
Google Play.

I chose the simplest, lowest-risk way to do this: the native apps open your
**already-live website** (`https://instameow.app`) inside a native window,
instead of trying to repackage your frontend code to run standalone. That
matters because your app uses Clerk for sign-in and calls a backend
(`/api/...`) on the same server — reproducing that inside a bundled app would
mean rebuilding your auth flow for mobile and opening up your API to a new
origin. Loading the live site avoids all of that: the app behaves exactly
like the website does today, just inside its own icon on the home screen.

The trade-off: it's a "web view" app, not a fully offline native rewrite. That
is a completely normal, common approach for a first mobile release (lots of
real apps on both stores work this way), and you can always rebuild more
natively later if you want offline support or deeper native features.

## What's new/changed in the project

- `capacitor.config.ts` — the app's name, its App Store/Play Store ID
  (`app.instameow.catwalk` — see note below), and the line that tells it to
  load `https://instameow.app`.
- `android/` — the full native Android project (open in Android Studio).
- `ios/` — the full native iOS project (open in Xcode, Mac only).
- `resources/` and the generated icons/splash screens inside `android/` and
  `ios/` — made from your existing `public/icons/instameow-icon.png`.
- `src/utils/nativeBridge.ts` + a small addition to `src/main.tsx` — this
  runs **inside the live website itself**, and does three small things only
  when it detects it's running inside the native app (it's invisible on the
  normal website): hides the splash screen once the page has loaded, colors
  the status bar to match your dark theme, and makes the Android back button
  navigate back instead of doing nothing.
- `www/` — a placeholder folder Capacitor needs to exist; not what users
  actually see (the real content always comes from instameow.app).

**Important:** because the app loads the live site, the `nativeBridge.ts`
behavior (splash screen, back button, status bar color) will only work once
you've deployed this code to instameow.app itself. Everything else (icons,
app name, store listing basics) works regardless of what's deployed.

## Type-check fixes (update)

You asked me to re-run the check and fix what it found — `npm run lint`
(TypeScript's checker) now passes clean with zero errors. Here's what was
wrong and what I did about each:

- **`server.ts` — a real bug.** The `/api/gemini/cat-caption` route read
  `isDog` from the request body *inside* the `try` block, but then tried to
  use it again in the `catch` block below, where it didn't exist — so if
  that route ever failed (e.g. a missing Gemini API key), the error handler
  itself would crash instead of returning the friendly fallback message.
  I moved that line above the `try`, matching the pattern already used
  correctly in the other two Gemini routes in the same file. This one was
  worth fixing regardless of the mobile app work.
- **`src/main.tsx` — a missing type declaration.** `import.meta.env` needs a
  `vite-env.d.ts` file (the standard Vite convention) to be recognized by
  TypeScript; the project didn't have one. Added `src/vite-env.d.ts` with
  the one line Vite's own docs recommend.
- **Root-level `App.tsx`, `PostCard.tsx`, `PostLightbox.tsx` — unused
  duplicates.** These three files at the top of the project aren't used
  anywhere (your real app lives entirely under `src/`, which is what
  `index.html` actually loads) — they look like leftovers from before the
  project was reorganized into `src/`. Their imports pointed at files that
  only exist inside `src/`, which is what TypeScript was complaining about.
  I wasn't able to delete them in this environment (file deletion is
  restricted here for safety), so I excluded them from the type-check in
  `tsconfig.json` instead, which has the same practical effect. **You can
  safely delete `App.tsx`, `PostCard.tsx`, and `PostLightbox.tsx` from the
  project root** next time you're in your own editor — nothing references
  them.

## What I could not do here

Building and signing an actual installable app requires tools that only run
on specific operating systems, which this workspace doesn't have:

- **iOS** needs a Mac with Xcode installed. I can't produce an `.ipa` file
  from here.
- **Android** needs the Android SDK, which needs to download from Google's
  servers — this workspace's network doesn't allow that, so I couldn't
  produce a signed `.apk`/`.aab` file directly either. Locally, however,
  Android Studio downloads the SDK itself, so this isn't a blocker for you.

What I *did* verify: Capacitor's own environment checker (`npx cap doctor`)
confirms the Android project is fully valid and ready to build. The iOS
project is generated the same way Capacitor always generates it — it just
needs Xcode to open and build it.

## Next steps to actually publish

### Android (Google Play)
1. Install [Android Studio](https://developer.android.com/studio).
2. Open the `android/` folder as a project.
3. Let it sync (downloads the Android SDK automatically the first time).
4. `Build > Generate Signed Bundle/APK` → choose "Android App Bundle" → it
   will walk you through creating a signing key (keep this file and its
   password somewhere very safe — you'll need the exact same key for every
   future update).
5. Create a [Google Play Console](https://play.google.com/console) account
   ($25 one-time fee) if you don't have one, create a new app listing, and
   upload the `.aab` file it produced.

### iOS (App Store)
1. You'll need a Mac with [Xcode](https://developer.apple.com/xcode/)
   installed (or a cloud Mac build service like Codemagic or GitHub Actions'
   macOS runners, if you don't own a Mac).
2. Open `ios/App/App.xcworkspace` in Xcode.
3. Sign up for the [Apple Developer Program](https://developer.apple.com/programs/)
   ($99/year) if you haven't already.
4. In Xcode, set your Team under Signing & Capabilities, then
   `Product > Archive` to build a release version.
5. Use Xcode's Organizer (or `xcodebuild`) to upload it to
   [App Store Connect](https://appstoreconnect.apple.com), create the app
   listing there, and submit for review.

### Before submitting to either store
- Double check `app.instameow.catwalk` is the ID you want — it's yours to
  change now, but becomes permanent for that listing after your first
  submission.
- Both stores will ask for screenshots, a description, a privacy policy URL,
  and content rating answers — none of that is in this project, it's filled
  in on the store's website when you create the listing.
- Since sign-in goes through Clerk, quickly test the sign-in flow inside the
  built app before submitting — pop-up-based login flows occasionally need a
  small config tweak (in Clerk's dashboard or `allowNavigation` in
  `capacitor.config.ts`) to work smoothly inside a native WebView instead of
  a browser tab.
