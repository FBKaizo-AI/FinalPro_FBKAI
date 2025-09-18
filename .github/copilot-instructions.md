<!--
This file guides AI coding agents (Copilot, Code Assistants) working on the FBKaizo-AI repository.
Keep content short, factual, and tied to discoverable patterns in the codebase.
-->

# FBKaizo-AI — Copilot instructions

Quick orientation
- The project is a small Node.js + Express backend that serves a static frontend from `/public` and exposes a single main AI endpoint: `POST /api/ai-output` implemented in `Backend/ai-model.js`.
- Data is stored in MongoDB; Mongoose models live in `Backend/monster-model.js`. Level-scaling utility is in `Backend/lvlup-calculator-model.js`.

Where to look first (high-value files)
- `Backend/ai-model.js` — request flow, Fuse.js fuzzy search, context-building for Gemini, rate-limiting, and error handling. Use this file as the authoritative implementation for API behavior.
- `Backend/monster-model.js` — Mongoose schema and collection binding via `process.env.COLLECTION`.
- `Backend/lvlup-calculator-model.js` — example of a DB-connected utility that opens/closes mongoose connections and computes per-level stats.
- `docs/ai-model-docs.md` and `docs/comparison-docs.md` — higher-level descriptions of AI prompts, context format, and comparison algorithm (RGB similarity).
- `public/` — static frontend; `public/src/components` contains React components (e.g., `HomePage.jsx`, `Compare.jsx`) which call the backend endpoints.

Important architecture notes
- Single-process Express app: `Backend/ai-model.js` starts the server and serves static files from `../public`.
- AI integration: Gemini (Google Generative AI) is initialized with `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })` and called via `ai.models.generateContent({ model: 'gemini-2.5-flash', ... })`.
- Monster lookup: The flow is (1) load all monster names, (2) Fuse.js fuzzy match, (3) special-case queries (highest/lowest/gt's/ability), (4) regex fallback. Keep that order when modifying search behavior.
- DB connection strings are read from environment variables: `DUSTIN_MONGO`, `MARKELL_MONGO`, `JIYAH_MONGO` (checked in `ai-model.js`) and `MARKELL_MONGO` (used in `lvlup-calculator-model.js`). Don't hardcode URIs.

Developer workflows & commands
- Start backend server (project root): `node Backend/ai-model.js` (also defined as `start` in root `package.json`).
- Tests: No automated tests are configured in the root; `package.json` test scripts are placeholders. Use `Backend/lvlup-calculator-model.js` export (`getMonsterStatsAtLevel`) for local unit tests.
- Environment: create a `.env` with the expected variables: `GEMINI_API_KEY`, one of `DUSTIN_MONGO|MARKELL_MONGO|JIYAH_MONGO`, and `COLLECTION` for the monsters collection.

Project-specific conventions and patterns
- Mongoose schemas use human-readable keys (e.g., `"Monster Name"`) — query and field access in code uses those exact strings. When writing queries or transformations, use bracket notation `monster["Monster Name"]` or map to normalized keys.
- Many modules call `require('dotenv').config()` at file top. Ensure `.env` variables are available before connecting to DB or initializing AI clients.
- Rate limiting is conservative (20 req / 15 min). If adding tests that hit `/api/ai-output`, either stub the limiter or increase limits locally.

Integration points & external dependencies
- Google GenAI SDK: `@google/genai` (usage in `ai-model.js`). Watch for API errors and 429 rate-limit handling implemented in the catch block.
- MongoDB/Mongoose: multiple entry points connect directly (avoid concurrent connects). Prefer reusing a single connection where possible; `lvlup-calculator-model.js` currently connects and closes per call.
- Fuse.js fuzzy-search used for monster name matching (`fuse.js` import in `ai-model.js`).

Examples to copy from
- Context formatting for Gemini (in `Backend/ai-model.js`) — preserve the `Name / Class / Stats / Abilities` block structure when altering prompts.
- Stats scaling in `Backend/lvlup-calculator-model.js` — formula: `statAtLevel = base + GT * (level - 1)`.

Small safety rules for AI edits
- Do not add secrets in source files. Expect `.env` for keys and URIs.
- Preserve existing input sanitization (`escapeRegex`) and rate limiter when editing `ai-model.js` unless intentionally changing behavior and documenting it.
- When changing DB schema keys, update all usages that reference the human-readable field names.

If you modify behavior
- Update `docs/ai-model-docs.md` with prompt/response changes and include a short example request/response.

Contact points
- Authors listed in `README.md` (Front End: Jiyah Coleman; Backend: Dustin Peek & Markell Spann) — mention them in PRs if touching core AI prompt logic.

If anything is missing or ambiguous here, ask for the specific file or behavior to inspect and include example inputs/outputs you expect to change.
