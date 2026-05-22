# Iron Road — Build Kanban

> Spec reference: [IRON_ROAD_SPEC.md](IRON_ROAD_SPEC.md)  
> Architecture: [README.md](README.md)

---

## Done

### Platform & loop
- [x] **Web app scaffold** — Vite/React/TS, dark UI, keyboard 1–4 choices [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Pure engine reducer** — seeded FNV RNG, d10 + tier bands §7.1 [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Full solo campaign skeleton** — title → difficulty → crew reveal → briefing → days/events → debrief → between missions → end §2
- [x] **Difficulty tables** — Green/Veteran/Fury mission counts, event ranges, anchor counts §2.2–2.3 [`src/engine/config.ts`](src/engine/config.ts)
- [x] **Season phase + day environment picker** — summer/autumn/winter/spring pools §2.4, §6.3 [`src/engine/generator.ts`](src/engine/generator.ts)
- [x] **Local save** — Zustand + `localStorage` [`src/store/gameStore.ts`](src/store/gameStore.ts)
- [x] **Static deploy path** — `npm run build` → `dist/`, Netlify config [`netlify.toml`](netlify.toml)
- [x] **Tests** — dice tiers, generator golden, reducer flow, Zod catalog validation

### Content (thin MVP — now significantly expanded, see Wave 6/7/ND entries below)
- [x] **~20 event templates** — all major event kinds represented §6.1 *(now 60+ events including npc_conversation kind)*
- [x] **7 historical anchors + 1 elite stub + 3 foot beats** §2.6, §8.2 *(now 10 anchors, 5 elites, 10 foot beats — see Wave 7-B + Phase 1)*
- [x] **Name/tank pools** — subset of spec §12 [`src/content/pools.ts`](src/content/pools.ts)

### Systems (stubbed — types/effects exist, mechanical logic incomplete)
- [x] **Crew generation** — 15 archetypes assigned, no quote engine §3.2–3.3
- [x] **Resources tracked** — ammo types, food, water, medkits §4.1
- [x] **Tank components + repair** — all 9 components, debrief repair action §5
- [x] **Trauma/charm/journal/seed effect ops** — in effects pipeline, not yet systemically triggered §3A, §3B
- [x] **Death → survivor covers role** — constitution penalty applied §9.2
- [x] **Foot mode** — 3 canned beats on hull=0%, skips debrief (fixed in Wave 1) §8.2

---

## Done (continued — Waves 1–5)

### Wave 1 — Core mechanics §3A, §4.3, §6.3, §10.2
- [x] **Trauma dice modifiers** — shellshocked −2, shaking −1, frozen forces worst choice, rage +1 §3A.2
- [x] **Constitution-gated trauma triggers** — post-event probabilistic trauma onset by constitution level §3A.1
- [x] **Crew support action** — once per event, +15–25 nerve, can clear minor trauma; forfeits supporter §3A.4
- [x] **Food/water attrition tick** — per-event HP + constitution drain when depleted §4.3
- [x] **Environment passive effects** — heat → water drain, blizzard → constitution, mud → track damage §6.3
- [x] **Seeded follow-up events** — flags inject follow-up events into the next mission §10.2
- [x] **Foot/debrief flow** — explicit no-depot narrative, replacement tank, stripped debrief after foot §8.2

### Wave 2 — Combat & campaign depth §4.2, §5, §7.2, §8.1, §9.1, §11.3
- [x] **Ammo type match bonus** — +2/−2 dice modifier when ideal ammo used/unavailable §4.2, §7.2
- [x] **Enemy difficulty modifiers** — `enemy` metadata on events, combat mod applied to dice §7.2
- [x] **Component cascade mods** — broken engine/tracks/gun affect driver/gunner dice §5
- [x] **`damage_random_component` effect** — hits roll which component takes damage §5
- [x] **Medkit healing** — loader-skill dice, 15–35 HP; wounded threshold constitution penalty §9.1
- [x] **Named scars** — `add_scar` effect; 3rd scar triggers death gamble §9.1a
- [x] **Brew-up survival rolls** — per-crew escape dice when tank hits 0%; burns, injuries §8.1
- [x] **Better debrief actions** — capped resupply, hull patch when nothing to repair, rest clears trauma §10.3
- [x] **Ending tone** — narrative branches on living crew count, solo survivor, hollow victory §11.3

### Wave 3 — Content & voice §3.3–3.4, §6, §10.2, §12
- [x] **Archetype quote engine** — `src/content/quotes.ts`; 6 moment types × 15 archetypes §3.3–3.4
- [x] **Expand event catalog** — 17 events (from ~9); 3 new combat types, scar event, social beats §6
- [x] **Between-mission social beats** — cards, letters, chaplain, rumors; fire after final debrief pick §10.2
- [x] **Expand name pools** — ~70 first names, ~40 last names, ~35 nicknames, ~28 tank names §12

### Wave 4 — Field Journal & discoveries §13, §3B, §14, §15
- [x] **Cross-campaign Field Journal** — `src/store/journalStore.ts`; separate `localStorage` key; crew fates, tank registry, moments §13
- [x] **Journal modal** — accessible from header; tabs for moments/crew/tanks; current campaign charms §13
- [x] **Charm use** — per-crew once-per-mission "Use charm"; archetype-keyed effects §3B
- [x] **Charm rarity catalog** — 9 charms across common/rare/elite; `rollCharmDrop` with event-type bias §14
- [x] **Famous combinations** — Fury tank/crew match, Lucky survivor, Cobra King; quiet journal entry §15

### Wave 5 — Polish & ship
- [x] **Mobile layout pass** — 44px+ touch targets, larger fonts on narrow screens, responsive flex
- [x] **Continue vs New run UX** — title screen shows Continue with tank/mission info; confirms overwrite
- [x] **Preserve session on Main menu** — `ABANDON_TO_TITLE` now preserves campaign state, restores exact `meta`
- [x] **CI** — GitHub Actions: type-check + test + build on push/PR (`.github/workflows/ci.yml`)

### Wave 6 — Economy, salvage catalog, scar system, social beats, PWA
- [x] **Salvage upgrade catalog** — ammo bundle, WP round, armor patch, field rations, intel brief (debrief actions) §10.3
- [x] **Charm drops after elite/anchor events** — deterministic seeded `rollCharmDrop` §14
- [x] **Scar dice modifiers** — `rolePenalty` on scar stored, applied in `applyChoice` §9.1a
- [x] **Loader ammo doctrine bonus** — optional `+1` when loader recommends ammo §4.2
- [x] **Interactive social beats** — `social_cards/letters/chaplain/rumor` with narrative + choice + outcome §10.2
- [x] **Tank replacement event** — `tank_replace_fork` with depot/capture/human moment branches §8.3
- [x] **Full foot event table** — 10 foot beats covering woods/fields/lines/bridge/sniper/farm/checkpoint/ditch/dog/gate §8.2
- [x] **PWA scaffold** — `manifest.webmanifest`, `sw.js` (network-first), service worker registration §1003
- [x] **Wave 6 tests** — `reducer.wave6.test.ts` covering trauma mods, doctrine bonus, attrition, seeded follow-ups

### Phase 1 — Choice overhaul
- [x] **All 7 original anchor events** expanded to 2–3 choices (commander/driver/loader angles) *(3 more anchors added in Wave 7-B, each authored with 3 choices)*
- [x] **All 10 foot beats** expanded to 2–3 choices (risk vs cautious branch)
- [x] **12 generic narrative/supply/rest events** expanded to 3 choices each
- [x] **10 generic combat/infantry/defensive events** expanded to 3–4 choices each
- [x] **3 elite encounters** expanded to 3 choices (aggressive/defensive/clever); `elite_night_ambush_stub` enemy metadata added
- [x] **4 social beats** expanded to 3 choices each (third crew voice per beat)

### Phase 2 — Balance pass
- [x] **`eventsPerDay` wired** — generator now builds per-day counts from `eventsPerDayMin/Max`, preventing 1-event days
- [x] **Salvage rebalance** — ammo bundle 2→3, intel brief 6→4, free resupply top-up reduced (AP +4→+2, HE +5→+3)
- [x] **`debriefPicks` per difficulty** — Green=2, Veteran=3, Fury=3; field added to `DifficultyProfile`

### Phase 3 — KANBAN refresh *(prior pass)*

### Phase 4 — PWA polish
- [x] **SVG icons 192×192 + 512×512** — iron-cross design in amber/dark palette; `public/icon-192.svg`, `public/icon-512.svg`
- [x] **Manifest updated** — `public/manifest.webmanifest` now references both icon sizes with `any maskable` purpose
- [x] **Cache-first service worker** — `public/sw.js` v2: precaches shell on install, cache-first for `/assets/` hashed bundles, network-first for navigation

### Phase 5 — Tank type selector §1003
- [x] **`pick_tank` phase** — inserted between `pick_difficulty` and `crew_reveal` in campaign flow [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Three tank types** — Sherman M4A3 / Churchill IV / T-34/85 each with distinct `startHealthPct`, `componentBonus`, ammo loadout deltas [`src/engine/config.ts`](src/engine/config.ts)
- [x] **`TankType` field on `GameState`** — `"sherman" | "churchill" | "t34"` tracked for future mechanical use [`src/engine/types.ts`](src/engine/types.ts)

### Phase 6 — Co-op scaffold §16
- [x] **`CoopSeat` type + `seats` on `GameState`** — optional array mapping playerIds to roles [`src/engine/types.ts`](src/engine/types.ts)
- [x] **`ASSIGN_ROLE` action** — updates seat list; sets `localPlayerId` on first assignment [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Role-ownership guard in `applyChoice`** — no-op when acting role belongs to a different player seat

---

## Done — Wave 7 (Archetype differentiation, new content, dynamic scars, condition warnings)

### Wave 7-A — Archetype mechanical differentiation
- [x] **`archetypeTraumaGuard` helper** — per-archetype trauma gate in `reducer.ts`
- [x] **The Kid** — Frozen threshold lowered to constitution < 25; constitution decay/recovery rate ×1.5
- [x] **The Veteran** — Frozen blocked until constitution ≤ 10; Numb duration extended
- [x] **The Dark Comedian** — Grief-Struck constitution hit doubled
- [x] **The Pragmatist** — Trauma suppressed until constitution ≤ 15, then multi-fire

### Wave 7-B — New event content
- [x] **3 new historical anchors** — `anchor_seine_crossing`, `anchor_cologne`, `anchor_ve_day` (3 choices each)
- [x] **2 new elite encounters** — `elite_remagen`, `elite_tiger_wallendorf` (3–4 choices each)
- [x] **4 new social beats** — `social_drunk`, `social_found_item`, `social_new_arrival`, `social_dog_returns`

### Wave 7-C — Dynamic scar naming
- [x] **`SCAR_NAME_POOLS`** — 5 categories × 6+ names in `pools.ts`
- [x] **`drawScarName` helper** — seeded draw in `effects.ts`
- [x] **`scarCategory` on `add_scar` effect** — optional field; name drawn at runtime when present

### Wave 7-D — Compound condition warnings
- [x] **`conditionWarning` helper** — checks dangerous environment × state pairs in `reducer.ts`
- [x] **Day-intro warning display** — amber italic line when compound risk detected in `GameRoot.tsx`

---

## Done — Narrative Depth (atmosphere, NPC dialogue, event rewrites, npc_conversation events)

### Schema + renderer
- [x] **nd-schema** — `atmosphere`, `preChoiceNpc`, `dialogueLine`, `npcReply`, `flavorOnly` added to `RuntimeEvent`/`EventChoice` types and Zod schema; `npc_conversation` added to `EventKind`
- [x] **nd-reducer** — `flavorOnly` choices skip dice + effects, go straight to outcome step
- [x] **nd-ui** — `atmosphere` renders as italic muted paragraph; `preChoiceNpc` renders as gold-bordered speech block; `dialogueLine` renders before outcome; `npcReply` renders as reply block; CSS classes added to `index.css`

### Briefings rewritten
- [x] **nd-briefings** — `briefing_generic` rewritten with atmosphere + preChoiceNpc; 3 new variants added (`briefing_attack`, `briefing_defense`, `briefing_pursuit`) with CO dialogue; generator randomly picks one per mission

### Event content
- [x] **nd-events-rewrite** — 12 events rewritten (`gen_travel_fork`, `gen_human_letters`, `gen_human_watch`, `gen_rest_coffee`, `gen_rest_smoke`, `gen_supply_risk`, `gen_supply_black_market`, `gen_radio_squeal`, `gen_travel_bridge_down`, `gen_travel_mine`, `gen_officer_roadblock`, `foot_farm`, `foot_checkpoint`, `foot_dog`) with atmosphere, two-paragraph narratives, dialogueLine, preChoiceNpc, npcReply
- [x] **nd-npc-events** — 10 new `npc_conversation` events written and added to `GENERIC_POOL`: `npc_local_woman`, `npc_local_kids`, `npc_officer_orders`, `npc_replacement_depot`, `npc_other_crew`, `npc_medic_check`, `npc_war_correspondent`, `npc_prisoner_moment`, `npc_padre_field`, `npc_old_farmer`
- [x] **nd-social-enrich** — 4 existing social beats (`social_cards`, `social_letters`, `social_chaplain`, `social_rumor`) enriched with atmosphere, preChoiceNpc (chaplain), richer outcome prose, and dialogueLines

---

## Next

- Performance pass — measure render time on large state; consider memo boundaries

---

## Backlog — Solo spec, later

- [ ] **Illustrated event cards** (spec deferred §1003)
- [ ] **Alternate theaters** — Pacific, North Africa (spec deferred §1003)

---

## Backlog — Co-op (after solo spec complete)

- [ ] **Role ownership + multi-seat UI** §16.1
- [ ] **Once-per-mission role abilities** §16.2
- [ ] **Hidden personal objectives** §16.3
- [ ] **Optional communication limits** §16.4

---

## Deferred (spec §1003 — track only, not v1)

- Full archetype quote libraries (all 15 × all moment types)
- Full charm codex UI
- Expanded famous-combination database
- Communication limits playtesting
