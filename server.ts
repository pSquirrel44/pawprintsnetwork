// ═══════════════════════════════════════════════════════════════════════════
// PAWPRINT NETWORK — server.ts
// ───────────────────────────────────────────────────────────────────────────
// ⚠️  BUILD FORMAT: This file is compiled by esbuild to CommonJS (dist/server.cjs)
//     DO NOT add `import.meta.url`, `fileURLToPath`, or `__dirname/__filename`
//     from the 'url' module — those are ESM-only and will crash the server.
//     This bug has already been introduced and fixed multiple times. Leave this
//     comment here as a reminder. If you see those lines, delete them.
// ═══════════════════════════════════════════════════════════════════════════
import express, { type ErrorRequestHandler } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { clerkMiddleware } from '@clerk/express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { requireApiAuth } from './server/auth';
import { getServerConfig } from './server/config';
import { isLandingDomain } from './server/domains';
import {
  createMemoryStateRepository,
    createStateRepository,
    type StateRepository,
  speciesValues,
  stateCollectionValues,
} from './server/stateRepository';
import {
  booleanValue,
  enumValue,
  imageInput,
  optionalText,
  RequestValidationError,
  statePayload,
} from './server/validation';

dotenv.config({ path: ['.env.local', '.env'] });


async function startServer() {
  const config = getServerConfig(process.env);
  let pool: Awaited<ReturnType<typeof createStateRepository>>['pool'] | null = null;
  let stateRepository: Pick<StateRepository, 'migrate' | 'getUserState' | 'saveCollection'> = createMemoryStateRepository().repository;

  try {
    const db = createStateRepository(config.databaseUrl);
    pool = db.pool;
    stateRepository = db.repository;
    await stateRepository.migrate();
  } catch (error) {
    if (config.isProduction) {
      throw error;
    }
    console.warn('PostgreSQL unavailable in local development mode; using in-memory state storage instead.');
    stateRepository = createMemoryStateRepository().repository;
  }

  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          config.clerkFrontendApiOrigin,
          'https://challenges.cloudflare.com',
          'https://*.protect.clerk.com',
        ],
        connectSrc: [
          "'self'",
          config.clerkFrontendApiOrigin,
          'https://*.protect.clerk.com:*',
          'https://clerk-telemetry.com',
          'https://*.clerk-telemetry.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        workerSrc: ["'self'", 'blob:'],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com', 'https://*.protect.clerk.com'],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  }));

  // Clerk reads a session JWT from request cookies or the Authorization header.
  // Clerk reads CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY from the process
  // environment. Passing dynamic keys here would also require a separate
  // CLERK_ENCRYPTION_KEY, so keep credentials in the standard environment path.
  app.use(clerkMiddleware({
    authorizedParties: config.clerkAuthorizedParties,
  }));

  // Render must be able to check process health without a user session.
  app.get(['/health', '/api/health'], (_req, res) => {
    res.json({ status: 'ok', app: 'Pawprint Network' });
  });

  // Every remaining API route requires a Clerk-verified user. Parse request
  // bodies only after authentication so anonymous clients cannot force Express
  // to process large JSON payloads.
  app.use('/api', requireApiAuth);
  app.use('/api', rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (_req, res) => res.locals.auth.userId,
    message: {
      error: {
        code: 'rate_limit_exceeded',
        message: 'Too many API requests. Please try again shortly.',
      },
    },
  }));
  app.use('/api', express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK lazily/safely
  const getGeminiClient = () => {
    return new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // --- API ROUTES ---

  app.get('/api/state/:species', async (req, res, next) => {
    try {
      const species = enumValue(req.params.species, 'species', speciesValues);
      const state = await stateRepository.getUserState(res.locals.auth.userId, species);
      return res.json({ state });
    } catch (error: unknown) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: 'invalid_request', message: error.message },
        });
      }
      return next(error);
    }
  });

  app.put('/api/state/:species/:collection', async (req, res, next) => {
    try {
      const species = enumValue(req.params.species, 'species', speciesValues);
      const collection = enumValue(req.params.collection, 'collection', stateCollectionValues);

      if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'data')) {
        throw new RequestValidationError('data is required.');
      }

      await stateRepository.saveCollection(
        res.locals.auth.userId,
        species,
        collection,
        statePayload(req.body.data, collection),
      );
      return res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: 'invalid_request', message: error.message },
        });
      }
      return next(error);
    }
  });

  // AI Cat Caption Generator
  app.post('/api/gemini/cat-caption', async (req, res) => {
    let isDog = false;

    try {
      const body = req.body || {};
      const mood = optionalText(body.mood, 'mood', 100, 'Sassy Overlord');
      const breed = optionalText(body.breed, 'breed', 100, 'Domestic Cat');
      const topic = optionalText(body.topic, 'topic', 500, 'Living my best feline life');
      const location = optionalText(body.location, 'location', 200, 'The Sunbeam');
      isDog = booleanValue(body.isDog, 'isDog');
      const ai = getGeminiClient();

      const prompt = `You are a majestic, hilarious cat on The Catwalk (by Pawprint Network) writing a social media post caption.
Context:
- Mood: ${mood}
- Breed: ${breed}
- Topic/Context: ${topic}
- Location: ${location}

Write a cat perspective caption. Keep it under 200 characters, witty, filled with cat emojis (🐾, 😼, 🐟, 📦, ☀️).
Also provide a 1-sentence "Human Translation".

Format response as strict JSON with fields:
- "caption": string
- "humanTranslation": string
- "tags": string[] (3-5 cat hashtags like #catloaf #3amzoomies #thecatwalk)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              humanTranslation: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['caption', 'humanTranslation', 'tags'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: unknown) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: 'invalid_request', message: error.message },
        });
      }
      console.error('Gemini Caption Error:', error);
      return res.status(500).json({
        error: 'Failed to generate a caption.',
        caption: isDog ? 'WOOF! Something interrupted my zoomies so I could not write a caption. 🦴 #GoodBoyBlocked' : 'Meow! The human delayed my treats so I refused to write a caption. 😼 #SassyCat',
        humanTranslation: 'The caption service is temporarily unavailable.',
        tags: isDog ? ['#thedogpark', '#pawprintnetwork', '#geminiai'] : ['#thecatwalk', '#pawprintnetwork', '#geminiai'],
      });
    }
  });

  // AI Meow Translator
  app.post('/api/gemini/meow-translator', async (req, res) => {
    let mode: 'human-to-cat' | 'cat-to-human' = 'human-to-cat';
    let isDog = false;
    try {
      const body = req.body || {};
      mode = enumValue(body.mode, 'mode', ['human-to-cat', 'cat-to-human']);
      const text = optionalText(body.text, 'text', 2_000);
      isDog = booleanValue(body.isDog, 'isDog');
      const ai = getGeminiClient();

      let prompt = '';
      if (isDog) {
        prompt = mode === 'human-to-cat'
          ? `You are a joyful, enthusiastic dog. Translate this human message into Dog Speak (woofs, borks, tail wags, zoomie energy). Human text: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}`
          : `You are translating dog barks into what the dog is REALLY thinking — joyful, loyal, squirrel-obsessed human thoughts. Dog sounds: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}`;
      } else {
        prompt = mode === 'human-to-cat'
          ? `Translate this human message into Cat Speak (meows, purrs, claw taps, cat arrogance). Human text: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}`
          : `Translate these cat sounds into what the cat is REALLY thinking — sophisticated, sassy, regal human thoughts. Cat sounds: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: { type: Type.STRING },
              catMood: { type: Type.STRING },
              actionNote: { type: Type.STRING },
            },
            required: ['translatedText', 'catMood', 'actionNote'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: unknown) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: 'invalid_request', message: error.message },
        });
      }
      console.error('Gemini Translator Error:', error);
      return res.status(500).json({
        error: 'The translation service is temporarily unavailable.',
        translatedText: isDog
          ? (mode === 'human-to-cat'
              ? 'WOOF WOOF *zooms around yard* (one word registered and it was WALK).'
              : 'Translation: "Did someone say TREAT?? I am SO ready. What are we doing."')
          : (mode === 'human-to-cat'
              ? 'Meow prrrrr *slow blink* (Human, I acknowledged your attempt at communication).'
              : 'Translation: "Fill my bowl immediately or face 3 AM corridor zoomies."'),
        catMood: isDog ? 'Maximum Enthusiasm' : 'Mildly Intrigued',
        actionNote: isDog ? '*vibrates with excitement*' : '*Tail flicks once*',
      });
    }
  });

  // AI Cat Vision & Judgement Analyzer
  app.post('/api/gemini/cat-analyzer', async (req, res) => {
    try {
      const body = req.body || {};
      const image = imageInput(body.imageBase64, body.mimeType);
      const description = optionalText(body.description, 'description', 2_000);
      const isDog = booleanValue(body.isDog, 'isDog');
      const ai = getGeminiClient();

      let contents: any = [];

      if (image) {
        contents = [
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data,
            },
          },
          {
            text: isDog
              ? 'Analyze this dog photo for The Dog Park. Rate its Goodness Level (0-100, higher = better good boy), Zoomie Rating, Inner Monologue, Breed Estimate, Mood Tag, Eyebrow Expressiveness Score, and a funny Dog Fun Fact.'
              : 'Analyze this cat photo for The Catwalk. Rate its Judgement Level (0-100), Loaf Form Rating, Inner Monologue, Breed Estimate, Mood Tag, Whiskers Score, and a funny Cat Fun Fact.',
          },
        ];
      } else {
        contents = isDog
          ? `Analyze this dog description for The Dog Park: "${description || 'A happy golden retriever doing maximum zoomies'}". Rate its Goodness Level (0-100), Zoomie Rating, Inner Monologue, Breed Estimate, Mood Tag, Eyebrow Expressiveness Score, and a funny Dog Fun Fact.`
          : `Analyze this cat description for The Catwalk: "${description || 'An orange tabby cat sitting majestically in a cardboard box'}". Rate its Judgement Level (0-100), Loaf Form Rating, Inner Monologue, Breed Estimate, Mood Tag, Whiskers Score, and a funny Cat Fun Fact.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              judgementLevel: { type: Type.INTEGER },
              loafFormRating: { type: Type.STRING },
              innerMonologue: { type: Type.STRING },
              breedEstimate: { type: Type.STRING },
              moodTag: { type: Type.STRING },
              whiskersScore: { type: Type.STRING },
              funFact: { type: Type.STRING },
            },
            required: [
              'judgementLevel',
              'loafFormRating',
              'innerMonologue',
              'breedEstimate',
              'moodTag',
              'whiskersScore',
              'funFact',
            ],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: unknown) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: 'invalid_request', message: error.message },
        });
      }
      console.error('Gemini Analyzer Error:', error);
      return res.status(500).json({
        judgementLevel: 94,
        loafFormRating: '9.9 / 10 Flawless Tuck',
        innerMonologue: 'I am judging your life choices from this sunbeam.',
        breedEstimate: 'Majestic Domestic Short Hair',
        moodTag: 'Supreme Monarch',
        whiskersScore: '10/10 Perfect Symmetry',
        funFact: 'Cats spend 70% of their lives sleeping and 30% judging humans.',
      });
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({
      error: { code: 'not_found', message: 'The requested API endpoint does not exist.' },
    });
  });

  const apiErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      return next(error);
    }

    console.error('Unhandled API error:', error);

    if (error?.type === 'entity.too.large') {
      return res.status(413).json({
        error: { code: 'payload_too_large', message: 'The request body is too large.' },
      });
    }

    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({
        error: { code: 'invalid_json', message: 'The request body must contain valid JSON.' },
      });
    }

    return res.status(500).json({
      error: { code: 'internal_error', message: 'The server could not process the request.' },
    });
  };

  app.use(apiErrorHandler);

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath   = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');

    // Serve static assets (JS/CSS bundles, icons, etc.)
    // `index: false` on both: without it, express.static auto-serves
    // dist/index.html (and would do the same for a public/index.html) for
    // any "/" request, which short-circuits the domain-aware routing below
    // before it ever runs — that's why instameow.app and instawoof.app were
    // both landing straight in the React app (defaulting to cat/Instameow)
    // instead of the Pawprint Network landing page. The `app.get('*')`
    // handler below is now the only thing that decides what "/" serves.
    app.use(express.static(distPath, { index: false }));
    app.use(express.static(publicPath, { index: false }));

    // ── Domain-aware routing ───────────────────────────────────────────────
    // pawprintsnetwork.com, instameow.app, and instawoof.app:
    //   /          → landing page (pawprint_landing.html)
    //   /app       → React social platform (index.html)
    //   /app/*     → React social platform (index.html)
    //   everything else (assets, /api) → handled above
    //
    // pawprints-ryn4.onrender.com (and any other hostname):
    //   /          → React social platform directly (existing behaviour)
    // ─────────────────────────────────────────────────────────────────────
    app.get('*', (req, res) => {
      const host = (req.hostname || '').toLowerCase();

      if (isLandingDomain(host)) {
        // /app or /app/* → React SPA
        if (req.path === '/app' || req.path.startsWith('/app/')) {
          return res.sendFile(path.join(distPath, 'index.html'));
        }
        // / or anything else → landing page
        return res.sendFile(path.join(publicPath, 'pawprint_landing.html'));
      }

      // Default (Render URL, local dev preview, etc.) → React SPA
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`🐾 🐾 The Catwalk (Pawprint Network) server listening on http://0.0.0.0:${config.port}`);
  });

  const shutdown = () => {
    server.close(() => {
      const finalize = pool ? pool.end() : Promise.resolve();
      void finalize.finally(() => process.exit(0));
    });
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

startServer().catch(() => {
  console.error('Pawprint Network could not start. Check the server configuration and database logs.');
  process.exitCode = 1;
});
