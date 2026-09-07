# Production deployment checklist

Pawprint Network is configured for Gandi Web Hosting using Node.js 24 and PostgreSQL 13. `pawprintsnetwork.com` is the primary network and authentication domain; Instameow and Instawoof are additional brand domains served by the same application.

## 1. Gandi hosting configuration

| Setting | Value |
|---|---|
| Configuration | À la carte |
| Language | Node.js 24 |
| Database | PostgreSQL 13 |
| Primary site | `pawprintsnetwork.com` |
| Application repository | `default.git` |
| Start command | `npm start` from `package.json` |
| Port | Gandi-provided `PORT`; never override it |

Gandi installs npm dependencies during a git deployment. The repository's `postinstall` script detects Gandi's `GANDI` environment variable and creates the Vite and Express production bundles automatically. The `package.json` config keeps build-time development tools available during that install.

## 2. Server-only environment file

Create `.env.local` in the deployed application directory using SFTP or Gandi's emergency console. The file is ignored by Git and must never be pushed to GitHub or Gandi's Git repository.

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_live_REPLACE_ME
CLERK_PUBLISHABLE_KEY=pk_live_REPLACE_ME
CLERK_SECRET_KEY=REPLACE_WITH_CLERK_SECRET
GEMINI_API_KEY=REPLACE_WITH_GEMINI_KEY
CLERK_AUTHORIZED_PARTIES=https://pawprintsnetwork.com,https://www.pawprintsnetwork.com,https://instameow.app,https://www.instameow.app,https://instawoof.app,https://www.instawoof.app
VITE_CLERK_PRIMARY_DOMAIN=pawprintsnetwork.com
VITE_CLERK_SATELLITE_DOMAINS=instameow.app,www.instameow.app,instawoof.app,www.instawoof.app
VITE_CLERK_SIGN_IN_URL=https://pawprintsnetwork.com/app
VITE_CLERK_SIGN_UP_URL=https://pawprintsnetwork.com/app
DATABASE_URL=postgresql://pawprints_app:REPLACE_WITH_PRIVATE_PASSWORD@localhost:5432/pawprints
```

Use the same live Clerk publishable key for both publishable-key variables. Gandi supplies `NODE_ENV=production` and `PORT`; do not put either in this file. Restrict the file to the hosting account where possible, for example with `chmod 600 .env.local` through the emergency console.

Do not set `ALLOW_CLERK_TEST_KEYS` or `VITE_ALLOW_CLERK_TEST_KEYS` in production.

## 3. PostgreSQL setup

In Gandi's Web Hosting control panel:

1. Open PostgreSQL administration.
2. Create a database named `pawprints`.
3. Create a dedicated login role for the application with a unique password.
4. Make that role the owner of the `pawprints` database; do not grant it server-wide administration rights.
5. Put that role, password, and database name in `DATABASE_URL` inside `.env.local`.
6. Do not use the default `hosting-db` administrator from application code.
7. Do not manually create application tables. On startup, the app creates `user_app_state` and revokes public access to it.

The app stores authenticated account state in PostgreSQL and keeps a user-scoped browser cache for offline fallback and first-run migration. This provides durable private account state, but it is not yet a normalized, shared social-network database; see the product boundary in the authentication document.

## 4. Clerk dashboard

1. Create or switch to the Clerk production instance and copy its live publishable and secret keys.
2. Configure `pawprintsnetwork.com` as the primary production domain.
3. Add `instameow.app`, `www.instameow.app`, `instawoof.app`, and `www.instawoof.app` as satellite domains and complete Clerk's DNS records.
4. Add all primary and satellite origins to Clerk's permitted redirect/origin settings.
5. Choose the required sign-in methods and verification rules. Require email verification if Pawprint will rely on verified email ownership.
6. Redeploy after changing any `VITE_` value because Vite embeds those values at build time.

## 5. Git deployment

Gandi displays the exact Git+SSH URL in the hosting's Deploy section. Use SSH-key authentication rather than sharing a deploy token.

```bash
git remote add gandi ssh+git://YOUR_HOSTING_ID@git.YOUR_DATACENTER.gpaas.net/default.git
git push gandi codex/auth-production-hardening
ssh YOUR_HOSTING_ID@git.YOUR_DATACENTER.gpaas.net \
  'deploy default.git codex/auth-production-hardening'
```

The deployment installs dependencies, runs the Gandi-only production build, and starts `dist/server.cjs` through the existing `npm start` script. Never send the hosting ID's password, deploy token, private SSH key, or `.env.local` contents through chat.

## 6. Additional sites and DNS

After `pawprintsnetwork.com` is active, add these Sites to the same Node.js hosting:

- `www.pawprintsnetwork.com`
- `instameow.app`
- `www.instameow.app`
- `instawoof.app`
- `www.instawoof.app`

Complete the DNS/SSL instructions Gandi shows for each domain. Do not remove a working Render DNS target until the corresponding Gandi site is deployed and passes the release checks.

## 7. Release verification

1. Confirm `/health` returns HTTP 200 with `{ "status": "ok" }`.
2. Confirm an unauthenticated POST to `/api/gemini/cat-caption` returns JSON HTTP 401 rather than a redirect or HTML.
3. Confirm `pawprintsnetwork.com/` shows the landing page and `/app` shows the authenticated application.
4. Sign up and sign in on `pawprintsnetwork.com/app`.
5. Open both brand domains and confirm the same Clerk account is recognized through satellite authentication.
6. Generate one caption, translation, and image analysis.
7. Sign out and confirm protected API calls return 401.
8. Check `/srv/data/var/log/www/nodejs.log` and `nodejs-watchd.log` for boot or runtime errors without copying credentials out of the hosting account.
9. Create a profile or post, sign out, clear that site's browser storage, sign back in, and confirm the record reloads from PostgreSQL.

## 8. GitHub protection

The CI workflow runs TypeScript, unit tests, application preflight, and the production build. Require the `verify` job and pull-request review before merging to `main`.
