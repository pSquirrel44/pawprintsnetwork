var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_express3 = require("@clerk/express");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = require("express-rate-limit");

// server/auth.ts
var import_express = require("@clerk/express");
function getVerifiedIdentity(auth) {
  if (!auth.userId) return null;
  return {
    userId: auth.userId,
    sessionId: auth.sessionId || null
  };
}
var requireApiAuth = (req, res, next) => {
  const identity = getVerifiedIdentity((0, import_express.getAuth)(req));
  if (!identity) {
    res.status(401).json({
      error: {
        code: "unauthorized",
        message: "Authentication is required to access this resource."
      }
    });
    return;
  }
  res.locals.auth = identity;
  next();
};

// server/config.ts
function parseOrigins(value, isProduction) {
  const origins = (value || "").split(",").map((origin) => origin.trim()).filter(Boolean).map((origin) => new URL(origin).origin);
  if (isProduction && origins.length === 0) {
    throw new Error("CLERK_AUTHORIZED_PARTIES must list the trusted production origins.");
  }
  if (isProduction && origins.some((origin) => !origin.startsWith("https://"))) {
    throw new Error("Production Clerk authorized parties must use HTTPS.");
  }
  return Array.from(new Set(origins));
}
function getClerkFrontendApiOrigin(publishableKey) {
  const encoded = publishableKey.replace(/^pk_(test|live)_/, "");
  const frontendApi = Buffer.from(encoded, "base64").toString("utf8").replace(/\$$/, "");
  if (!frontendApi || !frontendApi.includes(".")) {
    throw new Error("CLERK_PUBLISHABLE_KEY is malformed.");
  }
  return new URL(`https://${frontendApi}`).origin;
}
function getServerConfig(env) {
  const isProduction = env.NODE_ENV === "production";
  const clerkPublishableKey = env.CLERK_PUBLISHABLE_KEY || "";
  const clerkSecretKey = env.CLERK_SECRET_KEY || "";
  const databaseUrl = env.DATABASE_URL || "";
  const geminiApiKey = env.GEMINI_API_KEY || "";
  const port = Number.parseInt(env.PORT || "3000", 10);
  if (!clerkPublishableKey.startsWith("pk_")) {
    throw new Error("CLERK_PUBLISHABLE_KEY is missing or malformed.");
  }
  if (!clerkSecretKey.startsWith("sk_")) {
    throw new Error("CLERK_SECRET_KEY is missing or malformed.");
  }
  if (isProduction && env.ALLOW_CLERK_TEST_KEYS !== "true" && !clerkSecretKey.startsWith("sk_live_")) {
    throw new Error("Production requires a Clerk secret key beginning with sk_live_.");
  }
  if (isProduction && env.ALLOW_CLERK_TEST_KEYS !== "true" && !clerkPublishableKey.startsWith("pk_live_")) {
    throw new Error("Production requires a Clerk publishable key beginning with pk_live_.");
  }
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is required.");
  }
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return {
    clerkAuthorizedParties: parseOrigins(env.CLERK_AUTHORIZED_PARTIES, isProduction),
    clerkFrontendApiOrigin: getClerkFrontendApiOrigin(clerkPublishableKey),
    databaseUrl,
    geminiApiKey,
    isProduction,
    port
  };
}

// server/domains.ts
var landingDomains = /* @__PURE__ */ new Set([
  "pawprintsnetwork.com",
  "www.pawprintsnetwork.com",
  "instameow.app",
  "www.instameow.app",
  "instawoof.app",
  "www.instawoof.app"
]);
function isLandingDomain(hostname) {
  return landingDomains.has(hostname.trim().toLowerCase());
}

// server/stateRepository.ts
var import_pg = require("pg");
var speciesValues = ["cat", "dog"];
var stateCollectionValues = [
  "profiles",
  "posts",
  "stories",
  "notifications",
  "active-profile"
];
var StateRepository = class {
  constructor(client) {
    this.client = client;
  }
  async migrate() {
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
  async getUserState(userId, species) {
    const result = await this.client.query(
      `SELECT collection, payload
       FROM user_app_state
       WHERE user_id = $1 AND species = $2`,
      [userId, species]
    );
    const state = {
      profiles: null,
      posts: null,
      stories: null,
      notifications: null,
      "active-profile": null
    };
    for (const row of result.rows) {
      if (stateCollectionValues.includes(row.collection)) {
        state[row.collection] = row.payload;
      }
    }
    return state;
  }
  async saveCollection(userId, species, collection, payload) {
    await this.client.query(
      `INSERT INTO user_app_state (user_id, species, collection, payload)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (user_id, species, collection)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [userId, species, collection, JSON.stringify(payload)]
    );
  }
};
function createStateRepository(databaseUrl) {
  const pool = new import_pg.Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 3e4,
    connectionTimeoutMillis: 5e3
  });
  return {
    pool,
    repository: new StateRepository({
      query: async (sql, values) => pool.query(sql, values)
    })
  };
}

// server/validation.ts
var RequestValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestValidationError";
  }
};
function optionalText(value, field, maxLength, fallback = "") {
  if (value === void 0 || value === null || value === "") {
    return fallback;
  }
  if (typeof value !== "string") {
    throw new RequestValidationError(`${field} must be text.`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    throw new RequestValidationError(`${field} must be ${maxLength} characters or fewer.`);
  }
  return text;
}
function booleanValue(value, field) {
  if (value === void 0) {
    return false;
  }
  if (typeof value !== "boolean") {
    throw new RequestValidationError(`${field} must be true or false.`);
  }
  return value;
}
function enumValue(value, field, allowed) {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new RequestValidationError(`${field} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}
function statePayload(value, collection) {
  if (collection === "active-profile") {
    if (typeof value !== "string" || value.trim().length === 0 || value.length > 200) {
      throw new RequestValidationError("active-profile must be a non-empty string of 200 characters or fewer.");
    }
    return value;
  }
  if (!Array.isArray(value)) {
    throw new RequestValidationError(`${collection} must be an array.`);
  }
  if (value.length > 5e3) {
    throw new RequestValidationError(`${collection} may contain at most 5,000 items.`);
  }
  return value;
}
var allowedImageTypes = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
function imageInput(imageBase64, mimeType) {
  if (imageBase64 === void 0 || imageBase64 === null || imageBase64 === "") {
    return null;
  }
  if (typeof imageBase64 !== "string") {
    throw new RequestValidationError("imageBase64 must be a base64 string.");
  }
  const dataUrlMatch = imageBase64.match(/^data:([^;,]+);base64,(.*)$/s);
  const suppliedMimeType = optionalText(mimeType, "mimeType", 50);
  const resolvedMimeType = (dataUrlMatch?.[1] || suppliedMimeType || "image/jpeg").toLowerCase();
  const data = (dataUrlMatch?.[2] || imageBase64).replace(/\s/g, "");
  if (!allowedImageTypes.has(resolvedMimeType)) {
    throw new RequestValidationError("Images must be JPEG, PNG, or WebP.");
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data) || data.length % 4 !== 0) {
    throw new RequestValidationError("imageBase64 is not valid base64 data.");
  }
  const estimatedBytes = data.length * 3 / 4 - (data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0);
  if (estimatedBytes > 6e6) {
    throw new RequestValidationError("Images must be 6 MB or smaller.");
  }
  return { data, mimeType: resolvedMimeType };
}

// server.ts
import_dotenv.default.config({ path: [".env.local", ".env"] });
async function startServer() {
  const config = getServerConfig(process.env);
  const { pool, repository: stateRepository } = createStateRepository(config.databaseUrl);
  await stateRepository.migrate();
  const app = (0, import_express2.default)();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use((0, import_helmet.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          config.clerkFrontendApiOrigin,
          "https://challenges.cloudflare.com",
          "https://*.protect.clerk.com"
        ],
        connectSrc: [
          "'self'",
          config.clerkFrontendApiOrigin,
          "https://*.protect.clerk.com:*",
          "https://clerk-telemetry.com",
          "https://*.clerk-telemetry.com"
        ],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        workerSrc: ["'self'", "blob:"],
        frameSrc: ["'self'", "https://challenges.cloudflare.com", "https://*.protect.clerk.com"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    }
  }));
  app.use((0, import_express3.clerkMiddleware)({
    authorizedParties: config.clerkAuthorizedParties
  }));
  app.get(["/health", "/api/health"], (_req, res) => {
    res.json({ status: "ok", app: "Pawprint Network" });
  });
  app.use("/api", requireApiAuth);
  app.use("/api", (0, import_express_rate_limit.rateLimit)({
    windowMs: 6e4,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (_req, res) => res.locals.auth.userId,
    message: {
      error: {
        code: "rate_limit_exceeded",
        message: "Too many API requests. Please try again shortly."
      }
    }
  }));
  app.use("/api", import_express2.default.json({ limit: "10mb" }));
  const getGeminiClient = () => {
    return new import_genai.GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  };
  app.get("/api/state/:species", async (req, res, next) => {
    try {
      const species = enumValue(req.params.species, "species", speciesValues);
      const state = await stateRepository.getUserState(res.locals.auth.userId, species);
      return res.json({ state });
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: "invalid_request", message: error.message }
        });
      }
      return next(error);
    }
  });
  app.put("/api/state/:species/:collection", async (req, res, next) => {
    try {
      const species = enumValue(req.params.species, "species", speciesValues);
      const collection = enumValue(req.params.collection, "collection", stateCollectionValues);
      if (!Object.prototype.hasOwnProperty.call(req.body || {}, "data")) {
        throw new RequestValidationError("data is required.");
      }
      await stateRepository.saveCollection(
        res.locals.auth.userId,
        species,
        collection,
        statePayload(req.body.data, collection)
      );
      return res.status(204).send();
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: "invalid_request", message: error.message }
        });
      }
      return next(error);
    }
  });
  app.post("/api/gemini/cat-caption", async (req, res) => {
    let isDog = false;
    try {
      const body = req.body || {};
      const mood = optionalText(body.mood, "mood", 100, "Sassy Overlord");
      const breed = optionalText(body.breed, "breed", 100, "Domestic Cat");
      const topic = optionalText(body.topic, "topic", 500, "Living my best feline life");
      const location = optionalText(body.location, "location", 200, "The Sunbeam");
      isDog = booleanValue(body.isDog, "isDog");
      const ai = getGeminiClient();
      const prompt = `You are a majestic, hilarious cat on The Catwalk (by Pawprint Network) writing a social media post caption.
Context:
- Mood: ${mood}
- Breed: ${breed}
- Topic/Context: ${topic}
- Location: ${location}

Write a cat perspective caption. Keep it under 200 characters, witty, filled with cat emojis (\u{1F43E}, \u{1F63C}, \u{1F41F}, \u{1F4E6}, \u2600\uFE0F).
Also provide a 1-sentence "Human Translation".

Format response as strict JSON with fields:
- "caption": string
- "humanTranslation": string
- "tags": string[] (3-5 cat hashtags like #catloaf #3amzoomies #thecatwalk)`;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              caption: { type: import_genai.Type.STRING },
              humanTranslation: { type: import_genai.Type.STRING },
              tags: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              }
            },
            required: ["caption", "humanTranslation", "tags"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: "invalid_request", message: error.message }
        });
      }
      console.error("Gemini Caption Error:", error);
      return res.status(500).json({
        error: "Failed to generate a caption.",
        caption: isDog ? "WOOF! Something interrupted my zoomies so I could not write a caption. \u{1F9B4} #GoodBoyBlocked" : "Meow! The human delayed my treats so I refused to write a caption. \u{1F63C} #SassyCat",
        humanTranslation: "The caption service is temporarily unavailable.",
        tags: isDog ? ["#thedogpark", "#pawprintnetwork", "#geminiai"] : ["#thecatwalk", "#pawprintnetwork", "#geminiai"]
      });
    }
  });
  app.post("/api/gemini/meow-translator", async (req, res) => {
    let mode = "human-to-cat";
    let isDog = false;
    try {
      const body = req.body || {};
      mode = enumValue(body.mode, "mode", ["human-to-cat", "cat-to-human"]);
      const text = optionalText(body.text, "text", 2e3);
      isDog = booleanValue(body.isDog, "isDog");
      const ai = getGeminiClient();
      let prompt = "";
      if (isDog) {
        prompt = mode === "human-to-cat" ? `You are a joyful, enthusiastic dog. Translate this human message into Dog Speak (woofs, borks, tail wags, zoomie energy). Human text: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}` : `You are translating dog barks into what the dog is REALLY thinking \u2014 joyful, loyal, squirrel-obsessed human thoughts. Dog sounds: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}`;
      } else {
        prompt = mode === "human-to-cat" ? `Translate this human message into Cat Speak (meows, purrs, claw taps, cat arrogance). Human text: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}` : `Translate these cat sounds into what the cat is REALLY thinking \u2014 sophisticated, sassy, regal human thoughts. Cat sounds: "${text}". Reply ONLY with valid JSON: {"translatedText":"...","catMood":"...","actionNote":"..."}`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              translatedText: { type: import_genai.Type.STRING },
              catMood: { type: import_genai.Type.STRING },
              actionNote: { type: import_genai.Type.STRING }
            },
            required: ["translatedText", "catMood", "actionNote"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: "invalid_request", message: error.message }
        });
      }
      console.error("Gemini Translator Error:", error);
      return res.status(500).json({
        error: "The translation service is temporarily unavailable.",
        translatedText: isDog ? mode === "human-to-cat" ? "WOOF WOOF *zooms around yard* (one word registered and it was WALK)." : 'Translation: "Did someone say TREAT?? I am SO ready. What are we doing."' : mode === "human-to-cat" ? "Meow prrrrr *slow blink* (Human, I acknowledged your attempt at communication)." : 'Translation: "Fill my bowl immediately or face 3 AM corridor zoomies."',
        catMood: isDog ? "Maximum Enthusiasm" : "Mildly Intrigued",
        actionNote: isDog ? "*vibrates with excitement*" : "*Tail flicks once*"
      });
    }
  });
  app.post("/api/gemini/cat-analyzer", async (req, res) => {
    try {
      const body = req.body || {};
      const image = imageInput(body.imageBase64, body.mimeType);
      const description = optionalText(body.description, "description", 2e3);
      const isDog = booleanValue(body.isDog, "isDog");
      const ai = getGeminiClient();
      let contents = [];
      if (image) {
        contents = [
          {
            inlineData: {
              mimeType: image.mimeType,
              data: image.data
            }
          },
          {
            text: isDog ? "Analyze this dog photo for The Dog Park. Rate its Goodness Level (0-100, higher = better good boy), Zoomie Rating, Inner Monologue, Breed Estimate, Mood Tag, Eyebrow Expressiveness Score, and a funny Dog Fun Fact." : "Analyze this cat photo for The Catwalk. Rate its Judgement Level (0-100), Loaf Form Rating, Inner Monologue, Breed Estimate, Mood Tag, Whiskers Score, and a funny Cat Fun Fact."
          }
        ];
      } else {
        contents = isDog ? `Analyze this dog description for The Dog Park: "${description || "A happy golden retriever doing maximum zoomies"}". Rate its Goodness Level (0-100), Zoomie Rating, Inner Monologue, Breed Estimate, Mood Tag, Eyebrow Expressiveness Score, and a funny Dog Fun Fact.` : `Analyze this cat description for The Catwalk: "${description || "An orange tabby cat sitting majestically in a cardboard box"}". Rate its Judgement Level (0-100), Loaf Form Rating, Inner Monologue, Breed Estimate, Mood Tag, Whiskers Score, and a funny Cat Fun Fact.`;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              judgementLevel: { type: import_genai.Type.INTEGER },
              loafFormRating: { type: import_genai.Type.STRING },
              innerMonologue: { type: import_genai.Type.STRING },
              breedEstimate: { type: import_genai.Type.STRING },
              moodTag: { type: import_genai.Type.STRING },
              whiskersScore: { type: import_genai.Type.STRING },
              funFact: { type: import_genai.Type.STRING }
            },
            required: [
              "judgementLevel",
              "loafFormRating",
              "innerMonologue",
              "breedEstimate",
              "moodTag",
              "whiskersScore",
              "funFact"
            ]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({
          error: { code: "invalid_request", message: error.message }
        });
      }
      console.error("Gemini Analyzer Error:", error);
      return res.status(500).json({
        judgementLevel: 94,
        loafFormRating: "9.9 / 10 Flawless Tuck",
        innerMonologue: "I am judging your life choices from this sunbeam.",
        breedEstimate: "Majestic Domestic Short Hair",
        moodTag: "Supreme Monarch",
        whiskersScore: "10/10 Perfect Symmetry",
        funFact: "Cats spend 70% of their lives sleeping and 30% judging humans."
      });
    }
  });
  app.use("/api", (_req, res) => {
    res.status(404).json({
      error: { code: "not_found", message: "The requested API endpoint does not exist." }
    });
  });
  const apiErrorHandler = (error, req, res, next) => {
    if (!req.path.startsWith("/api/")) {
      return next(error);
    }
    console.error("Unhandled API error:", error);
    if (error?.type === "entity.too.large") {
      return res.status(413).json({
        error: { code: "payload_too_large", message: "The request body is too large." }
      });
    }
    if (error instanceof SyntaxError && "body" in error) {
      return res.status(400).json({
        error: { code: "invalid_json", message: "The request body must contain valid JSON." }
      });
    }
    return res.status(500).json({
      error: { code: "internal_error", message: "The server could not process the request." }
    });
  };
  app.use(apiErrorHandler);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    const publicPath = import_path.default.join(process.cwd(), "public");
    app.use(import_express2.default.static(distPath, { index: false }));
    app.use(import_express2.default.static(publicPath, { index: false }));
    app.get("*", (req, res) => {
      const host = (req.hostname || "").toLowerCase();
      if (isLandingDomain(host)) {
        if (req.path === "/app" || req.path.startsWith("/app/")) {
          return res.sendFile(import_path.default.join(distPath, "index.html"));
        }
        return res.sendFile(import_path.default.join(publicPath, "pawprint_landing.html"));
      }
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  const server = app.listen(config.port, "0.0.0.0", () => {
    console.log(`\u{1F43E} \u{1F43E} The Catwalk (Pawprint Network) server listening on http://0.0.0.0:${config.port}`);
  });
  const shutdown = () => {
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}
startServer().catch(() => {
  console.error("Pawprint Network could not start. Check the server configuration and database logs.");
  process.exitCode = 1;
});
//# sourceMappingURL=server.cjs.map
