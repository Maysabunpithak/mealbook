# MealBook (Mini Project 2)
npm install && npm run dev  — ข้อมูลจาก TheMealDB (ไม่ต้องใช้ API key)

## Recipe community

Each recipe has a shared question/comment thread with one level of replies. Users enter a display name; names are not authenticated accounts. The interface polls for new comments every 15 seconds and preserves the message draft if submission fails.

- `npm run dev`: Vite serves both the app and `/api/community` on the same port. Restart an already-running dev server if the new endpoint is unavailable.
- `npm run build` then `npm start`: serves the built app and community API at `http://127.0.0.1:3001`.
- `npm run preview` also includes the community API for local review.
- All browsers using the **same server** share comments. For other devices on your network, start with `npm run dev -- --host 0.0.0.0` and open the computer's LAN address and displayed port. For `npm start`, set `HOST=0.0.0.0` and optionally `PORT` in the environment.
- Comments persist in `data/community/<mealId>.jsonl`, excluded from Git. Keep this directory on persistent storage and back it up. This implementation is for a single server instance; static-only hosting cannot run the community API. It does not yet include accounts, moderation, or reporting.
- Run API and recipe tests with `node --test tests/*.test.mjs`. API tests use temporary storage and leave real comments untouched.

## Inline Thai recipes

## Hosting on Sites

The production build emits `dist/client` and a Cloudflare-compatible worker in `dist/server`. Sites uses the `DB` D1 binding declared in `.openai/hosting.json` for shared, durable comments. Schema changes live in `db/schema.ts`; generate migrations with `npm run db:generate` before publishing. Local development continues to use JSONL storage, independently from the hosted database. The worker serves direct recipe links, recipe-specific social metadata, and the community API from one origin.

## Inline Thai recipes

Recipe pages and random recipe details translate ingredients and instructions into Thai automatically using MyMemory's public `get` API. The language toggle shows the original English at any time. Successful translation segments are cached in browser storage (up to 1,000 entries).

The anonymous service allows 5,000 characters per day, with a 500-byte request limit. Requests are split below that limit. When unavailable or over quota, the original recipe stays visible with a retry action. No API key is required; public recipe text is sent to the service. Translations are automatic, not editorially reviewed.

- API: https://mymemory.translated.net/doc/spec.php
- Limits: https://mymemory.translated.net/doc/usagelimits.php
"# mealbook" 
"# mealbook" 
"# mealbook" 
