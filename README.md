# Iron Road (web MVP)

Browser-based MVP for **Iron Road** — a text-forward WW2 tank crew survival campaign (STAR-authored beats; typically two short paragraphs per scene, not novel-length). Design reference: [IRON_ROAD_SPEC.md](IRON_ROAD_SPEC.md).

## What you’re actually shipping

This **is** a normal web game: after `npm run build`, the **`dist/`** folder is only static files (HTML, JS, CSS). **Players do not install Node.** They open an **`https://…` URL** in Safari, Chrome, etc. on a phone, tablet, or PC — same as any other website.

- **`npm run dev`** — for *you* while editing code on your computer (live reload).
- **`npm run build`** — produces the real site you **host** somewhere public.

You cannot reliably “email someone `index.html`” or double‑click it from a USB stick: browsers block or mishandle `file://` for modern JS apps. That limitation is universal for Vite/React games unless you wrap them in an app shell (Capacitor, TWA, etc.).

## Play on any device (get a public URL)

1. Run **`npm run build`** once (on any machine with Node — your dev PC is fine).
2. Upload the **`dist/`** folder to any static host. Examples:
   - **[Netlify Drop](https://app.netlify.com/drop)** — drag `dist` in; you get `https://something.netlify.app` in seconds (works on mobile).
   - **Vercel / Cloudflare Pages** — connect the Git repo; they detect Vite and publish `dist` (see [`netlify.toml`](netlify.toml) for an equivalent Netlify config).
   - **Your own server** — copy `dist/*` into the web root; ensure the site is served over **HTTPS** (recommended for `localStorage`).

Saves use **per‑origin** `localStorage` (same as many web games): `yoursite.com` and `yoursite.netlify.app` are different saves.

## Local development only

**Do not open the project’s raw `index.html` from disk** (`file://`) while developing — Vite hasn’t compiled TypeScript yet, so the page stays blank. Use:

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. `http://localhost:5173`). For a local production check: `npm run build` then `npm run preview`.

## Scripts

- `npm run dev` — Vite dev server (developers)
- `npm run build` — production bundle → **`dist/`** (what you deploy)
- `npm run preview` — serve `dist` locally over HTTP
- `npm test` — Vitest (dice, generator golden checks, reducer flow, Zod catalog)

## Architecture

- **Engine** (`src/engine/`): pure `reduceGame` state machine, FNV-seeded RNG, d10 + tier resolution, effect interpreter, mission generator.
- **Content** (`src/content/`): `EVENT_CATALOG` plus name pools; events are cloned and templated at runtime.
- **UI** (`src/ui/`): `GameRoot` reads `meta` phase; keyboard **1–4** map to choices. During play, `PlayShell` order is: **sticky top** (tank+hull left, mission/world right, scroll-capped **situation log**), **main beat**, then **unit roster** (one supplies line + tank/crew cards with health/nerve bars). See spec **§12A** for layout and data sources. Pre-choice stakes are qualitative; numeric deltas appear in **Aftermath** (`OutcomePanel` + `outcomeSummary.ts`).
- **Save** (`src/store/gameStore.ts`): Zustand + `localStorage` under `iron-road-save-v1`.

## Build kanban

Feature status by spec section: [KANBAN.md](KANBAN.md)

## Adding an event

1. Add an entry to `EVENT_CATALOG` in [src/content/eventsCatalog.ts](src/content/eventsCatalog.ts) (copy an existing block).
2. Use `{tank}`, `{objective}`, `{cmd}`, `{gnr}`, `{drv}`, `{asst}`, `{ldr}`, `{kid}`, `{cyn}` placeholders; they are filled in [src/engine/template.ts](src/engine/template.ts).
3. Optionally add the id to `GENERIC_POOL` or the anchor list in [src/content/pools.ts](src/content/pools.ts).
4. Run `npm test` — catalog entries are validated with Zod.

## Event pool sizes (Wave 19)

Counts live in source: Tier-1 `GENERIC_POOL` and Tier-2 `GENERIC_POOL_TIER2` in [poolKinds.ts](src/content/poolKinds.ts) (re-exported from [eventsCatalog.ts](src/content/eventsCatalog.ts); Tier-2 in [wave16Events.ts](src/content/wave16Events.ts) + [wave19Events.ts](src/content/wave19Events.ts), Wave 18/19 Tier-1 in [wave18Events.ts](src/content/wave18Events.ts) / [wave19Events.ts](src/content/wave19Events.ts)), `SOCIAL_BEAT_POOL` in [eventsCatalog.ts](src/content/eventsCatalog.ts), `ANCHOR_IDS` in [pools.ts](src/content/pools.ts). Campaign generation uses **campaign-level dedupe** (§2.9): anchors once per run; Tier-1 fillers drawn without replacement, then Tier-2 when Fury/long runs exhaust Tier-1; per-mission travel/human/elite soft quotas apply across both tiers.

**Diversity / coverage check:** `npm test -- src/engine/generator.test.ts src/content/poolKinds.test.ts src/content/eventsCatalog.test.ts src/content/catalogProseLint.test.ts src/content/starProseLint.test.ts src/content/starTravelSupply.test.ts src/content/missionBrief.test.ts src/engine/reducer.narrativeFlow.test.ts src/engine/campaignCalendar.test.ts src/engine/reducer.encounterDepth.test.ts src/engine/reducer.trauma.test.ts` — Tier-1 ≥125, Tier-2 ≥55, combined ≥180, anchors ≥20, social ≥20, STAR prose patch compliance, mission brief + area entry flow, disjoint pools, encounter follow-up depth, Fury tier-2 on second pass, season-env matrix on all mission days, `measureFillerCoverage`, kind-mix per mission, seeded foot beat order.

**Mission overview calendar (v0.17):** fictional weekday + month/day in the status bar during play; see [`src/engine/campaignCalendar.ts`](src/engine/campaignCalendar.ts).

**Command succession (v0.14):** When the commander is KIA, the highest surviving rank becomes the crew’s narrative voice (`{cmd}` in events, quotes, briefings). Solo role-gated choices are unchanged; the HUD shows an **Acting** tag on the voice leader.
